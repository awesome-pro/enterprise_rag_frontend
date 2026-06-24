import type { RoleInfo } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

export async function fetchRoles(): Promise<RoleInfo[]> {
  const res = await fetch(`${API}/roles`);
  const data = await res.json();
  return data.roles;
}

/**
 * Liveness + identity probe for the header status dot. We hit /roles (not the
 * generic /health) so a *different* app squatting on the port — which may also have
 * a /health route — doesn't show a false "online". /roles is unique to this API.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API}/roles`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data?.roles);
  } catch {
    return false;
  }
}

type EventHandler = (event: string, data: any) => void;

/**
 * POST /query and parse the Server-Sent Events stream (EventSource only
 * supports GET, so we read the response body ourselves).
 */
export async function streamQuery(
  body: { query: string; role: string; history?: { role: string; content: string }[] },
  onEvent: EventHandler,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${API}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  // A wrong/stale backend (e.g. old code with no /query route) returns a
  // non-2xx JSON body, not an SSE stream. Surface it instead of hanging.
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `API ${res.status} ${res.statusText}${text ? ` — ${text.slice(0, 200)}` : ""}`,
    );
  }
  const ctype = res.headers.get("content-type") ?? "";
  if (!ctype.includes("text/event-stream")) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Expected an SSE stream but got "${ctype}". Is the right backend running on :8001? ${text.slice(0, 200)}`,
    );
  }
  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let sawFinal = false;
  const counts: Record<string, number> = {};

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    // sse_starlette emits CRLF line endings, so frames are separated by
    // "\r\n\r\n". Strip every CR so the "\n\n" split below works (and so a CR
    // split across chunk boundaries can't break pairing). Safe: raw CR only
    // appears in line endings here — JSON in `data:` escapes its own as "\\r".
    buf += decoder.decode(value, { stream: true }).replace(/\r/g, "");

    let sep: number;
    while ((sep = buf.indexOf("\n\n")) !== -1) {
      const raw = buf.slice(0, sep);
      buf = buf.slice(sep + 2);

      let event = "message";
      let data = "";
      for (const line of raw.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue; // keep-alive / comment frame

      // Parse first. A genuine malformed frame is a keep-alive — skip it.
      let payload: unknown;
      try {
        payload = JSON.parse(data);
      } catch {
        continue;
      }
      counts[event] = (counts[event] ?? 0) + 1;
      // Mark terminal state BEFORE dispatching, so a throw in the React
      // handler can't make us report "stream ended early" for a stream that
      // actually completed.
      if (event === "final") sawFinal = true;
      try {
        onEvent(event, payload);
      } catch (e) {
        console.error(`[streamQuery] handler threw for "${event}":`, e);
      }
    }
  }

  console.debug("[streamQuery] stream closed. event counts:", counts, "sawFinal:", sawFinal);
  // Stream closed without a terminal event — don't leave the UI spinning.
  if (!sawFinal) {
    throw new Error(
      `Stream ended before a final answer was received. Frames seen: ${JSON.stringify(counts)}`,
    );
  }
}

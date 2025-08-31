const rateLimit = new Map();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  const entry = rateLimit.get(ip) || { count: 0, ts: now };
  if (now - entry.ts > 60_000) {
    entry.count = 0;
    entry.ts = now;
  }
  if (entry.count >= 5) {
    res.statusCode = 429;
    res.end(JSON.stringify({ error: "Too many requests" }));
    return;
  }
  entry.count++;
  rateLimit.set(ip, entry);

  let body = "";
  for await (const chunk of req) {
    body += chunk;
  }
  let email = "";
  try {
    email = JSON.parse(body).email;
  } catch (e) {
    // ignore
  }
  if (!email) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Email required" }));
    return;
  }

  // Placeholder: normally store email or forward to a service.
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: true }));
}

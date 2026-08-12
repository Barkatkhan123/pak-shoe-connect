import server from "../dist/server/server.js";

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  try {
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const fullUrl = new URL(req.url || "/", `${protocol}://${host}`);

    let bodyBuffer: Buffer | null = null;
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method || "")) {
      if (req.body && typeof req.body === "object" && Buffer.isBuffer(req.body)) {
        bodyBuffer = req.body;
      } else if (req.body && typeof req.body === "string") {
        bodyBuffer = Buffer.from(req.body);
      } else if (req.body && typeof req.body === "object") {
        bodyBuffer = Buffer.from(JSON.stringify(req.body));
      } else {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
        }
        if (chunks.length > 0) {
          bodyBuffer = Buffer.concat(chunks);
        }
      }
    }

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        } else {
          headers.set(key, String(value));
        }
      }
    }

    const webRequest = new Request(fullUrl.toString(), {
      method: req.method || "GET",
      headers,
      body: bodyBuffer && bodyBuffer.length > 0 ? (bodyBuffer as unknown as BodyInit) : undefined,
    });

    const response = await server.fetch(webRequest, {}, {});

    res.statusCode = response.status;
    response.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });

    const arrayBuffer = await response.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error("Vercel Serverless Function Error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Internal Server Error", message: err?.message || String(err) }));
  }
}

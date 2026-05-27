import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      method,
      url,
      headers = {},
      body,
    } = req.body;

    if (!url) {
      return res.status(400).json({
        error: "URL is required",
      });
    }

    const blockedHosts = [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      "::1",
    ];

    const parsedUrl = new URL(url);

    if (
      blockedHosts.includes(parsedUrl.hostname)
    ) {
      return res.status(400).json({
        error: "Blocked host",
      });
    }

    const started = performance.now();

    const response = await fetch(url, {
      method: method || "GET",

      headers,

      body: ["GET", "HEAD"].includes(
        method?.toUpperCase()
      )
        ? undefined
        : body,
    });

    const text = await response.text();

    const responseHeaders: Record<
      string,
      string
    > = {};

    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return res.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: text,
      durationMs: Math.round(
        performance.now() - started
      ),
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Proxy failed",
    });
  }
});

export default router;
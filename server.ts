import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API / Proxy routes first to avoid Vite interference
  
  // Proxy for TradingView Charting Library to resolve same-origin security policy
  app.get("/charting_library/*", async (req, res) => {
    try {
      const targetUrl = `https://charting-library.tradingview-widget.com${req.originalUrl}`;
      const response = await fetch(targetUrl, {
        headers: {
          "Referer": "https://charting-library.tradingview-widget.com/",
          "User-Agent": req.headers["user-agent"] || "",
        }
      });

      if (!response.ok) {
        res.status(response.status).send(`Failed to proxy: ${response.statusText}`);
        return;
      }

      const contentType = response.headers.get("content-type");
      if (contentType) {
        res.setHeader("content-type", contentType);
      }
      const cacheControl = response.headers.get("cache-control");
      if (cacheControl) {
        res.setHeader("cache-control", cacheControl);
      }

      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error("Proxy error for charting_library:", error);
      res.status(500).send(`Proxy error: ${error.message}`);
    }
  });

  // Proxy for TradingView UDF Datafeed files
  app.get("/datafeeds/*", async (req, res) => {
    try {
      const targetUrl = `https://charting-library.tradingview-widget.com${req.originalUrl}`;
      const response = await fetch(targetUrl, {
        headers: {
          "Referer": "https://charting-library.tradingview-widget.com/",
          "User-Agent": req.headers["user-agent"] || "",
        }
      });

      if (!response.ok) {
        res.status(response.status).send(`Failed to proxy: ${response.statusText}`);
        return;
      }

      const contentType = response.headers.get("content-type");
      if (contentType) {
        res.setHeader("content-type", contentType);
      }
      const cacheControl = response.headers.get("cache-control");
      if (cacheControl) {
        res.setHeader("cache-control", cacheControl);
      }

      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error("Proxy error for datafeeds:", error);
      res.status(500).send(`Proxy error: ${error.message}`);
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

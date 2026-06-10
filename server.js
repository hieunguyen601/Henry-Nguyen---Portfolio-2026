const http = require("http");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  try {
    fs.readFileSync(".env.local", "utf8")
      .split("\n")
      .forEach((line) => {
        const m = line.match(/^([^#=\s][^=]*)="?([^"]*)"?/);
        if (m) process.env[m[1].trim()] = m[2].trim();
      });
  } catch {}
}
loadEnv();

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const SP_PATHS = {
  "currently-playing": "/me/player/currently-playing",
  "recently-played": "/me/player/recently-played?limit=15",
  "top-tracks": "/me/top/tracks?limit=10&time_range=short_term",
};

async function getToken() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
    process.env;
  const basic = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
  ).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });
  return (await res.json()).access_token;
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost:3000");

    if (url.pathname === "/api/spotify") {
      res.setHeader("Content-Type", "application/json");
      const spPath = SP_PATHS[url.searchParams.get("endpoint")];
      if (!spPath) {
        res.writeHead(400);
        res.end("{}");
        return;
      }
      try {
        const token = await getToken();
        const r = await fetch(`https://api.spotify.com/v1${spPath}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r.status === 204) {
          res.end(JSON.stringify({ is_playing: false }));
          return;
        }
        res.end(JSON.stringify(await r.json()));
      } catch {
        res.writeHead(500);
        res.end("{}");
      }
      return;
    }

    const filePath = path.join(
      __dirname,
      url.pathname === "/" ? "mainPage.html" : url.pathname,
    );
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": MIME[path.extname(filePath)] || "text/plain",
      });
      res.end(data);
    });
  })
  .listen(3000, () => console.log("Open: http://localhost:3000/mainPage.html"));

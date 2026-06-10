const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

const ENDPOINTS = {
  "currently-playing": "/me/player/currently-playing",
  "recently-played": "/me/player/recently-played?limit=15",
  "top-tracks": "/me/top/tracks?limit=10&time_range=short_term",
};

async function getAccessToken() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
    process.env;
  const basic = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch(TOKEN_ENDPOINT, {
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

  const data = await res.json();
  return data.access_token;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();

  const path = ENDPOINTS[req.query.endpoint];
  if (!path) return res.status(400).json({ error: "Invalid endpoint" });

  try {
    const token = await getAccessToken();
    const spotifyRes = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (spotifyRes.status === 204)
      return res.status(200).json({ is_playing: false });
    const data = await spotifyRes.json();
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ error: "Failed to fetch Spotify data" });
  }
};

export default async function handler(req, res) {
  try {
    const { query } = req.query;
    const apiKey = process.env.TMDB_API_KEY;

    if (!query) {
      return res.status(400).json({ error: "Missing query parameter" });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "API key missing on server" });
    }

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

    const tmdbRes = await fetch(url);
    const data = await tmdbRes.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Movie ID is required" });
    }

    const url = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${process.env.TMDB_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch trailer" });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("TRAILER API ERROR:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

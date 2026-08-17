module.exports = async (req, res) => {
  const API_KEY = process.env.API_FOOTBALL_KEY;
  const country = (req.query.country || "").trim();

  if (!API_KEY) { res.status(500).json({ error: "Variable d'environnement API_FOOTBALL_KEY manquante." }); return; }
  if (!country) { res.status(400).json({ error: "Paramètre country manquant." }); return; }

  try {
    const headers = { "x-apisports-key": API_KEY };
    const r = await fetch(`https://v3.football.api-sports.io/leagues?country=${encodeURIComponent(country)}`, { headers });
    const rateLimit = { remaining: r.headers.get("x-ratelimit-requests-remaining"), limit: r.headers.get("x-ratelimit-requests-limit") };
    if (r.status === 429) { res.status(429).json({ error: "Quota API épuisé pour aujourd'hui (429).", rateLimit }); return; }
    const data = await r.json();

    const leagues = (data.response || [])
      .filter((x) => x.league.type === "League")
      .map((x) => ({ id: x.league.id, name: x.league.name, logo: x.league.logo }))
      .slice(0, 8);

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.status(200).json({ leagues, rateLimit });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erreur serveur inconnue." });
  }
};

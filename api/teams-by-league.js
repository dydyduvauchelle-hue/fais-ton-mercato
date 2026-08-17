module.exports = async (req, res) => {
  const API_KEY = process.env.API_FOOTBALL_KEY;
  const league = (req.query.league || "").trim();

  if (!API_KEY) { res.status(500).json({ error: "Variable d'environnement API_FOOTBALL_KEY manquante." }); return; }
  if (!league) { res.status(400).json({ error: "Paramètre league manquant." }); return; }

  try {
    const headers = { "x-apisports-key": API_KEY };
    const seasons = [2026, 2025, 2024, 2023];
    let teams = [];
    let seasonUsed = null;

    for (const season of seasons) {
      const r = await fetch(`https://v3.football.api-sports.io/teams?league=${encodeURIComponent(league)}&season=${season}`, { headers });
      const data = await r.json();
      if (data?.response?.length) {
        teams = data.response.map((x) => ({ id: x.team.id, name: x.team.name, logo: x.team.logo }));
        seasonUsed = season;
        break;
      }
    }

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.status(200).json({ teams, seasonUsed });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erreur serveur inconnue." });
  }
};

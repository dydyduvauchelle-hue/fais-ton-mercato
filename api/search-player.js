// Recherche un joueur par nom via API-Football et renvoie jusqu'à 5 correspondances
// avec photo, poste, âge, club actuel — pour l'autofill du formulaire d'ajout.

module.exports = async (req, res) => {
  const API_KEY = process.env.API_FOOTBALL_KEY;
  const q = (req.query.q || "").trim();

  if (!API_KEY) { res.status(500).json({ error: "Variable d'environnement API_FOOTBALL_KEY manquante." }); return; }
  if (q.length < 3) { res.status(400).json({ error: "Recherche trop courte (3 caractères minimum)." }); return; }

  try {
    const headers = { "x-apisports-key": API_KEY };
    const seasons = [2025, 2024, 2023];
    let results = [];
    let seasonUsed = null;
    let rateLimit = null;

    for (const season of seasons) {
      const r = await fetch(`https://v3.football.api-sports.io/players?search=${encodeURIComponent(q)}&season=${season}`, { headers });
      rateLimit = { remaining: r.headers.get("x-ratelimit-requests-remaining"), limit: r.headers.get("x-ratelimit-requests-limit") };
      if (r.status === 429) { res.status(429).json({ error: "Quota API épuisé pour aujourd'hui (429).", rateLimit }); return; }
      const data = await r.json();
      if (data?.response?.length) { results = data.response; seasonUsed = season; break; }
    }

    const mapped = results.slice(0, 5).map((r) => {
      const stat = r.statistics && r.statistics[0];
      return {
        id: r.player.id,
        name: r.player.name,
        age: r.player.age,
        photo: r.player.photo,
        position: stat && stat.games ? stat.games.position : null,
        number: stat && stat.games ? stat.games.number : null,
        team: stat && stat.team ? stat.team.name : null,
      };
    });

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.status(200).json({ results: mapped, seasonUsed, rateLimit });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erreur serveur inconnue." });
  }
};

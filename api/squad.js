// Fonction serveur (Vercel Function). Tourne côté serveur, jamais dans le
// navigateur : la clé API n'est donc jamais visible par les visiteurs du site.
// La clé est lue depuis une variable d'environnement Vercel nommée
// API_FOOTBALL_KEY (à configurer dans Vercel > Settings > Environment Variables).

module.exports = async (req, res) => {
  const API_KEY = process.env.API_FOOTBALL_KEY;
  const teamName = (req.query.team || "").trim();
  const teamId = (req.query.teamId || "").trim();

  if (!API_KEY) {
    res.status(500).json({ error: "Variable d'environnement API_FOOTBALL_KEY manquante sur Vercel." });
    return;
  }
  if (!teamName && !teamId) {
    res.status(400).json({ error: "Paramètre team ou teamId manquant." });
    return;
  }

  try {
    const headers = { "x-apisports-key": API_KEY };
    let teamObj;
    let rl = null;
    const readRL = (r) => ({ remaining: r.headers.get("x-ratelimit-requests-remaining"), limit: r.headers.get("x-ratelimit-requests-limit") });

    if (teamId) {
      const r = await fetch(`https://v3.football.api-sports.io/teams?id=${encodeURIComponent(teamId)}`, { headers });
      rl = readRL(r);
      if (r.status === 429) { res.status(429).json({ error: "Service momentanément indisponible, réessaie dans un instant.", rateLimit: rl }); return; }
      const d = await r.json();
      teamObj = d?.response?.[0]?.team;
    } else {
      const r = await fetch(`https://v3.football.api-sports.io/teams?name=${encodeURIComponent(teamName)}`, { headers });
      rl = readRL(r);
      if (r.status === 429) { res.status(429).json({ error: "Service momentanément indisponible, réessaie dans un instant.", rateLimit: rl }); return; }
      const d = await r.json();
      teamObj = d?.response?.[0]?.team;
    }
    if (!teamObj) {
      res.status(404).json({ error: "Équipe introuvable dans la réponse API-Football.", rateLimit: rl });
      return;
    }

    const [squadRes, coachRes] = await Promise.all([
      fetch(`https://v3.football.api-sports.io/players/squads?team=${teamObj.id}`, { headers }),
      fetch(`https://v3.football.api-sports.io/coachs?team=${teamObj.id}`, { headers }),
    ]);
    rl = readRL(squadRes);
    if (squadRes.status === 429) { res.status(429).json({ error: "Service momentanément indisponible, réessaie dans un instant.", rateLimit: rl }); return; }
    const squadData = await squadRes.json();
    const coachData = await coachRes.json();
    const players = squadData?.response?.[0]?.players || [];
    const coach = coachData?.response?.[0]?.name || null;

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.status(200).json({ team: teamObj, players, coach, rateLimit: rl });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erreur serveur inconnue." });
  }
};

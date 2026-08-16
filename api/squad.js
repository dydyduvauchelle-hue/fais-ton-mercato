// Fonction serveur (Vercel Function). Tourne côté serveur, jamais dans le
// navigateur : la clé API n'est donc jamais visible par les visiteurs du site.
// La clé est lue depuis une variable d'environnement Vercel nommée
// API_FOOTBALL_KEY (à configurer dans Vercel > Settings > Environment Variables).

module.exports = async (req, res) => {
  const API_KEY = process.env.API_FOOTBALL_KEY;

  if (!API_KEY) {
    res.status(500).json({ error: "Variable d'environnement API_FOOTBALL_KEY manquante sur Vercel." });
    return;
  }

  try {
    const headers = { "x-apisports-key": API_KEY };

    const teamRes = await fetch("https://v3.football.api-sports.io/teams?name=Marseille", { headers });
    const teamData = await teamRes.json();
    const team = teamData?.response?.[0]?.team;
    if (!team) {
      res.status(404).json({ error: "Équipe introuvable dans la réponse API-Football." });
      return;
    }

    const squadRes = await fetch(`https://v3.football.api-sports.io/players/squads?team=${team.id}`, { headers });
    const squadData = await squadRes.json();
    const players = squadData?.response?.[0]?.players || [];

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate"); // évite de re-consommer le quota à chaque visite
    res.status(200).json({ team, players });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erreur serveur inconnue." });
  }
};

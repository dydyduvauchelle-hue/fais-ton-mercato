const BASE = "https://api.sportmonks.com/v3/football";

module.exports = async (req, res) => {
  const TOKEN = process.env.SPORTMONKS_API_TOKEN;
  const leagueName = (req.query.league || "").trim();

  if (!TOKEN) { res.status(500).json({ error: "Variable d'environnement SPORTMONKS_API_TOKEN manquante." }); return; }
  if (!leagueName) { res.status(400).json({ error: "Paramètre league manquant." }); return; }

  try {
    const lr = await fetch(`${BASE}/leagues/search/${encodeURIComponent(leagueName)}?api_token=${TOKEN}&include=currentSeason`);
    const ld = await lr.json();
    if (!lr.ok) throw new Error(ld.message || `Erreur Sportmonks (${lr.status}) sur la recherche de division.`);
    const league = (ld.data || [])[0];
    if (!league) { res.status(404).json({ error: `Division "${leagueName}" introuvable via Sportmonks.` }); return; }

    const seasonId = league.currentseason?.id || league.current_season_id;
    if (!seasonId) { res.status(404).json({ error: "Saison actuelle introuvable pour cette division." }); return; }

    const tr = await fetch(`${BASE}/teams/seasons/${seasonId}?api_token=${TOKEN}`);
    const td = await tr.json();
    if (!tr.ok) throw new Error(td.message || `Erreur Sportmonks (${tr.status}) sur la liste des clubs.`);

    const teams = (td.data || []).map((t) => ({ id: t.id, name: t.name, logo: t.image_path }));

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.status(200).json({ teams });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erreur serveur inconnue." });
  }
};

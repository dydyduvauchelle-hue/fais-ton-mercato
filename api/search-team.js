const BASE = "https://api.sportmonks.com/v3/football";

module.exports = async (req, res) => {
  const TOKEN = process.env.SPORTMONKS_API_TOKEN;
  const q = (req.query.q || "").trim();

  if (!TOKEN) { res.status(500).json({ error: "Variable d'environnement SPORTMONKS_API_TOKEN manquante." }); return; }
  if (q.length < 3) { res.status(400).json({ error: "Recherche trop courte (3 caractères minimum)." }); return; }

  try {
    const r = await fetch(`${BASE}/teams/search/${encodeURIComponent(q)}?api_token=${TOKEN}`);
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || `Erreur Sportmonks (${r.status}).`);

    const results = (data.data || []).slice(0, 8).map((t) => ({ id: t.id, name: t.name, logo: t.image_path }));

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.status(200).json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erreur serveur inconnue." });
  }
};

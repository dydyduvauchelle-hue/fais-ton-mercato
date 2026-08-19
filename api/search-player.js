const BASE = "https://api.sportmonks.com/v3/football";

function normalizeCat(posName) {
  const p = (posName || "").toLowerCase();
  if (p.includes("keeper")) return "GK";
  if (p.includes("back") || p.includes("defen")) return "DEF";
  if (p.includes("midfield")) return "MID";
  if (p.includes("wing") || p.includes("forward") || p.includes("striker") || p.includes("attack")) return "FWD";
  return "MID";
}
function ageFromDOB(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return diff > 0 ? Math.floor(diff / 31557600000) : null;
}

module.exports = async (req, res) => {
  const TOKEN = process.env.SPORTMONKS_API_TOKEN;
  const q = (req.query.q || "").trim();

  if (!TOKEN) { res.status(500).json({ error: "Variable d'environnement SPORTMONKS_API_TOKEN manquante." }); return; }
  if (q.length < 3) { res.status(400).json({ error: "Recherche trop courte (3 caractères minimum)." }); return; }

  try {
    const r = await fetch(`${BASE}/players/search/${encodeURIComponent(q)}?api_token=${TOKEN}&include=position;teams.team`);
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || `Erreur Sportmonks (${r.status}).`);

    const results = await Promise.all((data.data || []).slice(0, 5).map(async (p) => {
      const currentTeam = (p.teams || []).find((t) => !t.end) || (p.teams || [])[0];
      let number = null;
      if (currentTeam?.team?.id) {
        try {
          const sr = await fetch(`${BASE}/squads/teams/${currentTeam.team.id}?api_token=${TOKEN}`);
          const sd = await sr.json();
          const entry = (sd.data || []).find((s) => s.player_id === p.id || s.player?.id === p.id);
          if (entry) number = entry.jersey_number || null;
        } catch (e) {}
      }
      return {
        id: p.id,
        name: p.display_name || p.name,
        age: ageFromDOB(p.date_of_birth),
        photo: p.image_path || null,
        position: normalizeCat(p.position?.name),
        number,
        team: currentTeam?.team?.name || null,
      };
    }));

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.status(200).json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erreur serveur inconnue." });
  }
};

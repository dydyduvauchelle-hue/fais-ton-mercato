const BASE = "https://api.sportmonks.com/v3/football";

function normalizeCat(posName) {
  const p = (posName || "").toLowerCase();
  if (p.includes("keeper")) return "GK";
  if (p.includes("back") || p.includes("defen")) return "DEF";
  if (p.includes("midfield")) return "MID";
  if (p.includes("wing") || p.includes("forward") || p.includes("striker") || p.includes("attack")) return "FWD";
  return "MID";
}
function subPosCode(posName) {
  const p = (posName || "").toLowerCase();
  if (!p) return "";
  if (p.includes("keeper")) return "G";
  if (p.includes("right-back") || p.includes("right back")) return "DD";
  if (p.includes("left-back") || p.includes("left back")) return "DG";
  if (p.includes("centre-back") || p.includes("center-back") || p.includes("centre back")) return "DC";
  if (p.includes("defensive midfield")) return "MDC";
  if (p.includes("attacking midfield")) return "MOC";
  if (p.includes("central midfield") || p.includes("centre midfield")) return "MC";
  if (p.includes("right midfield")) return "MD";
  if (p.includes("left midfield")) return "MG";
  if (p.includes("right wing")) return "AD";
  if (p.includes("left wing")) return "AG";
  if (p.includes("second striker")) return "SA";
  if (p.includes("centre-forward") || p.includes("striker") || p.includes("forward")) return "BU";
  if (p.includes("defen")) return "DC";
  if (p.includes("midfield")) return "MC";
  if (p.includes("attack")) return "AT";
  return "";
}
function ageFromDOB(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return diff > 0 ? Math.floor(diff / 31557600000) : null;
}

module.exports = async (req, res) => {
  const TOKEN = process.env.SPORTMONKS_API_TOKEN;
  const q = (req.query.q || "").trim();
  const clubFilter = (req.query.club || "").trim().toLowerCase();
  const natFilter = (req.query.nat || "").trim().toLowerCase();

  if (!TOKEN) { res.status(500).json({ error: "Variable d'environnement SPORTMONKS_API_TOKEN manquante." }); return; }
  if (q.length < 3) { res.status(400).json({ error: "Recherche trop courte (3 caractères minimum)." }); return; }

  try {
    const r = await fetch(`${BASE}/players/search/${encodeURIComponent(q)}?api_token=${TOKEN}&include=position;detailedPosition;teams.team;nationality`);
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || `Erreur Sportmonks (${r.status}).`);

    let candidates = (data.data || []).map((p) => {
      const currentTeam = (p.teams || []).find((t) => !t.end) || (p.teams || [])[0];
      return { raw: p, currentTeam, teamName: currentTeam?.team?.name || "", natName: p.nationality?.name || "" };
    });

    if (clubFilter) candidates = candidates.filter((c) => c.teamName.toLowerCase().includes(clubFilter));
    if (natFilter) candidates = candidates.filter((c) => c.natName.toLowerCase().includes(natFilter));

    candidates = candidates.slice(0, 20);

    const results = await Promise.all(candidates.map(async ({ raw: p, currentTeam }) => {
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
        subPos: subPosCode(p.detailedPosition?.name || p.position?.name),
        number,
        team: currentTeam?.team?.name || null,
        nationality: p.nationality?.name || null,
        flagCode: (p.nationality?.iso2 || "").toLowerCase() || null,
      };
    }));

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.status(200).json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erreur serveur inconnue." });
  }
};

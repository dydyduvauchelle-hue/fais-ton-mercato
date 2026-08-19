// Fonction serveur (Vercel Function). Le token Sportmonks reste côté serveur,
// jamais visible du navigateur. Variable d'environnement : SPORTMONKS_API_TOKEN
// (à configurer dans Vercel > Settings > Environment Variables).

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
  const teamName = (req.query.team || "").trim();
  const teamId = (req.query.teamId || "").trim();

  if (!TOKEN) {
    res.status(500).json({ error: "Variable d'environnement SPORTMONKS_API_TOKEN manquante sur Vercel." });
    return;
  }
  if (!teamName && !teamId) {
    res.status(400).json({ error: "Paramètre team ou teamId manquant." });
    return;
  }

  try {
    let id = teamId;
    let fallbackName = teamName;
    let fallbackLogo = null;

    if (!id) {
      const r = await fetch(`${BASE}/teams/search/${encodeURIComponent(teamName)}?api_token=${TOKEN}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || `Erreur Sportmonks (${r.status}) lors de la recherche d'équipe.`);
      const t = d?.data?.[0];
      if (!t) { res.status(404).json({ error: `Équipe "${teamName}" introuvable via Sportmonks.` }); return; }
      id = t.id; fallbackName = t.name; fallbackLogo = t.image_path;
    }

    const [squadRes, teamRes] = await Promise.all([
      fetch(`${BASE}/squads/teams/${id}?api_token=${TOKEN}&include=player.position;player.detailedPosition`),
      fetch(`${BASE}/teams/${id}?api_token=${TOKEN}&include=coaches`),
    ]);
    const squadData = await squadRes.json();
    const teamData = await teamRes.json();
    if (!squadRes.ok) throw new Error(squadData.message || `Erreur Sportmonks (${squadRes.status}) sur l'effectif.`);

    const players = (squadData.data || [])
      .filter((s) => s.player)
      .map((s) => ({
        id: s.player.id,
        name: s.player.display_name || s.player.name,
        number: s.jersey_number || null,
        age: ageFromDOB(s.player.date_of_birth),
        photo: s.player.image_path || null,
        position: normalizeCat(s.player.position?.name),
        subPos: subPosCode(s.player.detailedPosition?.name || s.player.position?.name),
      }));

    const teamObj = teamData.data || { id, name: fallbackName, image_path: fallbackLogo };
    const coachEntry = teamData.data?.coaches?.[0];
    const coach = coachEntry?.coach?.display_name || coachEntry?.display_name || null;

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.status(200).json({
      team: { id: teamObj.id, name: teamObj.name || fallbackName, logo: teamObj.image_path || fallbackLogo },
      players,
      coach,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erreur serveur inconnue." });
  }
};

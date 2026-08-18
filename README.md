# Fais ton Mercato — déploiement

## Fichiers
- `index.html` — le site (comptes utilisateurs inclus via Supabase)
- `api/squad.js`, `api/search-player.js`, `api/leagues.js`, `api/teams-by-league.js` — fonctions serveur (clé API-Football cachée)
- `package.json` — nécessaire pour que Vercel reconnaisse le projet
- `supabase-setup.sql` — à exécuter une fois dans Supabase (voir plus bas)

## Déploiement (GitHub + Vercel)
1. Upload tous les fichiers sur ton repository GitHub (écrase les anciens)
2. Vercel redéploie automatiquement
3. Vérifie que la variable d'environnement `SPORTMONKS_API_TOKEN` est bien configurée sur Vercel (Settings > Environment Variables)

## Activer les comptes utilisateurs (une seule fois)
1. Va sur ton projet Supabase > SQL Editor > New query
2. Colle le contenu de `supabase-setup.sql`
3. Clique "Run"

C'est tout — le site est déjà configuré avec l'URL et la clé publique de ton projet Supabase.

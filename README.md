# Fais ton Mercato — déploiement

3 fichiers dans ce dossier :
- `index.html` — le site
- `api/squad.js` — la fonction serveur qui va chercher l'effectif OM (garde la clé API secrète)
- `package.json` — nécessaire pour que Vercel reconnaisse le projet

## Étapes

1. Crée un compte gratuit sur **github.com**
2. Crée un nouveau repository (bouton vert "New"), nom libre, ex. `fais-ton-mercato`
3. Sur la page du repo, clique "Add file" > "Upload files", glisse-dépose les 3 fichiers/dossiers de ce zip
4. Crée un compte gratuit sur **vercel.com** (tu peux te connecter directement avec ton compte GitHub)
5. Sur Vercel, "Add New..." > "Project", choisis ton repo `fais-ton-mercato`
6. Avant de cliquer "Deploy", ouvre "Environment Variables" et ajoute :
   - Name: `API_FOOTBALL_KEY`
   - Value: (ta clé api-football, celle que tu m'as donnée dans le chat)
7. Clique "Deploy". Au bout d'une minute, Vercel te donne une vraie URL (ex. `fais-ton-mercato.vercel.app`)
8. Ouvre cette URL — le bandeau en haut doit passer au vert "Données en direct"

Si le bandeau reste rouge une fois déployé, copie le message d'erreur exact et montre-le pour qu'on corrige.

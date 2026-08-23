-- À coller et exécuter dans Supabase > SQL Editor > New query > Run.
-- Ce fichier est rejouable sans erreur (utile à chaque fois qu'on y ajoute
-- quelque chose) : les policies sont supprimées puis recréées à chaque run.

create table if not exists saves (
  user_id uuid references auth.users(id) on delete cascade,
  club_key text not null,
  data jsonb not null,
  updated_at timestamptz default now(),
  primary key (user_id, club_key)
);
alter table saves enable row level security;
drop policy if exists "Chacun gère uniquement ses propres sauvegardes" on saves;
create policy "Chacun gère uniquement ses propres sauvegardes"
on saves for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Classement public : tout le monde peut lire, chacun ne modifie que sa propre ligne.
create table if not exists leaderboard (
  user_id uuid references auth.users(id) on delete cascade,
  club_key text not null,
  display_name text,
  mercato_score numeric not null,
  realism_score numeric not null,
  global_avg numeric not null,
  updated_at timestamptz default now(),
  primary key (user_id, club_key)
);
alter table leaderboard enable row level security;
drop policy if exists "Le classement est visible par tous" on leaderboard;
create policy "Le classement est visible par tous"
on leaderboard for select
using (true);
drop policy if exists "Chacun gère uniquement sa propre ligne de classement" on leaderboard;
create policy "Chacun gère uniquement sa propre ligne de classement"
on leaderboard for insert
with check (auth.uid() = user_id);
drop policy if exists "Chacun met à jour uniquement sa propre ligne de classement" on leaderboard;
create policy "Chacun met à jour uniquement sa propre ligne de classement"
on leaderboard for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Historique personnel des mercatos terminés (plusieurs entrées dans le temps,
-- contrairement au classement qui ne garde que la meilleure/dernière ligne).
create table if not exists mercato_history (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  club_key text not null,
  club_name text,
  mercato_score numeric not null,
  realism_score numeric not null,
  global_avg numeric not null,
  created_at timestamptz default now()
);
alter table mercato_history enable row level security;
drop policy if exists "Chacun voit uniquement son historique" on mercato_history;
create policy "Chacun voit uniquement son historique"
on mercato_history for select
using (auth.uid() = user_id);
drop policy if exists "Chacun ajoute uniquement dans son historique" on mercato_history;
create policy "Chacun ajoute uniquement dans son historique"
on mercato_history for insert
with check (auth.uid() = user_id);

-- Corrections de données réelles (valeur/salaire/contrat) saisies à la main pour
-- coller à la réalité, joueur par joueur. Visible par tous, modifiable par tout
-- utilisateur connecté (projet en petit comité pour l'instant).
create table if not exists player_overrides (
  player_id text primary key,
  name text,
  value numeric,
  salary_monthly numeric,
  contract_end integer,
  updated_by uuid references auth.users(id),
  updated_at timestamptz default now()
);
alter table player_overrides enable row level security;
drop policy if exists "Tout le monde peut lire les corrections" on player_overrides;
create policy "Tout le monde peut lire les corrections"
on player_overrides for select using (true);
drop policy if exists "Les connectés peuvent corriger" on player_overrides;
create policy "Les connectés peuvent corriger"
on player_overrides for all
using (auth.uid() is not null) with check (auth.uid() is not null);

-- Retours utilisateurs : idées et rapports de bug.
create table if not exists feedback (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  author_name text,
  type text not null,
  message text not null,
  created_at timestamptz default now()
);
alter table feedback enable row level security;
drop policy if exists "Chacun voit uniquement ses retours" on feedback;
create policy "Chacun voit uniquement ses retours"
on feedback for select using (auth.uid() = user_id);
drop policy if exists "Chacun ajoute uniquement ses retours" on feedback;
create policy "Chacun ajoute uniquement ses retours"
on feedback for insert with check (auth.uid() = user_id);

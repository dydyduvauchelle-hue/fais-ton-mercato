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

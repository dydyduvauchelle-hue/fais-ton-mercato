-- À coller et exécuter dans Supabase > SQL Editor > New query > Run.
-- Crée la table qui stocke une sauvegarde de partie par utilisateur et par club,
-- et verrouille l'accès pour que chacun ne puisse lire/écrire que ses propres données.

create table if not exists saves (
  user_id uuid references auth.users(id) on delete cascade,
  club_key text not null,
  data jsonb not null,
  updated_at timestamptz default now(),
  primary key (user_id, club_key)
);

alter table saves enable row level security;

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

create policy "Le classement est visible par tous"
on leaderboard for select
using (true);

create policy "Chacun gère uniquement sa propre ligne de classement"
on leaderboard for insert
with check (auth.uid() = user_id);

create policy "Chacun met à jour uniquement sa propre ligne de classement"
on leaderboard for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Import des données réelles OM (valeurs Transfermarkt + salaires, capture du 23/08/2026).
-- À coller dans Supabase > SQL Editor > Run, APRÈS avoir relancé supabase-setup.sql.
-- Rattachement par nom exact — si un joueur n'apparaît pas "corrigé" dans l'appli,
-- corrige-le à la main une fois via le bouton "✏️ corriger" (son nom Sportmonks diffère probablement).
-- Valeur en M€, salaire en K€/mois (calculé : total brut annuel ÷ 12).

insert into player_overrides (name, value, salary_monthly, contract_end) values
('Jeffrey de Lange', 2.5, 95, 2027),
('Leonardo Balerdi', 18, 454, 2028),
('Nayef Aguerd', 15, 512, 2030),
('CJ Egan-Riley', 9, 189, 2029),
('Bamo Meïté', 7, 133, 2028),
('Derek Cornelius', 2.5, 76, 2028),
('Emerson', 9, 379, 2027),
('Ulisses Garcia', 3, 189, 2028),
('Pierre-Emile Højbjerg', 15, 663, 2028),
('Tochukwu Nnadi', 4.5, 58, 2030),
('Geoffrey Kondogbia', 3, 568, 2027),
('Quinten Timber', 25, 474, 2030),
('Timothy Weah', 20, 474, 2030),
('Angel Gomes', 10, 417, 2028),
('Himad Abdelli', 5, 95, 2030),
('Igor Paixão', 35, 530, 2030),
('Amine Harit', 5, 323, 2027),
('Amine Gouiri', 28, 474, 2029),
('Neal Maupay', 4, 313, 2028),
('Faris Moumbagna', 3.5, 115, 2028),
('Jelle Van Neck', null, 28, 2027),
('Tadjidine Mmadi', 0.8, null, 2029),
('Keyliane Abdallah', 0.05, null, 2028)
on conflict (name) do update set
  value = coalesce(excluded.value, player_overrides.value),
  salary_monthly = coalesce(excluded.salary_monthly, player_overrides.salary_monthly),
  contract_end = coalesce(excluded.contract_end, player_overrides.contract_end),
  updated_at = now();

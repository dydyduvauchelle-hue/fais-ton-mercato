-- Import des données réelles RC Lens (valeurs Transfermarkt + salaires, captures du 23/08/2026).
-- Hazard/Abdulhamid/Cuisance : salaire non publié, estimé via recherche (voir message) — à corriger
-- à la main si tu trouves une source plus fiable.
-- À coller dans Supabase > SQL Editor > Run.

insert into player_overrides (name, value, salary_monthly, contract_end) values
('Robin Risser', 30, 76, 2030),
('Mathieu Gorgelin', 0.2, null, null),
('Régis Gurtner', 0.1, 30, null),
('Ilan Jourdren', 0.05, 14, 2029),
('Samson Baidoo', 25, 189, 2030),
('Ismaëlo Ganiou', 20, 47, 2028),
('Nidal Celik', 7, 58, 2029),
('Kyllian Antonio', 3, 16, 2028),
('Jonathan Gradit', 2.5, 284, 2028),
('Maik Nawrocki', 1.5, null, null),
('Souleymane Sagnan', 0.5, null, 2028),
('Matthieu Udol', 8, 208, 2028),
('Jhoannder Chávez', 2.2, 76, 2028),
('Saud Abdulhamid', 9, 150, 2029),
('Ruben Aguilar', 2.5, 246, 2028),
('Andrija Bulatovic', 8, 38, 2030),
('Yacine Titraoui', 7, null, null),
('Amadou Haidara', 5, 348, 2029),
('Michaël Cuisance', 3, 130, 2030),
('Mezian Mesloub', 0.5, null, null),
('Thorgan Hazard', 2, 350, 2028),
('Abdallah Sima', 5, 228, 2029),
('Michal Skoras', 4, null, null),
('Florian Thauvin', 5, 341, 2028),
('Franjo Ivanović', 15, null, null),
('Odsonne Édouard', 12, 322, 2028),
('Rayan Fofana', 8, 47, 2028),
('Florian Sotoca', 1.2, 95, 2027)
on conflict (name) do update set
  value = coalesce(excluded.value, player_overrides.value),
  salary_monthly = coalesce(excluded.salary_monthly, player_overrides.salary_monthly),
  contract_end = coalesce(excluded.contract_end, player_overrides.contract_end),
  updated_at = now();

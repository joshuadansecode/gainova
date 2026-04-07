-- Insérer les 19 formations du catalogue Gainova
insert into formations (title, description, category, is_published) values
('Art oratoire', 'Apprends à parler en public avec confiance et impact.', 'developpement_personnel', true),
('Anglais (A1 → C1)', 'Maîtrise l''anglais de zéro jusqu''au niveau avancé.', 'langues', true),
('Design & Graphisme', 'Crée des visuels professionnels avec les bons outils.', 'creatif', true),
('IA & Outils (ChatGPT, Claude, Midjourney…)', 'Utilise l''intelligence artificielle pour booster ta productivité.', 'tech', true),
('Entrepreneuriat', 'Lance et développe ton projet entrepreneurial.', 'business', true),
('Développement personnel', 'Améliore ta confiance, ta discipline et ta vision de vie.', 'soft_skills', true),
('Dev / Code (HTML, CSS, JS, Python)', 'Apprends à coder de zéro avec les langages essentiels.', 'tech', true),
('Finance personnelle', 'Gère ton argent intelligemment et construis ta richesse.', 'business', true),
('Marketing digital', 'Maîtrise les stratégies pour promouvoir en ligne.', 'business', true),
('Microsoft Word & Excel', 'Utilise les outils bureautiques comme un pro.', 'bureautique', true),
('Création de CV', 'Rédige un CV qui attire les recruteurs.', 'carriere', true),
('Comment faire un portfolio', 'Crée un portfolio qui met en valeur tes compétences.', 'carriere', true),
('Hygiène de vie & bien-être', 'Adopte des habitudes saines pour une vie équilibrée.', 'sante', true),
('Nutrition de base', 'Comprends les bases d''une alimentation saine.', 'sante', true),
('Santé mentale & gestion du stress', 'Prends soin de ta santé mentale au quotidien.', 'sante', true),
('Sport & fitness à la maison', 'Reste en forme sans salle de sport.', 'sante', true),
('Premiers secours / gestes qui sauvent', 'Apprends les gestes essentiels pour sauver des vies.', 'sante', true),
('Santé de la femme', 'Informations essentielles sur la santé féminine.', 'sante', true),
('Prévention des maladies courantes', 'Protège-toi et ta famille des maladies fréquentes.', 'sante', true);

-- Insérer les niveaux pour chaque formation
insert into levels (formation_id, title, level_order, is_free, price)
select id, 'Débutant', 1, true, 0 from formations;

insert into levels (formation_id, title, level_order, is_free, price)
select id, 'Intermédiaire', 2, true, 0 from formations;

insert into levels (formation_id, title, level_order, is_free, price)
select id, 'Avancé', 3, false, 500 from formations;

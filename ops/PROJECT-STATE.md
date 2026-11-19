# Histoires de l'école privées — 19 novembre 2026 (America/Toronto)

Branche claude/histoires-ecole-privees (cut de main après #118). Demande du parent : les mêmes histoires que le livre de l'école, pour usage personnel.
Livré : tuile « Les histoires de l'école » (Français, page 3). Le parent charge un fichier texte (## graphie — Titre, un paragraphe par page, *mot* = mot du son); les histoires sont gardées SEULEMENT dans le localStorage de l'appareil (clé atelier-mots-private-stories-v1), jamais dans le dépôt, le site ou la sauvegarde. Elles se jouent comme les autres histoires (touche les mots, lecture à voix haute), sans leçon ni activité. Gros paragraphes découpés en pages courtes.
Décision : le dépôt GitHub est public; le texte du livre n'y entre pas. Un fichier de 21 histoires (pages vues par l'équipe) a été préparé hors dépôt et remis au parent.
Preuves : 621 tests unitaires + 4 suites navigateur OK; capture rendu téléphone. Pas d'appareil réel (chargement du fichier non essayé sur iPad).
En attente : les autres histoires (a, i, o, u, y, b, c, d, f…) dont les pages n'ont pas été fournies; retour du parent.

# Listes de mots élargies — 19 novembre 2026 (America/Toronto)

Branche claude/plus-de-mots (cut de main après #117). Demande du parent : « tous ces mots » (listes du livre).
Livré : 391 mots courants découpés en syllabes (de 8 à 15 par son, 36 sons), affichés 6 par page dans la leçon avec le bouton « Autres mots ». Les mots sont choisis par nous (mots courants, y compris plusieurs présents dans le livre); les listes complètes de l'annexe du livre ne sont pas recopiées dans le dépôt public.
Limite connue : ce n'est pas la liste intégrale du livre; la copier mot à mot appartient à un stockage privé de la famille (décision du parent à confirmer).
Preuves : 618 tests unitaires + 4 suites navigateur OK. Pas d'appareil réel.

# Mon carnet de trucs — 19 novembre 2026 (America/Toronto)

Branche claude/carnet-de-trucs (cut de main après #116). Demande du parent : un système éducatif qui explique aux deux filles qu'on leur donne des trucs à découvrir, en s'amusant.
Livré : « Mon carnet de trucs » (tuile dans Français, page 3, pour les deux filles). Chaque histoire de son terminée donne le truc du son (geste + bruit); chaque mystère d'orthographe terminé donne ses 3 astuces.
Les trucs non découverts restent cachés (🔒 « Truc secret »); toucher un truc le lit à voix haute; 4 par page, compteur « x / 39 » (Mely-Ann) ou plus pour Liana. La page « Bravo » annonce le nouveau truc.
Preuves : 617 tests unitaires + 4 suites navigateur OK; capture de rendu téléphone. Pas d'appareil réel.
En attente : jeux « Syllabe secrète », « Disparition », « Cachottier »; retour du parent.

# Leçon en 5 temps et jeu des amoureux — 19 novembre 2026 (America/Toronto)

Branche claude/systeme-lecon-jeux (cut de main après #115). Demande du parent : un vrai système d'éducation sous forme de jeu, en se servant des premières pages du livre (démarche, gestes, difficultés, jeux).
Livré : chaque histoire de son enchaîne maintenant (1) l'histoire, (2) le GESTE + bruit du son (36 gestes reformulés, bouton « Je l'ai fait! »), (3) quatre MOTS à lire syllabe par syllabe avec un conseil de lecture
(« si le mot ne sonne pas comme un mot connu… », frapper les syllabes, les jumeaux…), (4) l'activité du son, (5) la dictée magique. L'étape du parcours se termine après les pages geste et mots.
Nouveau jeu « Les amoureux » (consonne + voyelle = syllabe, puis trouver le mot qui la contient), inséré après chaque dictée dans « Mon parcours » (49 étapes pour Mely-Ann). Textes en voix de l'appareil (hors catalogue : 2298 clips inchangé).
Source : démarche des pages 11 à 29 du livre de l'école, reformulée; aucun texte du livre dans le dépôt.
Preuves : 615 tests unitaires + 4 suites navigateur OK; captures du rendu téléphone des pages geste et mots. Pas d'appareil réel.
En attente : jeux « Syllabe secrète », « Disparition », « Cachottier » (à deux ou avec un parent), listes de mots par graphie plus riches, retour du parent sur les gestes.

# Parcours dans l’ordre du livre de l’école — 19 novembre 2026 (America/Toronto)

Branche claude/parcours-ordre-du-livre (cut de main après #114), PR à ouvrir, non fusionnée. Demande du parent : adapter l’app à l’ordre du livre de l’école.
Livré : « Mon parcours » de Mely-Ann suit l’ordre de présentation du livre (é, è, puis s j f ch r z v m l n, puis on ou t eu p an d k b w g in un,
puis gn y oe a-back oopen ui; les voyelles simples a e i o u en révision à la fin). Les 36 sons y figurent une fois. Liana garde son mélange
mystères/histoires, mais les histoires restantes suivent ce même ordre. Contenu du livre : jamais copié dans le dépôt public (privé à la famille).
Preuves : 611 tests unitaires OK (journey.test.mjs adapté). Pas d’appareil réel.
Ajouté aussi : 4 nouveaux mystères d'orthographe originaux (b d p q; le son é à la fin : é/er/ez/ai; m devant b et p; lettres spectatrices : eau, œu, h muet, e muet),
chacun avec 3 astuces et 3 activités; Mely-Ann reçoit « b d p q » après l'histoire du b, Liana tous les quatre dans son parcours (43 étapes pour Mely-Ann).
Catalogue de narration : 2298 clips / ~135 600 caractères (limite 2300 / 150 000). 611 tests unitaires + 4 suites navigateur OK.
En attente : gestes par son, mystères tion/ill/s-z, retour du parent; plus de clips exigerait de relever la limite de coût.


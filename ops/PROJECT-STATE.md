# Fête selon le niveau + choix « je garde mes étoiles » — 19 novembre 2026 (America/Toronto)

Branche claude/fete-niveaux (cut de main après #129). Demande du parent : animer la photo qui vole avec une ambiance qui grandit selon les points obtenus, et demander à la fille si elle veut garder ses étoiles pour le prochain niveau.
Livré : (1) Photo qui vole en continu (dérive, balancement, légère rotation) + traînée d'étincelles. (2) Ambiance par niveau de récompense (rang dans la liste : niveaux 1, 2, 3) : plus de confettis, feux d'artifice dès le niveau 2, rayons dorés et lueur pulsante au niveau 3, titre « Super récompense! ». (3) Compteur d'étoiles qui monte de 0 au total gagné. (4) Choix de la fille : « 🎁 Je la veux maintenant » (va au coffre, marquée « Demandée ») ou « 💎 Je garde mes étoiles » (pour la récompense suivante, nommée avec les étoiles qui manquent). Les étoiles ne sont jamais dépensées; le choix est mémorisé (p.rewards.choice) et visible au coffre et dans l'espace parent (« la veut maintenant » / « garde ses étoiles pour la prochaine »). Le parent confirme toujours « Remis ». (5) Si plusieurs paliers sont franchis d'un coup, seule la plus haute est célébrée, une seule fois.
Interprétation à confirmer par le parent : « garder pour le prochain niveau » = ne pas demander cette récompense maintenant et viser la suivante; rien n'est retiré.
Preuves : 643 tests unitaires + 4 suites navigateur OK (learning relancée après un délai réseau sans rapport); vérifié dans Chromium : niveaux 1, 2, 3 (classes rp-t1/t2/t3), compteur, deux choix, 0 erreur JS. Non essayé sur iPad réel.
Pas fait : fanfare sonore; photo différente par niveau; « Repartir à 0 » ne réinitialise pas encore fêtes ni choix.

# Fête de la récompense — 19 novembre 2026 (America/Toronto)

Branche claude/fete-recompense (cut de main après #128). Demande du parent : quand l'enfant atteint une récompense, une grande ouverture « Récompense obtenue! » avec la photo des deux filles qui volent dans le ciel, animée.
Livré : src/rewards.js (pendingCelebration, markCelebrated, celebrationMarkup) + maybeCelebrate() dans src/app.js : dès qu'une étape du coffre est atteinte et pas encore remise, un plein écran s'ouvre une seule fois par récompense avec la photo icons/voyage-soeurs.webp (zoom doux animé, lueur, confettis qui tombent), l'icône et le nom de la récompense, la voix dit « Bravo [prénom]! Tu as gagné : … », boutons « Super! » et « ⭐ Voir mon coffre ». Respecte la préférence « réduire les animations ». Un parent seul confirme toujours « Remis » : la fête ne promet rien de plus que « Montre-le à un adulte ».
Mémorisation : p.rewards.celebrated[id] (par fille); « Repartir à 0 » ne la réinitialise pas encore.
Preuves : 639 tests unitaires + 4 suites navigateur OK; vérifié dans Chromium (390, 820 portrait, 1180 paysage) : s'ouvre, se ferme, ne revient pas après rechargement, 0 erreur JS. Non essayé sur iPad réel.
Pas encore fait : fanfare sonore (aucun fichier audio de fête dans le dépôt), fête au 100e/250e… avec photos différentes.

# Effacer réservé à l'adulte — 19 novembre 2026 (America/Toronto)

Branche claude/effacer-adulte (cut de main après #127). Question du parent : « c'est quoi Effacer de cet appareil? ».
Réponse : ce bouton retirait de la tablette les histoires du livre chargées dans l'app (le dépôt et le site ne changent pas).
Corrigé : les boutons « Ajouter des histoires ou des mots » et « Effacer de cet appareil » ne s'affichent plus que pour l'adulte (appui long sur « Adulte »); effacer réinitialise aussi le marqueur de chargement, donc les histoires reviennent au prochain démarrage (avant, elles ne revenaient pas).
Preuves : 636 tests unitaires + 4 suites navigateur OK (table-songs relancée après nettoyage d'un Chromium resté ouvert). Non essayé sur iPad réel.

# Sons étirés et laboratoire des sons — 19 novembre 2026 (America/Toronto)

Branche claude/sons-etires (cut de main après #126). Retour du parent : le son « ch » est trop court et sec, pas reconnaissable; il faut l'étirer sur environ 1 seconde (« chhhh ») et pouvoir changer / enregistrer les sons.
Livré : (1) src/sound-stretch.js : les sons continus (tout sauf p b t d k g) sont étirés à ~1 s en gardant l'attaque et la fin et en répétant le milieu avec fondu enchaîné (pas de changement de hauteur); mesuré dans Chromium : ch 0,99 s, s 0,99 s, a 1,0 s, ou 1,0 s; p reste court (0,47 s). (2) PhonemePlayer joue en Web Audio (repli sur l'ancien lecteur si absent). (3) Laboratoire des sons (Espace adulte > « Ouvrir le laboratoire »; src/sound-lab.js, src/sound-bank.js) : ▶ écouter, − / + durée par son (0,3 à 2 s, pas de 0,2 s), 🎙️ remplacer par sa propre voix (4 s max, silence rogné, volume normalisé), ↩ rétablir. Enregistrements dans IndexedDB de l'appareil, réglages dans localStorage : jamais envoyés ni ajoutés au dépôt.
Les fichiers d'origine (icons/phonemes) sont inchangés.
Preuves : 635 tests unitaires + 4 suites navigateur OK; enregistrement avec micro factice vérifié (sauvegarde, relecture, 1 s), 0 erreur JS. Non écouté par un humain, non essayé sur iPad / Safari réels (MediaRecorder Safari à confirmer).
En attente : le parent écoute les sons et indique lesquels corriger.

# Histoires et mots du livre dans l'app — 19 novembre 2026 (America/Toronto)

Branche claude/contenu-famille (cut de main après #125). Le parent a passé le dépôt en PRIVÉ (vérifié : gh api private=true) et demandé de tout mettre dans l'app.
Livré : dossier family/ (histoires-ecole.md : 21 histoires; mots-du-livre.md : 1303 mots classés par son), copié dans dist par le build et chargé automatiquement au démarrage (une fois par version, dans le localStorage de l'appareil : aucune action sur les tablettes). Vérifié dans Chromium : 21 histoires, 1303 mots, 0 erreur JS. La page « Mes histoires » est paginée (6 par page).
Serveur local : ops/server.mjs sert /family/histoires-ecole.md et /family/mots-du-livre.md seulement (liste blanche).
Point de vigilance : le dépôt est privé, mais le SITE Vercel (educ-ecole.vercel.app) n'a pas de mot de passe; les deux fichiers family/ y sont lisibles par quiconque connaît leur adresse exacte. Le parent en a été informé et a choisi de continuer. Pour fermer cet accès : protéger le déploiement dans Vercel (Settings > Deployment Protection) ou retirer family/ et revenir à l'import par fichier.
Preuves : 631 tests unitaires + 4 suites navigateur OK. Non essayé sur iPad réel.
Non couvert : histoires dont le texte n'a pas été fourni (a, i, o, u, y, b, d, f, g, s, t…); mots h, x, w du livre sans leçon correspondante.

# 25 mystères d'orthographe — 19 novembre 2026 (America/Toronto)

Branche claude/plus-de-mysteres (cut de main après #124). Retour du parent : seulement 9 mystères dans « Pourquoi ça s'écrit comme ça? », pas assez d'aide.
Livré : 16 nouveaux mystères (tion, ph, ill/il, ch/k, oi, o-au-eau, an-en, in-ain-ein-im, un-um, ien, eu-œu, gn, k-c-qu, x, y, jumeaux), chacun avec 3 astuces, des mots décortiqués en syllabes et 3 activités (total 25). Le hub est paginé (6 par page, 5 pages) pour tenir sans défiler. Tous apparaissent dans le parcours de Liana.
Voix : les 16 nouveaux textes sont lus par la voix de l'appareil (hors catalogue premium : 2298 / 2300 clips inchangé, coût de génération inchangé).
Preuves : 630 tests unitaires + 4 suites navigateur OK; capture rendu téléphone. Non essayé sur iPad réel.
Non fait : mystères pour Mely-Ann dans son parcours (elle y a seulement b d p q), lettres h muet/ç/s-z en mystères propres (couverts dans d'autres).

# Accueil : image complète et accès aux histoires — 19 novembre 2026 (America/Toronto)

Branche claude/accueil-image-histoires (cut de main après #123). Retour du parent (captures sur téléphone) : image incomplète sur l'accueil des deux filles et impossible de voir où sont les histoires.
Cause de l'image : en mode enfant, la photo de « Mon aventure du jour » était limitée à 50 % de la largeur et le bouton « Jouer ! » tombait sous la carte, caché. Corrigé : la photo remplit toute la carte et « Jouer ! » est posé dessus en bas (téléphone 390 px et iPad 820 px vérifiés par capture).
Histoires : nouveau grand bouton « 📚 Mes histoires » sur l'accueil des deux filles, sous « Mon parcours ». Il ouvre la page des histoires de l'école et offre aussi « Histoires des sons » et « Lire de petites histoires ». Tout tient sur un seul écran de téléphone sans défiler.
Preuves : 630 tests unitaires + 4 suites navigateur OK. Non essayé sur un vrai iPad / Safari.
Non corrigé / à regarder : le bandeau ovale du haut (étoiles · Adulte) paraît déformé sur certaines captures.

# Import privé des mots du livre — 19 novembre 2026 (America/Toronto)

Branche claude/import-mots-livre (cut de main après #122). Demande du parent : dépôt privé et tout dans l'app.
Blocage exact : changer la visibilité du dépôt est refusé à la session (HTTP 403 « Repository settings writes are not permitted through this proxy », vérifié avec gh repo edit). Le dépôt reste PUBLIC; je ne contourne pas ce contrôle. Action du parent : GitHub > Settings > Danger Zone > Change repository visibility > Make private.
Livré : le même bouton « Ajouter des histoires ou des mots » (Français > Les histoires de l'école) accepte maintenant aussi le fichier de mots du livre (« ## graphie | id-du-son »); les mots s'ajoutent aux mots de chaque son (syllabes calculées) et alimentent « Écrire des mots du son » (10 mots par tour, qui avance). Fichiers privés remis au parent hors dépôt : histoires-ecole.md (21 histoires), mots-du-livre.md (1303 mots, annexe pages 116 à 127, 33 sons; h, x et w du livre sans leçon correspondante).
Après passage en privé : copier ces deux fichiers dans family/ pour qu'ils se chargent seuls au démarrage (déjà prévu, src/family-content.js).
Preuves : 630 tests unitaires + 4 suites navigateur OK. Pas d'appareil réel.

# Le prof des sons et contenu de famille — 19 novembre 2026 (America/Toronto)

Branche claude/prof-des-sons (cut de main après #121). Demande du parent : dépôt privé, tout fonctionnel sur les tablettes, un « prof » qui donne des trucs et conseils.
Livré : src/coach.js — à chaque erreur d'écriture, le prof donne le conseil de la règle en cause (accents, jumeaux, m devant b/p, cédille, ph, gu, tion, ill, eau, œu, oi, ch, h muet, x, é final, è, c et g doux, s entre voyelles) puis la méthode des syllabes (« bi-bli-o-thè-que »), affiché et dit après le mot. Intégré à la dictée magique.
Prêt pour le contenu de famille : le dossier optionnel family/ (copié dans dist s'il existe) peut contenir histoires-ecole.md et mots-du-livre.md (« ## graphie | id-du-son » puis les mots); l'app les charge une fois par version dans l'appareil (src/family-content.js, src/book-words.js); les mots du livre s'ajoutent aux mots de chaque son (syllabes calculées).
BLOCAGE EXACT : la session ne peut pas changer la visibilité du dépôt (GitHub : « Repository settings writes are not permitted through this proxy »). Le dépôt Lianag2018/educ-ecole est donc toujours PUBLIC. Le dossier family/ ne doit pas être ajouté tant que le parent n'a pas passé le dépôt en privé (GitHub > Settings > Danger Zone > Change visibility). Prochaine action : après passage en privé, ajouter family/histoires-ecole.md (21 histoires déjà préparées) et family/mots-du-livre.md (annexe pages 116 à 127 à recopier).
Preuves : 630 tests unitaires + 4 suites navigateur OK. Pas d'appareil réel.

# Méthode des syllabes dans la dictée — 19 novembre 2026 (America/Toronto)

Branche claude/methode-syllabes (cut de main après #120). Demande du parent : pour les longs mots (ex. bibliothèque), apprendre à découper en syllabes pour pouvoir l'écrire.
Livré : src/syllables.js (découpage à l'écrit : « bi-bli-o-thè-que »; d'abord le découpage connu des mots des leçons, sinon règles : voyelles composées et nasales, consonne seule avant la voyelle, deux consonnes séparées sauf bl/br/cl/cr/dr/fl/fr/gl/gr/pl/pr/tr/vr, ch/ph/th/gn/qu comme une lettre, e muet final rattaché).
La dictée magique ajoute le temps « Découpons en syllabes » : l'app dit chaque syllabe en l'allumant, puis l'enfant touche chaque syllabe dans l'ordre en la disant; l'épellation regroupe les lettres par syllabe (sans couper une syllabe en fin de ligne); la consigne d'écriture donne le nombre de syllabes; le mot s'affiche en syllabes colorées.
Limite : découpage par règles, des exceptions peuvent exister (ex. nua-ge / nu-a-ge); les mots des leçons ont un découpage écrit à la main.
Preuves : 624 tests unitaires + 4 suites navigateur OK; parcours bibliothèque (5 syllabes) vérifié dans Chromium, 0 erreur JS. Non essayé sur iPad / Apple Pencil réels.

# Écrire les mots : lire, relire, épeler, magie, écrire — 19 novembre 2026 (America/Toronto)

Branche claude/ecrire-les-mots (cut de main après #119). Demande du parent : tous les mots en jeu d'écriture; je lis le mot, elle le relit, elle l'épelle, il disparaît par magie, elle l'écrit avec l'Apple Pencil.
Livré : la dictée magique suit maintenant 5 temps par mot : (1) l'app lit le mot, (2) l'enfant le relit à voix haute (bouton « Je l'ai lu », premier essai seulement), (3) l'app épelle (lettres allumées), (4) l'enfant épelle en touchant chaque lettre dans l'ordre en entendant son nom (mauvaise lettre : secousse, aide après 2 erreurs), (5) le mot disparaît par magie, (6) elle l'écrit (champ Scribble de l'Apple Pencil ou clavier), aide en rouge et 3 essais au besoin.
Nouveau bouton « ✍️ Écrire tous les mots du son » dans chaque leçon (tous les mots du son, 8 à 15), avec retour à l'histoire. Les dictées du parcours piochent maintenant d'abord dans les mots des sons déjà appris.
Preuves : 622 tests unitaires + 4 suites navigateur OK; parcours complet vérifié dans Chromium (lire, épeler, écrire, bravo pour 2 mots, aucune erreur JS). Non essayé sur iPad / Apple Pencil réels.
Note de confidentialité : le dépôt GitHub est PUBLIC (le parent pensait qu'il était privé); aucun texte du livre n'y est. À décider : passer le dépôt en privé.

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


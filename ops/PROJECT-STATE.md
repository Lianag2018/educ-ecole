# Vraie voix de conteuse pour les histoires de l'école (en ligne, à activer) — 21 novembre 2026 (America/Toronto)

Branche claude/voix-conteuse-serveur. Le parent a choisi la « vraie voix de conteuse » (la voix douce « coral » des autres narrations) pour les histoires de l'école, pour les deux filles, et accepte l'envoi du texte d'une page au fournisseur de voix. Le dépôt humanize-kit (examiné) ne traite que du texte écrit : aucun apport pour la voix.
Livré : (a) serveur : POST /api/voice/story (ops/server/story-voice.mjs, branché dans runtime.mjs) : texte d'UNE page (2 à 600 caractères, aucun enfant, aucun audio d'enfant), même modèle, voix « coral » et consignes de conteuse (STORY_INSTRUCTIONS + storyCue) que le catalogue de narration, débit .88; parent connecté ou tablette enregistrée de la famille; budget durable partagé (famille_reserve_voice, borne haute au tarif par million de caractères, jamais remboursé comme les autres voix payantes); réponse MP3 validée (ID3 ou trame MPEG, 1 Ko à 3 Mo); rien conservé côté serveur. Désactivé par défaut : exige EDUC_STORY_VOICE_CONFIG = {"enabled":true,"parentConsent":true} (variable à ajouter par le parent sur Vercel) en plus de EDUC_OPENAI_API_KEY, des tarifs valides de EDUC_VOICE_CONFIG (rates.ttsMillionCharsMicros, pricing, otherCostsMicros) et du registre budgétaire Supabase. Il n'active ni ne modifie la conversation vocale et ne touche à aucun indicateur de consentement, budget ou rétention de celle-ci. (b) tablette : src/story-voice.js : chaque page lue est gardée dans l'appareil (IndexedDB atelier-mots-histoires; payée une seule fois), la page suivante se prépare pendant la lecture, pause/reprise et arrêt fonctionnent, surlignage approximatif; si le serveur refuse (non activé, non connecté, budget) ou sans réseau, la lecture retombe sur la voix de conteuse de l'appareil (livrée plus tôt) et le serveur n'est pas rappelé pendant 2 minutes à 1 heure selon le motif.
Preuves : 4 tests serveur (faux fournisseur, faux budget : voix et consignes, refus, budget avant l'appel payant, MP3 invalide) et 3 tests tablette; essai Chromium avec un faux serveur : lecture par la voix en ligne, 2 appels (page + page suivante), 2 pages gardées, relecture sans appel; refus 503 : repli sur la voix de l'appareil; 0 erreur JS. NON vérifié : appel réel à OpenAI et réservation réelle au registre Supabase (aucune clé ni accès d'ici); qualité de la voix non écoutée.
Pour l'activer (parent) : Vercel, projet educ-ecole, Settings, Environment Variables : ajouter EDUC_STORY_VOICE_CONFIG avec la valeur {"enabled":true,"parentConsent":true} (Production), puis redéployer; sur chaque tablette, activer « tablette de la famille » (parent connecté) pour que l'accès serveur soit permis hors session parent.
En attente : activation par le parent; essai réel sur l'iPad (première page : quelques secondes d'attente); si la fonction renvoie « rate_limit » ou « budget_unavailable », vérifier la fonction SQL famille_reserve_voice.

# Voix de conteuse pour les histoires de l'école — 21 novembre 2026 (America/Toronto)

Branche claude/narratrice-conteuse. Demande du parent : il n'aime pas la narratrice des histoires de l'école; il veut une voix plus douce, façon conte pour enfants, avec expression et émotion, pour les deux filles.
Constat : les histoires de l'école sont des textes privés importés sur l'appareil; elles ne sont pas dans le catalogue de narration préenregistrée (voix « coral », consignes de conteuse, narration-catalog.mjs). Elles sont donc lues par la voix de l'appareil, sans expression. La voix préenregistrée ne peut pas être générée pour ces textes depuis cette session (clé OpenAI et tâche de génération sur le serveur, et envoi du texte du livre à un fournisseur externe : décision du parent requise).
Livré : (a) src/storyteller.js : lecture phrase par phrase avec expression et pauses selon le sens : narration douce (débit .82, ton .97, volume .85), question (ton plus haut), exclamation, paroles entre « » lues à part sans les guillemets (la suite « dit-il » reste en narration, courte pause), suspense (« ... », plus lent et plus bas), chuchotement (parenthèses, « chut », volume .62); pauses de .5 à .9 s; tout reste doux (débit .76-.88, ton .92-1.1, volume ≤ 1). (b) ReadingSpeaker accepte maintenant hauteur et volume par phrase. (c) Les pages des histoires de l'école sont lues ainsi pour les deux filles (tellText dans app.js, surlignage conservé, pause/reprise et arrêt respectés). (d) En mode adulte, page des histoires de l'école : bloc « Voix de la conteuse » : choix de la voix française de l'appareil (mémorisé) et « Écouter un exemple »; conseil iPad pour télécharger une voix « améliorée » ou « premium » (Amélie, Chantal).
Preuves : 5 tests unitaires (classement, découpage et positions, réplique et suite, paramètres doux, enchaînement/arrêt); essai Chromium avec voix simulées pour les deux filles : chaque phrase reçoit son débit, ton et volume, voix choisie mémorisée, 0 erreur JS. Non écouté par un humain; le timbre reste celui de la voix de l'appareil. Non essayé sur iPad réel.
En attente : le parent essaie sur l'iPad (voix premium, exemple) et dit si ça convient; décision : générer des MP3 de conteuse (voix « coral ») pour les histoires de l'école? (envoie le texte à OpenAI, coût, clé du serveur à confirmer).

# Roue : arrêt sur du blanc (Safari) — 21 novembre 2026 (America/Toronto)

Branche claude/roue-arret-juste. Signalement du parent (capture, probablement Safari : emojis Apple) : « les cases sont vides, certaines arrivent toujours dans le blanc de la roulette » : le résultat s'affiche à côté mais le rouleau est vide.
Constat : dans Chromium, 48 arrêts testés (4 tailles d'écran, 4 catégories, densités 1 à 3) tombent tous sur la bonne case, 3 cases visibles. Le défaut n'est donc pas reproductible ici; cause probable : Safari n'actualise pas toujours l'affichage d'un long rouleau animé par transition CSS (couche composée vide après la transition). Aucun moteur WebKit n'est disponible dans cet environnement : correction non prouvée sur Safari.
Livré : (a) animation dessinée image par image (requestAnimationFrame, même courbe que les tic-tic du son, translate3d) au lieu d'une transition CSS; (b) à l'arrêt, le rouleau est reconstruit avec seulement les 3 cases visibles (précédente, tirée, suivante) et remis à zéro : plus de grand décalage à afficher; (c) filet de sécurité : l'arrêt se règle aussi par minuterie si l'animation est interrompue (onglet en arrière-plan); (d) hauteur des cases fixée, couche d'affichage isolée (isolation, translateZ), backface-visibility.
Preuves : 48 arrêts vérifiés dans Chromium (case au centre = résultat annoncé, 3 cases visibles); tests unitaires et suites navigateur (voir PR). Non essayé sur Safari/iPad réels.
En attente : le parent confirme sur Safari si le rouleau s'arrête maintenant toujours sur une case visible.

# Feuilles de l'école à colorier : doubles et compléments de 10 — 21 novembre 2026 (America/Toronto)

Branche claude/feuilles-ecole-doubles-complements. Retour du parent sur les jeux de cartes : « ça doit être représenté comme à l'école, comme sur les photos ». Les cartes restent (jeux pour la mémoire) mais l'entrée principale est maintenant la feuille de l'école.
Livré : dans « Mémoire des nombres » (maths de Liana, roue), section « Les feuilles de l'école, à colorier » (src/worksheets.js + .css) : (1) « Les compléments de 10 » : les deux grilles 7×5 de la photo (nombres de 0 à 10 dont 0 et 10), consigne : colorier de la même couleur les deux cases qui font 10; (2) « Les doubles » : les deux grilles de la photo, avec les cases noires, et la consigne telle qu'imprimée (« Colorie les trois cases correspondantes de la même couleur pour les doubles (les deux termes et la somme). »). Elle touche les cases (deux, ou trois pour les doubles); si le groupe est bon, les cases se colorient de la même couleur (crayon suivant automatique, crayons au choix, « Défaire », 3 indices qui font briller un groupe) et la voix douce dit l'égalité; sinon un message l'aide (« 4 + 4 = 8 : cherche la case 8 »); la feuille se termine quand il ne reste aucun groupe possible (+5 étoiles, 3 feuilles par jour et par sorte au plus). « Nouvelle feuille » fabrique d'autres pages dans le même format. Le nom de l'enfant est écrit sur « Nom : ».
Transcription : les quatre grilles viennent des deux photos (la feuille des doubles redressée); vérifié : chaque grille de doubles se couvre exactement par 11 trios (33 cases), ce qui confirme la lecture. Les photos ne sont pas copiées dans le dépôt, seulement les nombres. Hypothèse à confirmer : la consigne de la feuille des compléments n'est pas sur la photo (texte écrit par moi); les cases ne sont pas obligées d'être voisines (la feuille des doubles ne le dit pas).
Preuves : 3 tests unitaires (grilles, règles, couverture); essai Chromium pour Liana : menu, les deux feuilles jouées jusqu'à la fin (erreur volontaire, indice, +5 étoiles, « Nouvelle feuille »), 0 erreur JS. Non essayé sur iPad ni avec l'Apple Pencil (coloriage au toucher seulement). Police manuscrite des compléments dépend de l'appareil.
En attente : le parent confirme la consigne des compléments et si les cases doivent être voisines; veut-il le coloriage au crayon (Apple Pencil) plutôt qu'au toucher?

# Jeux de mémoire : doubles et compléments de 10 (Liana) — 21 novembre 2026 (America/Toronto)

Branche claude/memoire-doubles-complements. Demande du parent (photos de deux feuilles de l'école, « Les compléments de 10 » et « Les doubles ») : un jeu de cartes où Liana jumelle les doubles, un autre où elle jumelle les deux nombres qui font 10; attrayant, pour travailler sa mémoire, car elle a beaucoup de difficulté à se rappeler.
Livré : tuile « Mémoire des nombres » (🧠) dans les maths de Liana et dans la roue (src/memory-pairs.js + .css). Deux jeux façon Memory : « Les doubles » (cartes « 4 + 4 » et « 8 », avec points; 9 paires) et « Les compléments de 10 » (cartes « 3 » et « 7 » avec cadre de dix coloré; 6 paires, 0↔10 à 5↔5). Pensé pour la mémoire : regard de départ (les cartes sont visibles quelques secondes), indices (2 par partie, les deux cartes brillent sans être retournées), jamais de punition, la voix de l'appareil dit l'égalité à chaque paire trouvée (« 4 plus 4 égale 8 »); les paires oubliées reviennent aux parties suivantes tant qu'elles ne sont pas retenues (boîtes de Leitner, retenue après deux réussites du premier coup); le nombre de paires monte ou baisse selon la réussite (3 à 8 pour les doubles, 3 à 6 pour les compléments). « Mes trucs pour retenir » : une image par paire (👀 1+1, 🐱 2+2, 🐞 3+3, 🕷️ 4+4, 🖐️ 5+5, 🥚 6+6, 📅 7+7, 🕷️🕷️ 8+8, 10+10 moins 2 pour 9+9; doigts levés et baissés pour les compléments), à toucher pour entendre. +5 étoiles par partie terminée, 3 parties par jour et par jeu au plus. Progrès gardés sur l'appareil (atelier-mots-paires-v1).
Preuves : 3 tests unitaires (paires justes, paquet et jumelage, boîtes et niveaux); essai Chromium pour Liana : menu, trucs, les deux jeux de bout en bout avec une erreur volontaire et un indice, +5 étoiles, progrès sauvegardé, 0 erreur JS; l'écran tient en 820 px de haut. Les feuilles de l'école ne sont pas copiées : seuls les faits (doubles de 1 à 9, compléments de 10) sont utilisés. Non essayé sur iPad réel; l'efficacité pour la mémoire de Liana reste à observer.
En attente : le parent dit si Mely-Ann doit avoir une version (compléments de 10 plus doux); retour sur la difficulté.

# Réduction du bruit ambiant — 21 novembre 2026 (America/Toronto)

Branche claude/bruit-ambiant. Demande du parent : isolation du bruit ambiant pour les enregistrements.
Livré : laboratoire des sons : « Réduction du bruit ambiant » Aucune / Normale (défaut) / Forte, mémorisée sur l'appareil (atelier-mots-denoise). Deux étages : (1) suppression de bruit demandée au navigateur (contrainte noiseSuppression) quand la réduction est active; (2) soustraction spectrale maison (src/denoise.js) : coupe-bas à 90 Hz, profil de bruit appris dans les moments les plus calmes de la prise, gain par fréquence avec plancher −22 dB, lissage; la prise nettoyée est coupée aux silences, normalisée et gardée en WAV 16 bits (lisible partout, indépendant du format de l'appareil). Si le nettoyage échoue ou vide la prise, la prise d'origine est gardée. Tout est local à l'appareil.
Preuves : signal de test (souffle + voyelle) : bruit −16 dB et voix −0,5 dB en Normale, −22 dB et −0,7 dB en Forte; essai Chromium avec un micro simulé bruyant : écart voix/bruit de fond 23 dB (Aucune), 56 dB (Normale), 63 dB (Forte), fichier WAV de 236 Ko, 0 erreur JS; 2 tests unitaires. Non essayé sur iPhone réel; non écouté par un humain (risque d'une voix un peu « métallique » en Forte).
Limites : un bruit qui ressemble à la voix (autre personne, télévision) n'est pas retiré; la prise doit contenir quelques instants calmes pour apprendre le bruit.
En attente : le parent essaie sur l'iPhone et dit s'il préfère Normale ou Forte.

# Sensibilité du micro — 21 novembre 2026 (America/Toronto)

Branche claude/sensibilite-micro. Demande du parent : pouvoir régler la sensibilité du micro sur l'appareil.
Livré : dans le laboratoire des sons, « Sensibilité du micro » : Normale (×1), Forte (×3), Très forte (×8), mémorisée sur l'appareil (atelier-mots-mic-gain), et « Tester le micro » : 6 secondes de barre de niveau sans rien enregistrer, puis un verdict (rien entendu / très peu / entend bien). Le réglage matériel du micro n'est pas modifiable depuis une page web : le son est amplifié numériquement (gain puis compresseur contre la saturation, src/mic-graph.js) avant d'être enregistré; la barre montre le niveau après amplification. Si l'appareil ne sait pas faire ce montage audio, le micro est enregistré tel quel.
Preuves : essai Chromium avec un micro simulé très faible (0,01) : barre 2 % (×1), 5 % (×3), 14 % (×8), verdicts corrects, enregistrement amplifié proposé, réglage mémorisé, 0 erreur JS; 2 tests unitaires. Non essayé sur iPhone/Safari réels (création du flux amplifié à confirmer).
En attente : le parent essaie « Tester le micro » sur l'iPhone et dit quelle sensibilité convient.

# Enregistrement : fin des sons vides sur iPhone — 21 novembre 2026 (America/Toronto)

Branche claude/micro-son-vide. Signalement du parent (iPhone) : « pas de message, simplement un nouveau son vide ».
Cause probable trouvée : la coupe automatique du silence (trimSilence, src/sound-stretch.js) avait un seuil fixe de 0,02; un enregistrement faible (micro d'iPhone) était coupé en entier et il restait un son d'un échantillon, sans message. Autres risques traités : un contexte audio encore ouvert peut rendre le micro muet sur iOS; fragments mp4 de Safari avec la livraison toutes les 250 ms.
Livré : seuil relatif (jamais plus de 6 % de la crête) puis amplification; détection d'un enregistrement muet ou de moins de 0,25 s avec un message clair, sans proposer de prise vide; barre de niveau en direct pendant l'enregistrement (on voit si le micro entend) et message « Je n'entends rien… » après 1,6 s de silence; contexte audio de lecture fermé avant d'enregistrer (PhonemePlayer.release); micro demandé sans suppression de bruit ni annulation d'écho, gain automatique gardé; plus de livraison par tranches de 250 ms; la prise s'écoute avec le même traitement que le son final (ce qu'on entend est ce qui sera gardé).
Preuves : essai Chromium avec trois micros simulés : normal (barre 53 %, prise proposée), très faible 0,01 (barre 2 %, prise proposée et audible après amplification), muet (aucune prise, message clair); 2 tests unitaires; tests et suites navigateur (voir PR). Non essayé sur iPhone/Safari réels : cause iOS à confirmer par le parent (barre de niveau et message).
En attente : le parent réessaie sur l'iPhone et dit si la barre de niveau bouge et quel message s'affiche.

# Enregistrement en deux temps et voix douces — 21 novembre 2026 (America/Toronto)

Branche claude/prise-et-voix-douce. Demande du parent : bouton d'enregistrement à droite, un bouton pour écouter, et si satisfaite on rappuie pour l'enregistrer pour de bon; les sons d'origine ne sont pas bons; s'assurer que toutes les voix de l'app sont la voix douce.
Livré : (a) laboratoire des sons : le micro est à droite de chaque ligne; un enregistrement devient une « prise » qui n'est PAS gardée : « ▶ Écouter ma prise », « ✓ Garder » (enregistrement final, vérifié lisible), « ✕ » pour jeter; refaire avec le micro remplace la prise; la ligne tient sur un écran de 390 px. (b) Voix douces : audit de toutes les voix. Narration MP3 : voix « coral », consignes féminine douce (narration-catalog.mjs); contrôle vocal serveur : « nova » à 0,85; tuteur IA en direct : consigne « ton féminin doux » (pedagogy.mjs); voix de l'appareil (mots du défi, roue, matières) : français canadien naturel et féminin d'abord, débit .88, hauteur .94, volume .9 (speech.js). Corrigé : l'anglais utilisait une voix brute; il choisit maintenant une voix anglaise douce (canadienne ou américaine, naturelle, féminine) avec les mêmes réglages doux.
Non vérifié : la voix en direct du tuteur IA (identifiant de voix fixé chez le fournisseur, non lisible d'ici); les sons d'origine (MP3) restent ceux de l'app tant que le parent ne les remplace pas par sa voix.
Preuves : essai Chromium (micro simulé) : enregistrer, prise écoutable, rien gardé avant « ✓ Garder », gardé ensuite, prise jetée = rien gardé; tests de choix des voix; tests et suites navigateur (voir PR). Non essayé sur iPhone/iPad réels.
En attente : le parent réenregistre les sons d'origine à sa voix puis les envoie aux tablettes (Envoyer / Recevoir des sons).

# Transfert des voix enregistrées entre appareils — 21 novembre 2026 (America/Toronto)

Branche claude/transfert-sons. Signalement du parent : « elle ne s'enregistre pas sur le serveur quand je le refais » (voix enregistrées dans le laboratoire des sons).
Constat : par conception (src/sound-bank.js), les voix ne sont gardées que dans l'appareil (IndexedDB), jamais sur un serveur; une voix faite sur l'iPhone n'existe donc pas sur les tablettes. Aucun stockage serveur pour les sons n'existe dans le code (le serveur ne gère que la sauvegarde des réponses, avec compte parent). Je n'ai pas pu en créer un : le seul projet Supabase accessible depuis cette session est « Luxura's Project » (service professionnel, non touché, AGENTS.md); la base familiale n'est pas accessible d'ici (voir ACCESS-RUNBOOK.md).
Livré : transfert sans serveur : « Envoyer mes sons à une autre tablette » (fichier sons-atelier-AAAA-MM-JJ.json partagé par la feuille de partage de l'appareil ou téléchargé) et « Recevoir des sons » (importe le fichier sur l'autre tablette, durées d'étirement comprises). L'import ne garde que les sons connus, de taille raisonnable, et refuse tout fichier qui n'est pas de l'Atelier. Le contenu reste privé : jamais dans le dépôt.
Preuves : 2 tests unitaires (aller-retour identique, fichier refusé); essai Chromium avec deux profils : enregistrement sur A, export, réception sur B (↩ présent), fichier invalide refusé, 0 erreur JS. Non essayé sur iPhone/iPad réels (feuille de partage iOS).
Piste serveur (non faite) : stockage des voix avec le compte parent sur la base familiale; exige l'accès à la base de l'école (Supabase personnel) et un point d'entrée authentifié.
En attente : le parent confirme si le transfert par fichier suffit, ou s'il veut le stockage serveur (accès à la base de l'école à fournir).

# Enregistrement des sons sur iPhone — 21 novembre 2026 (America/Toronto)

Branche claude/enregistrement-sons-iphone. Signalement du parent (capture iPhone, laboratoire des sons) : « les sons ne s'enregistrent pas ».
Constat : l'enregistrement fonctionne dans Chromium avec un micro simulé (enregistré dans IndexedDB, bouton ↩ affiché). Je n'ai pas pu reproduire le défaut sur Safari/iPhone (aucun appareil). Défauts trouvés dans le code : toutes les erreurs étaient avalées en silence et le message d'état était effacé par le rafraîchissement de la page; aucun format choisi pour Safari; aucune vérification que l'enregistrement se relit.
Livré : format choisi selon l'appareil (audio/mp4 sur Safari, webm sinon), données reçues toutes les 250 ms; chaque étape est annoncée dans un bandeau fixe (« Autorise le micro… », « Je t'écoute… », « Je range ta voix… », « ✓ Ta voix est enregistrée »); l'enregistrement n'est gardé que s'il se relit vraiment (décodage vérifié), sinon message clair; messages d'erreur précis (micro refusé avec les étapes Safari, aucun micro, enregistrement vide, impossible de garder, navigation privée, ouverture dans une autre application).
Preuves : essai Chromium (micro simulé) : démarrage, arrêt, enregistrement gardé, message final; tests unitaires et suites navigateur (voir PR). Non essayé sur iPhone/Safari réel : à confirmer par le parent avec le message affiché.
En attente : le parent réessaie sur l'iPhone et donne le message affiché si ça ne marche toujours pas.

# Défi 3 secondes : liste plus difficile pour Liana — 20 novembre 2026 (America/Toronto)

Demande du parent : enlever ce qui est trop simple pour une enfant de 8 ans (elle, les, plus, à, a…), garder les sons doubles et plus (comme « avion »).
Livré : Liana n'a plus les petits mots faciles; sa liste garde les mots à sons doubles ou complexes (ou, on, an, en, in, ch, gn, oi, eu, au, eau, ai, ill, ph, qu, gu, tion…) ou de 6 lettres et plus, tirés de Nadon, de Giasson et des mots des leçons de sons (5 à 10 lettres) : 217 mots. Mely-Ann garde la liste Nadon complète (152 mots). Règle dans src/word-challenge.js (isHardWord, olderWords); mots du livre importés non inclus pour l'instant.
Preuves : test unitaire (elle, les, plus, à, a, le, la, un, et, je, tu, il, son, sa, ma absents; avion, vouloir, prendre, pouvoir, donner, maison, jamais présents; Mely-Ann inchangée).
En attente : retour du parent sur le niveau (trop facile ou trop difficile) et sur le temps de 3 secondes.

# Anglais, histoire, sciences — 20 novembre 2026 (America/Toronto)

Branche claude/matieres-anglais-histoire-sciences (inclut le défi 3 secondes, le nouvel écran des filles et la roue). Demande du parent : ajouter anglais, histoire et sciences pour les deux filles; le parent donnera la matière.
Livré : src/subjects.js + .css; bloc « Mes autres matières » (🇬🇧 Anglais, 🏛️ Histoire, 🔬 Sciences) sur l'écran de chaque fille et dans la roue (catégorie « Autres matières »). Page d'une matière : liste de leçons; chaque paragraphe a un bouton 🔊 (voix de l'appareil; les phrases marquées « en: » se disent en anglais, en-US); questions à choix une à la fois (« Essaie encore ! » sans pénalité de forme, « Bravo ! » puis la suivante); +5 étoiles une seule fois par leçon si toutes les réponses sont justes du premier coup (événement matiere:matière:n dans l'historique du profil). Sans contenu, la page dit « arrive bientôt » (rien de faux ni de vide). Contenu gardé sur l'appareil par fille et par matière (atelier-mots-subjects-v1), jamais dans le dépôt.
Format d'un fichier de matière (import adulte sur la page de la matière, mode Adulte) : « # Anglais » (ou Histoire, Sciences); « pour: Liana » ou « pour: Mely-Ann » (sinon les deux); « ## Titre de la leçon »; des paragraphes; « en: phrase anglaise »; « ? Question | bonne réponse | autre | autre ».
Preuves : 3 tests unitaires du format; essai Chromium pour les deux filles : page vide, import simulé dans le stockage, leçon, quiz, +5 étoiles, 0 erreur JS. Import par le sélecteur de fichier non essayé de bout en bout (même code que celui des histoires). Non essayé sur iPad réel.
En attente : la matière du parent (anglais, histoire, sciences; par année).

# Roue des surprises (machine à sous) — 20 novembre 2026 (America/Toronto)

Branche claude/defi-3-secondes (même PR). Demande du parent : une roue façon machine à sous, avec toutes les tuiles et tous les liens de sites, où la fille choisit la matière, tourne la roue et entre directement où elle s'arrête; bien imagée, avec un aperçu à côté; au bas de la page d'accueil de chaque fille, remodelée pour chacune.
Livré : src/activity-wheel.js + .css; section « Ma roue des surprises » au bas de l'écran de chaque fille; elle lit les vraies tuiles de l'écran (aucune liste en double); choix de la matière (Tout, Lire et écrire, Les maths, Écouter, École); un rouleau défile et ralentit (3,4 s) puis s'arrête sur une activité, un panneau d'aperçu à côté montre l'image, la matière et une phrase; « Y aller ! » ouvre l'activité (les liens de l'école s'ouvrent dans un nouvel onglet), « Encore » retourne. Mely-Ann : rose et papillon; Liana : violet et licorne. Sans animation si le système demande moins de mouvement. Aucun son pour l'instant.
Preuves : essai Chromium pour les deux filles (tirage, entrée dans l'activité, 0 erreur JS); test unitaire du rouleau (arrêt sur la cible, pas de doublon voisin); vidéos d'aperçu remises au parent. Non essayé sur iPad réel.
Sons : tic-tic synchronisés avec le ralentissement du rouleau (courbe du CSS), ronron qui descend, « ding » à l'arrêt puis petite fanfare do-mi-sol-do (src/wheel-sound.js, Web Audio, aucun fichier); bouton 🔊/🔇 dans la roue, même interrupteur que les sons de fête; rendu hors ligne vérifié (crête 0,30, pas de silence pendant la rotation). Non écoutés par un humain.
En attente : retour du parent (volume, tirage qui évite les activités déjà faites).

# Accueil de chaque fille en un seul écran, accès directs — 20 novembre 2026 (America/Toronto)

Branche claude/defi-3-secondes (même PR que le défi). Demande du parent : trop de menus et de sous-menus, accès difficiles à trouver (ex. Météormath 2, MaZone CEC, défi vitesse); une page d'accueil dédiée à chaque fille, en un clic; le panneau « Lis ce nombre à voix haute » de l'accueil ne sert à rien.
Livré : (a) page de chaque fille (childHome, src/child-hub.css) : un seul écran, sans défilement à 1180×820, avec « Mon parcours » et « Mon aventure du jour » en haut, puis trois blocs (Lire et écrire, Les maths, Écouter et découvrir) où chaque tuile ouvre directement l'activité, et un bloc « Mes jeux de l'école » (Météormath 2 pour les deux; Nougat pour Mely-Ann; MaZone CEC et Voca pour Liana; liens externes, nouvel onglet); « Tout le français » et « Tous les maths » gardent l'ancien menu complet. Mely-Ann et Liana ont chacune leur liste (1re / 3e année). (b) Accueil illustré : le panneau « Lis ce nombre » est remplacé par « Défi 3 secondes » avec un bouton par fille; la lecture d'un nombre avec la maîtresse (voix en direct) reste dans « Les maths » (« Lire un nombre avec la maîtresse »). (c) Les papillons de l'accueil ne passent plus sur les visages.
Preuves : essai Chromium qui clique chaque tuile des deux filles dans un navigateur neuf (27 et 29 accès, 0 problème, 0 erreur JS; Pop-it s'ouvre en fenêtre); le défi démarre depuis l'accueil pour la bonne fille; tests unitaires et suites navigateur (tests de navigation et de voix mis à jour pour la nouvelle architecture). Non essayé sur iPad réel ni en téléphone.
Limites : liens externes non ouverts ici (aucun accès réseau vers ces sites), seulement vérifiés comme adresses https; l'écran tient en une vue sur tablette paysage, mais défile sur téléphone.
En attente : retour du parent sur l'organisation et les images; déploiement Vercel (limite de 100 déploiements par jour).

# Défi 3 secondes (mots fréquents) — 20 novembre 2026 (America/Toronto)

Branche claude/defi-3-secondes. Demande du parent : prendre les mots de https://www.pedagonet.com/other/liste.htm et en faire un défi de lecture, 3 secondes par mot.
Source : la page ne contient que deux listes en images (Giasson, mots qui font 50 % des textes, p. 172; Nadon, mots utiles en 1re année, p. 137), lues et saisies à la main (src/word-challenge.js; les élisions seules j', l', qu'... sont exclues; 100+ mots Nadon, Giasson pour la plus grande).
Livré : tuile « Défi 3 secondes » (1re page du français des deux filles); tours de 10 mots; un mot, une barre de 3 s, « Je l'ai lu ! » à toucher; temps écoulé = le mot est dit par la voix de l'appareil et compté à revoir; mots ratés reviennent en premier, puis les moins réussis; 8 mots sur 10 = +5 étoiles (3 tours par jour au plus; un événement defi:jour:n dans l'historique du profil); Mely-Ann = liste Nadon, Liana = Nadon + Giasson. La lecture est dite à voix haute par l'enfant : l'app ne l'évalue pas (aucune reconnaissance vocale), un adulte peut écouter.
Preuves : 662 tests unitaires; essai Chromium pour les deux filles (tour complet, +5 étoiles dans le bon profil, 0 erreur JS); suites navigateur (voir PR). Non essayé sur iPad réel; voix de l'appareil non écoutée par un humain.
En attente : retour du parent (durée 3 s, nombre de mots par tour, étoiles); déploiement Vercel (limite de 100 déploiements par jour atteinte le 19 novembre).

# Code secret retiré, blocage Vercel — 19 novembre 2026 (America/Toronto)

Branche claude/retire-code-secret. Demande du parent : enlever le code d'accès (mot de passe) des filles. Les PR du code secret et du « code oublié » sont annulées (src/pin-gate.js, styles, tests et clics de test retirés). L'entrée dans le monde de chaque fille est de nouveau directe. Comme ces deux versions n'ont jamais été déployées, la version en ligne ne change pas.
Blocage exact : Vercel refuse les déploiements (« Resource is limited - try again in 1 day », api-deployments-free-per-day, plus de 100 par jour; projets educ-ecole et educ-iles-aventure). Dernière version réellement déployée connue : l'accueil animé (PR 136). Chaque push déclenche deux déploiements : regrouper les changements.
Dépôt : GitHub signalait encore private=false à la dernière vérification (updated_at 12:59 UTC).
Preuves : tests unitaires et suites navigateur (voir PR). Non essayé sur iPad réel.
Prochaine action : vérifier le déploiement après la levée de la limite; confirmer que le dépôt est privé avant d'y mettre le livre complet.

# Accueil plus vivant — 19 novembre 2026 (America/Toronto)

Branche claude/accueil-vivant. Demande du parent : l'accueil de https://educ-ecole.vercel.app/ doit être plus vivant et animé.
Livré : couche décorative CSS (.welcome-life, aucun clic) sur l'illustration : étoiles qui scintillent, deux papillons qui traversent, pétales qui tombent, lettres (a, é, ou, ch, on, m) qui s'envolent des livres, boutons « C'est parti » qui pulsent avec un reflet, quatre cartes d'activité qui respirent, reflet qui passe sur le titre. Coupée par la case « Animations douces » et par reduced-motion. Vidéo d'accueil existante inchangée.
Preuves : rendu local dans Chromium (28 éléments animés au lieu de 1, capture vérifiée); tests unitaires et 4 suites navigateur (voir PR). Je n'ai pas pu ouvrir le site en ligne ni le Chrome du parent (réseau refusé). Non essayé sur iPad réel.
En attente : retour du parent sur l'intensité; confirmation du déploiement Vercel.

# Livre complet : gestes, import privé et dépôt redevenu public — 19 novembre 2026 (America/Toronto)

Branche claude/livre-complet. Demande du parent : utiliser toutes les pages du livre (histoires, gestes, listes de mots) dans l'app, pour usage familial.
Livré (code seulement, aucun texte du livre dans le dépôt) : (a) src/book-gestures.js : lit un fichier de gestes (un son par entrée) et affiche le geste du livre dans la leçon du son (gestureFor); (b) import adulte « Ajouter histoires, mots ou gestes » : un fichier dont le nom contient « geste » est lu comme gestes; (c) pagination des histoires privées à 8 par page; (d) family-content et ops/server.mjs acceptent /family/gestes-livre.md si un jour le dépôt est privé.
Incident : à 12:59 UTC le dépôt Lianag2018/educ-ecole est redevenu public (api : private=false), sans action de ma part. Le dossier family/ de main contient déjà 21 histoires et 1303 mots du livre. Je n'ai rien ajouté de plus au dépôt : les 63 histoires, 64 gestes et 1303 mots complets restent hors dépôt et se chargent par l'import adulte sur chaque tablette. Les modifications de visibilité ne passent pas par mon accès (403).
Preuves : tests unitaires + 4 suites navigateur (voir PR); test Chromium de l'import adulte : 63 histoires, 64 gestes, 1303 mots chargés, 0 erreur JS. Non essayé sur iPad réel.
En attente : le parent remet le dépôt en privé (ou décide du retrait de family/ de main; l'historique garderait le texte); histoires manquantes dans le livre reçu : i, y, o, u, é, « En camping » 1 à 4 + qu, « Muet de peur ».
Prochaine action : après dépôt privé confirmé, seulement alors, placer les fichiers complets dans family/.

# Récompenses répétables, choix de la fille et sons de fête — 19 novembre 2026 (America/Toronto)

Branche claude/recompenses-repetables (cut de main après #133). Demandes du parent : (1) McDo (et toute récompense) doit pouvoir se reprendre plusieurs fois, et ce sont les filles qui décident leur récompense; (2) « pourquoi pas l'esprit festif » : sons de fête.
Livré : (a) Une récompense se remet autant de fois que la fille a assez d'étoiles (plus de « une seule fois par parcours »); le coffre affiche « Reçu ×N ✓ ». La fête se rejoue quand une récompense dépensée est regagnée (resetCelebrations). Pour la sœur : après une remise, pas de nouveau cadeau immédiat (giftBlock) tant que la gagnante n'a pas perdu puis regagné l'atteinte. (b) La fille décide : dans son coffre, chaque récompense gagnée est un bouton (« Touche la récompense que tu veux : c'est toi qui décides! »); un toucher la demande (vert, « Demandée ✓ »), un deuxième toucher annule. Le parent voit les demandes d'abord et confirme « Remis aux deux filles ✓ »; la demande disparaît à la remise; aucune étoile n'est retirée avant. (c) Sons de fête fabriqués par le navigateur (src/party-sound.js, Web Audio, aucun fichier audio, volume .5 avec compresseur) : cadeau qui tremble (tics + sifflement), pop et paillettes à l'éclat, fanfare de trompettes sur accord de do majeur (plus longue aux niveaux 2-3, timbales au niveau 3), booms et crépitements au rythme des feux d'artifice, ronronnement d'avion qui traverse de gauche à droite. Bouton 🔊/🔇 dans le coin de la fête, choix mémorisé dans l'appareil (atelier-mots-party-sound). Débloqué au premier toucher si le navigateur bloque l'audio.
Preuves : 657 tests unitaires + 4 suites navigateur OK (faux contexte audio : tout son démarre et s'arrête); son rendu hors ligne dans Chromium : aucun silence, aucune saturation (crête 0,59 au niveau 3), 17 s; vidéos de démonstration avec le son (muxé par ffmpeg) remises au parent. Capture du coffre : trois récompenses cliquables, une demandée. Non écouté par un humain, non essayé sur iPad réel (Safari peut demander un toucher avant le son).
En attente : retour du parent sur le son (trop fort/trop doux, fanfare à changer).

# Cadeau de la sœur et ouverture captivante — 19 novembre 2026 (America/Toronto)

Branche claude/cadeau-soeur (cut de main après #132). Demandes du parent : (1) seules les étoiles de la gagnante sont dépensées; elle offre un cadeau à sa sœur, qui voit l'ouverture animée avec le cadeau reçu; (2) adapter les vidéos et rendre l'ouverture plus captivante.
Livré : (a) Fête de la sœur : titre « 🎁 Un cadeau de Mely-Ann! 🎁 », banderole « Cadeau de Mely-Ann pour Liana! », message « Ta sœur Mely-Ann t'offre cette récompense. Dis-lui merci! », ligne « 🎁 Pour toi! » (plus de « 0 étoile »), voix « Surprise Liana! Ta sœur Mely-Ann t'offre un cadeau : … ». La gagnante entend aussi « Tu l'offres aussi à ta sœur! » et lit « Tu offres aussi cette récompense à Liana! ». (b) Ouverture en séquence (≈2,5 s avant le reste) : écran sombre, cadeau qui grossit et tremble avec un halo doré, flash blanc, révélation de la photo des filles (zoom + lumière), puis confettis, avion et banderole, feux d'artifice décalés, carte qui apparaît, compteur d'étoiles; la voix démarre au moment de l'éclat. Avec « reduced motion », l'ouverture est sautée et tout s'affiche directement.
Vidéos de démonstration (sans son, hors dépôt) : gagnante téléphone, cadeau de la sœur téléphone, gagnante tablette (17 s), enregistrées avec Playwright et converties avec ffmpeg, début coupé pour commencer sur le cadeau; remises au parent dans la conversation.
Preuves : 653 tests unitaires + 4 suites navigateur OK; captures de la séquence d'ouverture. Non essayé sur iPad réel.
En attente : fanfare sonore (aucun son de fête dans le dépôt); le parent n'a pas encore confirmé s'il veut McDo repris plusieurs fois.

# Récompenses partagées entre les deux filles — 19 novembre 2026 (America/Toronto)

Branche claude/recompenses-partagees (cut de main après #131). Demande du parent : chaque récompense obtenue par une fille est donnée aux deux filles; montrer la fête en vidéo.
Livré : (1) syncGifts : quand une fille atteint une récompense (en étoiles), sa sœur la reçoit en « cadeau » (p.rewards.gifts[id] = {from,icon,title,cost}); le cadeau compte comme atteint sans dépenser les étoiles de la sœur et disparaît si la fille qui l'avait gagné dépense ses étoiles autrement. (2) Fête : la banderole dit « Félicitations Mely-Ann et Liana! » et la carte « Cette récompense est pour vous deux! »; la sœur reçoit sa propre fête (« Mely-Ann a gagné cette récompense pour vous deux! ») sans choix, avec « Super! » et « Voir mon coffre ». (3) Espace parent : un seul bouton « Remis aux deux filles ✓ (−N ⭐) », confirmation avec le nom de la fille dont les étoiles sont retirées; la récompense est marquée remise pour les deux (giveReward, ownerOf), même si on clique depuis la fiche de la sœur. Le coffre de la sœur affiche « Cadeau de [prénom] ».
Règle : les étoiles sont retirées seulement à la fille qui a gagné la récompense, quand le parent confirme. Une récompense ne se remet qu'une fois par parcours (pour les deux). Si la liste de récompenses diffère d'une fille à l'autre, le cadeau reprend le titre, l'icône et le coût de la gagnante.
Preuves : 652 tests unitaires + 4 suites navigateur OK; vérifié dans Chromium : Mely-Ann gagne, puis Liana reçoit la fête cadeau (0 erreur JS). Vidéos de la fête (téléphone 540x1170 et tablette 1180x820, 15 s, sans son) enregistrées avec Playwright et converties avec ffmpeg, envoyées au parent hors dépôt (la photo des filles n'est jamais envoyée à un service externe). Non essayé sur iPad réel.
Hypothèse à confirmer par le parent : « donnée aux deux filles » = les deux reçoivent la même récompense, mais seules les étoiles de la gagnante sont dépensées.

# Fête : avion « Félicitations », feux d'artifice, choix d'une récompense plus petite, étoiles dépensées — 19 novembre 2026 (America/Toronto)

Branche claude/recompenses-depenser (cut de main après #130). Demandes du parent : (1) garder ses étoiles pour la meilleure récompense, mais pouvoir choisir une récompense de niveau inférieur; les points sont ajustés quand le parent confirme « Remis »; (2) voir les deux filles voler sous des feux d'artifice, avec un avion qui passe en tirant une banderole « Félicitations » et le prénom de la gagnante.
Livré : (a) Remettre une récompense retire ses étoiles du total (st.base += coût, st.spent cumulé); le bouton parent indique « (−N ⭐) » et demande confirmation. (b) La fête propose : prendre la récompense la plus haute, en choisir une plus petite déjà gagnée (chaque bouton affiche son coût), garder ses étoiles pour la suivante, ou « Plus tard ». Rien n'est retiré avant la confirmation du parent. (c) Avion SVG qui traverse l'écran en tirant la banderole « Félicitations [prénom]! » (prénom échappé), vrais feux d'artifice en CSS (3, 5 ou 8 éclats selon le niveau 1/2/3), photo des deux filles qui vole, confettis, compteur d'étoiles, voix « Félicitations [prénom]! ». (d) « Nouveau parcours » efface aussi fêtes, choix et total dépensé. Avec « reduced motion », l'avion et la banderole restent fixes en haut au centre.
Règle conservée : chaque récompense ne se remet qu'une fois par parcours. Les étoiles dépensées peuvent faire redescendre une récompense plus haute au statut « pas encore atteinte ».
Preuves : 648 tests unitaires + 4 suites navigateur OK; captures Chromium téléphone (390) et paysage (1180) à trois moments : avion qui traverse, feux, banderole. Non essayé sur iPad réel. Ces animations sont en CSS/SVG dans l'app : aucun service externe ni image envoyée dehors.
En attente : fanfare sonore (aucun son de fête dans le dépôt); photo différente par niveau; confirmation du parent sur la règle des étoiles dépensées.

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


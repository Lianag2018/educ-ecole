## 22 octobre 2026 — import des phonèmes pour usage familial (UTC)
Demande explicite du parent : importer les sons et compléter le jardin. Préparation locale sur feat/animated-sound-cards, main distant vérifié 3e6f6fc18fa2e6049ae13d6c15be9d0e7cdcefe2; aucun push ni déploiement.
36 MP3 récupérés depuis les fiches officielles du Laboratoire de phonétique de l’Université Laval, conservés sans transformation dans icons/phonemes. sources.json conserve page, URL, SHA-256, taille et état de validation. Usage familial déclaré par le parent; aucune licence ouverte ou autorisation institutionnelle de redistribution affirmée.
Bouton Écouter le son dans chaque carte; lecteur dédié sans synthèse de secours, vitesse originale, arrêt au changement de carte/profil/navigation, à la narration et au bouton Arrêter. Animation décorative pendant la lecture et retour d’état accessible. Aucun diagnostic de prononciation, aucune simulation labiale.
Validation : 36/36 fichiers décodés par FFmpeg sans erreur, durées 0,3705–0,787833 s; 104 tests réussis, build réussi avec les 36 MP3. Tests couvrant interruption/rejeu, callbacks périmés, échec audio et correspondance source/empreinte. Les 36 fichiers sont servis en HTTP 200 avec le bon type audio/mpeg et les empreintes attendues; autorisation limitée du serveur local ajoutée pour icons/phonemes/*.mp3. Écoute humaine exhaustive et Safari/iPad physique non réalisés; le rendu navigateur reste à vérifier. Les extraits sont courts, ils ne constituent pas des consonnes prolongées de plusieurs secondes.
Prochaine étape : revue visuelle et écoute familiale; publication séparée à confirmer. L’intégration locale audio est réalisée, pas la livraison en ligne.

## 22 octobre 2026 — jardin illustré des sons (America/Toronto)
Préparation locale demandée dans la conversation secondaire, sur la branche existante feat/animated-sound-cards (base distante vérifiée : 3e6f6fc18fa2e6049ae13d6c15be9d0e7cdcefe2). Aucun push, fusion ou déploiement de cette étape.
Ajout de src/sound-garden.js : Plume le hibou illustré sur fond transparent et décor de forêt original (PNG générés depuis la maquette approuvée), 12 premiers sons puis 36 fiches, narration des consignes, liens vers les fiches sources de Laval, récompense des essais et retour aux exercices existants. Entrée par le jardin des sons du profil débutant; le niveau scolaire du deuxième profil ne change pas. Les fleurs sont enregistrées par profil et ne changent ni scores ni niveau de lecture. Aucun microphone ni copie de média tiers.
Boutons HTML séparés du décor, animation douce de Plume et célébration des essais, réduction des mouvements respectée. Illustrations de mots encore représentées par pictogrammes emoji.
Validation : 101 tests Node réussis, syntaxe JS et build réussis. Le test navigateur a été tenté mais Chromium absent; téléchargement Playwright échoué (archive vide/invalide). Rendu visuel, navigation réelle et iPad physique non validés. Aucun modèle sonore déclaré acoustiquement validé : les références s’ouvrent dans un nouvel onglet accompagné par un adulte. Les animations sont décoratives, sans simulation d’articulation humaine ni synchronisation labiale.
Prochaine étape : vérifier visuellement le jardin dans un navigateur disponible, écouter les 36 fichiers, confirmer les droits avant lecture directe, puis revue/publication selon autorisation. L’intégration audio directe reste incomplète.

## 22 octobre 2026 — cartes animées f/v (America/Toronto)
Préparation depuis main 3e6f6fc18fa2e6049ae13d6c15be9d0e7cdcefe2, branche feat/animated-sound-cards.
Dans la leçon f : cartes originales f/v, position labiodentale simplifiée, souffle animé et vibration distincte, consignes écoutables, références vidéo externes Lumni/Canopé. Réduction des mouvements respectée. Aucun film tiers copié ni intégré en iframe.
Les suites Node et le build local passent. Aucune écoute acoustique ni validation iPad réalisée. Les sons isolés ne sont PAS livrés : aucun fichier approuvé disponible; aucun fffff/vvvvv envoyé à la synthèse. Les liens de référence ont été trouvés mais leur lecture depuis le Canada n’est pas validée. Ni fusion ni déploiement confirmés.
Prochaine étape : obtenir des modèles f/v autorisés, les écouter et les faire valider pédagogiquement avant de proposer leur lecture; compléter ensuite les autres sons. Les consignes parlées restent synthétiques et ne valent pas validation du phonème.

## 2026-10-22 — Fondations de lecture (préparation, UTC)
Base : main 8542b45186b22b4fdb6984ac3f0f72b4eafe41fb (PR18).
28 activités originales ajoutées : 14 sons/voyelles, 8 assemblages, 6 mots.
Première année : ordre explicite, séparation visuelle +, explications orales et mots assemblés après réponse. Liens Alloprof différenciés 1re/3e année dans l’espace parent; complément RÉCIT univers social.
Consignes TTS renforcées pour pain/main, u/ou, on/ch et syllabes : nouveaux hashes pour les enregistrements concernés. Aucune validation acoustique exhaustive ni test Safari/iPad réalisé; ne pas confondre présence MP3 et prononciation correcte.
Références : Alloprof apprendre-lecture-ecriture-k1352 et répertoires f1588/f1590; activités originales, aucun contenu/audio tiers copié.
Livraison non confirmée à ce stade. Prochaine action : vérifier tests, build, PR puis déploiement et écouter les sons problématiques.

## 21 octobre 2026, America/Toronto — accompagnement oral 1re année

Préparé depuis main 124979d (PR17). Voix native explicitement française, préférence fr-CA; refus explicite si aucune voix française disponible, aucune voix anglaise par défaut. Modèles des sons en mots français contextualisés (chou, loup, du pain), terminologie sons/lettres. Questions et choix écoutables, indices et explications parlés, passage après fin de l’explication; arrêt/interruption annule le passage. Découpage visible la · pin conservé sans prononcer plus. Petit dictionnaire manuel de syllabes et boutons de décodage, univers social simplifié pour la 1re année. Les textes importés ne sont jamais découpés automatiquement.

Catalogue borné étendu à 601 clips intégrés, réutilisation des clips existants. Les nouveaux messages d’accompagnement ne sont pas soumis à l’alignement payant; les textes de lecture conservent le mécanisme existant. Tests Node/build réussis; publication et vérification acoustique à confirmer. Aucun score de prononciation ni test iPad physique revendiqué.

Référence pédagogique : ministère de l’Éducation, Progression des apprentissages, français primaire, orthographe d’usage, correspondances graphème-phonème (pages 14–15). https://cdn-contenu.quebec.ca/cdn-contenu/education/pfeq/primaire/progressions-apprentissages/PFEQ-progression-apprentissages-francais-langue-enseignement-primaire.pdf . Le graphème est écrit, le phonème entendu; les noms des lettres ne remplacent pas les sons. Les choix pédagogiques de l’interface ne constituent pas une validation officielle du ministère.

## 21 octobre 2026, America/Toronto — mondes par année scolaire

Refonte depuis `31759d582d601d9f45e0d06d207d09f83106cbac`. L’accueil de choix montre les deux personnages; après sélection, seul le monde du profil actif est rendu. `src/worlds.js` définit six choix distincts par niveau. Les anciens hotspots interprofils ont été retirés. Les tables hebdomadaires sont réservées au niveau avancé, sur leur propre écran. Le contenu et les progrès existants sont conservés.

Décors CSS animés avec réduction des mouvements, portraits issus de l’illustration approuvée, cartes de jeux et écrans d’exercice compacts. Les longs récits défilent à l’intérieur d’un panneau; ne pas promettre zéro défilement sur toutes tailles/zooms. Contrôles audio et vitesse conservés, outils adultes repliés. Tests de navigation rendue et d’isolation des banques, suite Node et build réussis. Validation visuelle et publication à vérifier. Pas de test iPad physique.

## 21 octobre 2026, America/Toronto — vitesse réglable

Curseur visible 0,6×–1,5× pour activités et nombres, enregistré dans le navigateur. Les MP3 changent de vitesse sans redémarrer ni modifier currentTime; preservesPitch activé. Les repères restent pilotés par le temps du média. La voix système reprend au dernier mot signalé par le navigateur; sans boundary, elle repart au début. Deux tests dédiés (vitesse en cours, position, hauteur, reprise native répétée), suite Node et build réussis. Déploiement à vérifier; pas de test iPad physique. Les limites de couverture 31/33 ci-dessous restent valables.

## Vérification du 21 octobre 2026 à 21 h 32 (America/Toronto)

PR13 et PR14 fusionnées, production Vercel SUCCESS sur `bc551eb625c2aa0dc5ac0e4894336742b508966b`. Le fichier public `/src/narration.js` correspond exactement au fichier local testé. `/audio/alignment.json` confirme **31/33** textes alignés, y compris les quatre histoires de licornes; deuxième génération : 16 appels, deux échecs. Les 395 MP3 demeurent disponibles. Les deux textes sans repères conservent le suivi approximatif. Tests Node réussis. Pas de vérification acoustique ni iPad physique.

Le contrôle intégral décrit ci-dessous pour PR13 a été remplacé par PR14 : alignement lexical ordonné, correspondance d’au moins 90 % dans les deux sens, maximum deux mots absents consécutifs; aucun timestamp inventé pour un mot absent. Les timestamps proviennent d’une transcription automatique, pas d’un alignement phonétique garanti. La conversation libre et la mémoire distante ne sont pas modifiées par ces PR. Prochaine étape : essai tablette et inspection des deux clips restants avant toute nouvelle génération.

## Reprise du 22 octobre 2026 (UTC) — synchronisation narration

Correctif préparé depuis main `9aa1fecc9783866821124f5a0eab148a167e2404`, branche `fix/narration-word-sync`. Ajout de repères de mots extraits des MP3 publics au build, uniquement pour les textes intégrés non numériques (maximum 80 requêtes, aucune répétition payante par build, cache par hash audio). Refus des transcriptions qui ne correspondent pas intégralement au texte. Les clips sans repères conservent le suivi approximatif; aucun alignement phonétique garanti. Le suivi conserve son état après réaffichage, couvre aussi sons/syllabes et fait défiler le mot hors écran.

Tests Node et build local réussis. Publication et couverture réelle à vérifier dans `/audio/alignment.json`. Aucun test iPad physique. Whisper-1 est utilisable pour ces timestamps jusqu’au 26 février 2027 selon la documentation officielle consultée le 22 octobre; prévoir une migration avant cette échéance. Source : https://developers.openai.com/api/docs/guides/speech-to-text . Aucun enregistrement d’enfant envoyé.

> **Vérification actualisée le 21 octobre 2026 vers 15 h 25 (America/Toronto)** : le statut GitHub Vercel de `2603f255a50c91fd8d79c883ae701a3e0e19b00e` est SUCCESS. Déploiement : https://vercel.com/lianag2018s-projects/educ-ecole/5QsbVqmhELQs9uS5zC63JLjRJJfR . Les fichiers publics `src/progress.js` et `src/guided-reading.js` correspondent exactement aux SHA256 des fichiers locaux testés. `/audio/status.json` retourne ready, 395/395, aucun échec. Les mentions plus bas de publication non confirmée et de 354/395 sont désormais historiques. Aucun test iPad physique ou sauvegarde distante n’est confirmé.
>
> **Mémoire distante** : demandée explicitement par le parent. Supabase MCP ne liste encore que les deux projets professionnels, à ne pas utiliser. Agent Codex d’audit/préparation lancé, request_id `7b02e675-497e-4aa9-89af-f1c3dc14d9a1`, run https://github.com/luxurahair/kenebec-ai/actions/runs/39661202849 , zone limitée `projects/educ-ecole-operations`, sans auto-merge. Relire son résultat avant toute nouvelle préparation. Ce job ne prouve pas une synchronisation installée. Les commandes générales deploy-web-backend ciblent le repo professionnel : ne pas les utiliser pour educ-ecole. Le progrès familial reste local actuellement.

# État de reprise — educ-ecole

Mise à jour : 21 octobre 2026, fuseau America/Toronto. Ce document décrit des observations datées; revalider les accès et la production avant toute nouvelle conclusion.

## Source et versions

- Dépôt actif : Lianag2018/educ-ecole.
- Main relu pour cette documentation : `69a9bab6d7c4e1dd084eb9ddce8b93a83a3fd55b`.
- PR 9 fusionnée : repères de lecture, ponctuation, liaisons, suivi du média. Tests Node, syntaxe et build réussis dans la session du 21 octobre.
- PR 8 fusionnée : lecture du nombre saisi et messages distincts narration/conversation.
- Dernière production confirmée dans la session : `93ed7da47c68189cb5e599e74cecadb7a2d856c6` (PR 7), 21 octobre 10 h 32 min 53 s à Toronto. Ce n’est pas une vérification permanente.
- Publication de PR 8/9 non confirmée : aucun statut GitHub au dernier contrôle; ressource /src/guided-reading.js retournait 404.

## Fonctionnel observé et limites

| Fonction | Preuve / limite |
|---|---|
| Accueil illustré, profils distincts | Code intégré; conserver l’illustration approuvée |
| Narration préenregistrée | Dernier statut observé : 354/395 clips, partial, audio_request_timeout |
| Histoires originales | Quatre histoires de licornes intégrées, niveaux différenciés |
| Lecture navigateur | lapin et 1 000 lus jusqu’à la fin; passage automatique après bonne réponse observé |
| MP3 vérifiés | lapin, 307, 1 999 et histoire valides; cela ne prouve pas l’écoute sur iPad physique |
| Repères visuels PR 9 | Implémentés/testés, publication non confirmée; timings MP3 approximatifs |
| Prononciation de l’enfant | Pas d’évaluation automatique livrée; réécoute locale avec adulte |
| Conversation libre | Endpoint observé indisponible; dépendances parent/Supabase/budget/rétention à finaliser réellement |
| Sauvegarde multi-appareil | Non démontrée; données locales actuelles à préserver |

## Blocage d’accès à ne pas confondre avec la clé

Le connecteur Vercel ChatGPT liste seulement luxurahair et renvoie 403 sur lianag2018s-projects. Le parent a montré un jeton **EDUC_ECOLE_VERCEL** existant et signalé son stockage dans les secrets de kenebec-ai. Sa validité actuelle n’a pas été testée par le parcours superviseur dans cette reprise. Ne pas conclure qu’il faut recréer le jeton.

## Prochaine action concrète

Reprendre le parcours agent/superviseur décrit dans ACCESS-RUNBOOK, vérifier en lecture seule que le jeton existant atteint le projet personnel exact, puis établir le moyen de déployer main. Le workflow de transfert OpenAI est limité à audit/apply de variable; l’ancien workflow preview statique n’est pas une solution production actuelle.

Après publication, vérifier le SHA, /audio/status.json, la disponibilité de guided-reading.js, l’écoute/arrêt, le nombre réellement saisi et les profils. Confirmer le comportement sur iPad avec le parent si aucun appareil physique n’est disponible. Traiter ensuite la conversation libre comme une tâche séparée, avec preuves de configuration.

## Journal à compléter à chaque reprise

Pour chaque changement : date et fuseau; objectif; SHA et PR; actions réellement exécutées; preuves de tests/déploiement; limites; blocage exact; prochaine action. Ne pas recopier des valeurs de secrets ni des données personnelles d’enfants.

Les anciens CURRENT-DELIVERY.md et DELIVERY.md restent des archives techniques. Leurs affirmations « aucun déploiement » ou « aucun appel OpenAI » ne décrivent plus l’ensemble du projet au 21 octobre.

## Reprise du 21 octobre 2026 — mémoire pédagogique

Ajout préparé sur `feat/learning-memory`, à partir de main `b6a16d1a01e8b8e440961b037c81a069fc8fa5fc` : bilan par profil, deux fenêtres de sept jours, statut de progression fondé sur plusieurs essais/jours, prochaine étape, priorisation de pratique. Les nouvelles réponses identifient la matière pour éviter que les maths augmentent le palier de français. Historique antérieur conservé sans migration destructive.

Validation : suite Node et build local réussis; cinq tests ciblent persistance/isolation, séparation maths/français, répétitions, ordre adaptatif et anciens historiques. Pas de test acoustique/iPad ni de déploiement confirmé pour cet ajout. La mémoire reste dans le navigateur; aucune synchronisation Supabase ou génération continue de contenu n’est prétendue. Prochaine étape opérationnelle inchangée : utiliser le parcours à jeton existant pour publier le SHA personnel vérifié.

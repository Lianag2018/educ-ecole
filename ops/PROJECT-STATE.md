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

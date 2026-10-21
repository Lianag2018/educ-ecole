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

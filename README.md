> Livraison actuelle : conversation vocale tour par tour implémentée côté serveur, activation fermée tant que compte parent, base durable, confidentialité et clé OpenAI ne sont pas vérifiés. Voir [VOICE-SETUP.md](VOICE-SETUP.md). Le contenu ci-dessous décrit aussi la base importée; les mentions de transport « futur » sont remplacées par ce document. Icône hibou approuvée, manifest standalone et aide installation iPad livrés; aucun mode hors ligne.

# Jardin familial — correction de livraison du 20 octobre 2026

État actuel et limites : **[ops/DELIVERY.md](ops/DELIVERY.md)**. Scripts/tests sous
`ops/`; commandes npm rétablies sans dépendance. Workflow manuel préparé,
activation sur branche par défaut encore nécessaire. Token Supabase scoped
annoncé ajouté par l’utilisateur; audit métadonnées préparé, identité et
intégration distante non vérifiées. Préparation Auth/RLS inactive sous
`ops/supabase`. Aucune migration distante ni voix payante activée.

Les sections ci-dessous sont historiques. Leurs anciens SHA, branches, nombres
de tests et état d’attente Supabase sont remplacés par le rapport actuel. Les
modules serveur sont maintenant sous `ops/server/`, les tests sous `ops/tests/`.

## Version importée

Cette version importe uniquement `projects/lecture-famille` de `0a0c2059a61b5fd15e651f0752ec1126c5d2b210` (branche `codex/agent-85297ca5-c975-47e5-a24a-d6e6c5e53142`) sur la base principale `eb14d881`. Aucun merge, push ou déploiement. La documentation historique suit plus bas; les résultats actuels sont ici.

## Prévisualisation

Node 22+, sans installation : `cd projects/lecture-famille`, `npm run dev`, ouvrir http://localhost:5173. `npm run build` puis `npm run preview` sert le build. Les deux commandes utilisent le même port : arrêter le premier serveur avant le second.

Les quatre boutons du jardin ouvrent les matières. Le bouton de mission d’origine conserve la calibration et les révisions adaptatives. Les nouvelles histoires sont choisies selon l’année déclarée (1re ou 3e); l’adulte peut changer l’année dans Espace parent. Les autres années utilisent les histoires plus longues, avec accompagnement. Ce petit ensemble original n’est pas un programme complet. Les explications des histoires indiquent les liaisons et pauses à travailler; la synthèse système ne garantit pas une diction parfaite. Aucun découpage automatique de syllabes.

## Configuration privée à l’exécution

Deux emplacements gauche/rose et droite/lavande, initialement Lectrice 1 / 1re année et Lectrice 2 / 3e année. Modifier séparément prénom/surnom, année, stratégie, classe et symbole d’avatar dans Espace parent. Le formulaire JSON importe deux objets dans cet ordre, avec `name`, `stage` et `classroom` facultatif; utiliser les valeurs privées communiquées au parent directement dans ce formulaire. Aucun nom d’enfant, photo, âge, date de naissance, code scolaire ou adresse enseignante n’est ajouté au source. Les dessins sont CSS; les images personnalisées restent à fournir. La prévisualisation raster antérieure n’était pas disponible et aucune ressemblance n’est revendiquée.

La même clé locale `atelier-mots-v1` est conservée; les réponses, cartes et contextes existants sont préservés. Seul un contexte absent reçoit les années par défaut. Les nouveaux réglages sont séparés par profil. Stockage local accessible aux utilisateurs de cet appareil, sans authentification parent ni synchronisation; utiliser un seul onglet. Aucun audio enregistré n’est conservé après navigation. Le micro sert à enregistrer et réécouter, sans transcription ni jugement automatique.

## Utilisation avec l’adulte

- Français conserve les sons, syllabes authored, vocabulaire et mots scolaires du moteur initial. Le parent colle ses vrais mots; aucune liste de 16 mots n’est inventée. Un indice marque l’essai avec aide; un nouvel essai explicite est possible après explication.
- Lecture fournit deux histoires originales par année avec question, choix vérifié et justification. Écouter utilise la voix système; vérifier la diction française sur l’appareil.
- Maths offre additions/soustractions, ordre et exercices originaux à quatre chiffres distincts de la feuille. Les lignes A à I reproduisent les 90 nombres fournis, dont 97 en D. Vue complète ou nombre par nombre; seul le parent confirme la lecture sans hésitation. Sinon, reprendre un autre soir.
- Univers social contient un exemple original de quartier imaginaire, distinct d’un manuel, et une leçon/question/explication saisies par le parent. La réponse orale est vérifiée par un adulte.
- Planning : créer, modifier ou retirer les tâches avec matière, jour et date facultative. Une échéance passée reste signalée comme ancienne et peut servir de révision. Les cases de confirmation consignent la pratique, pas la maîtrise.
- Récompenses : objectifs propres à chaque profil, initialement 4 lectures de 15 min, 2 orthographes et 4 efforts. Confirmer les séances réellement faites; aucun chronomètre ne prétend mesurer l’attention. Aide, erreur et retour sur une difficulté créditent l’effort. Dans Espace parent, saisir le lundi d’une semaine terminée et approuver le bilan. Les badges et le texte facultatif de récompense sont figés une seule fois par profil/semaine, même après rechargement. Semaine lundi–dimanche en America/Toronto. Pas d’automatisation externe ni de courriel de récompense.

## Vérifications et limites réelles

25 tests unitaires réussis : 11 existants moteur, 9 existants voix, 5 nouveaux tests couvrant les 90 valeurs, migration/isolation, frontières Toronto/DST/année et récompenses avec aide/erreur, validation et idempotence après sauvegarde. Sorties TAP dans `evidence/`. Build et vérification syntaxique réussis. Le scénario navigateur d’origine est conservé et étendu pour les matières, indices, réessai et nombres.

`npm run test:browser` a échoué avant interaction : endpoint Chromium indisponible. Le serveur local a aussi signalé `EPERM`; l’environnement interdit l’écoute. Aucune capture réelle, validation visuelle, micro réel, VoiceOver ou Safari/iPad n’est annoncée. Sur une machine autorisée : `npm test`, `npm run build`, puis `SCREENSHOT=/tmp/jardin.png npm run test:browser`. Le scénario vérifie des tailles 820×1180 et 390×844; vérifier également paysage et portrait sur iPad réel. Pour un iPad distant, servir le build via HTTPS accessible, puis tester permissions micro, voix, pauses, rotation et lecture audio. Les animations CSS respectent prefers-reduced-motion; commandes tactiles d’au moins 48px.

La préparation voix serveur, son plafond foyer de 40 CAD et l’outbox des alertes budget autorisées sont conservés tels quels. Aucun secret, service, coût ou courriel n’a été activé. Lire `VOICE-SETUP.md` avant toute future configuration. La voix payante reste fermée.

---

## Historique de la base conservée

# Suite : tutorat local et préparation voix sécurisée

Voir [VOICE-SETUP.md](VOICE-SETUP.md) pour les ajouts, limites, résultats actuels et configuration restante. La documentation de la base ci-dessous est conservée comme historique; ses anciennes mentions « aucun serveur » ou résultats de livraison ne décrivent pas les nouveaux modules. La voix payante reste indisponible.

# L’Atelier des mots

Première version autonome d’un atelier familial de lecture en français du Québec. Deux profils « Lectrice 1 » et « Lectrice 2 », modifiables, sans grade présumé. Fonctionne sans compte, clé API, serveur de données, appel payant ou dépendance npm. Ce dossier peut être copié dans son propre dépôt.

## Démarrer

Node.js 22 ou plus récent, puis :

```sh
cd projects/lecture-famille
npm run dev
```

Ouvrir http://localhost:5173. Aucune installation de paquet n’est nécessaire. Utiliser un serveur HTTP, pas un fichier `file://`. Le serveur de développement écoute uniquement sur la machine locale; pour tester sur un iPad, servir le build sur un hôte HTTPS accessible à cet appareil. Ne pas utiliser de données personnelles réelles dans une prévisualisation publique.

```sh
npm test
npm run build
npm run preview
```

`dist/` contient le site statique. Le serveur de prévisualisation utilise également le port 5173 : arrêter le serveur de développement avant de l’utiliser. Aucune dépendance au reste du monorepo.

## Ce qui fonctionne

- Deux profils avec nom, calibration, réponses, révisions et cartes scolaires distincts. Changer de profil ferme l’activité et nettoie l’audio. Aucun profil ne se voit attribuer une année scolaire.
- Calibration de six activités, une par domaine. Les réponses terminées sont sauvegardées immédiatement. Une calibration interrompue est reproposée; elle ne constitue pas une évaluation clinique ou scolaire.
- Missions courtes, jusqu’à huit activités, prévues pour une lecture de 5–10 minutes avec un adulte; pas de minuterie ni d’obligation de terminer. On peut faire une pause. Le temps dépend de l’enfant.
- 20 activités originales : syllabes, groupes de sons, mots, liaisons obligatoires, ponctuation/intonation, et quatre petites histoires originales avec questions et explications. Les activités écrites vérifient un choix; elles ne prouvent pas la qualité de lecture orale.
- Synthèse vocale : préférence à une voix `fr-CA`, sinon voix française détectée et annoncée, sinon tentative système `fr-CA` annoncée comme incertaine. Le résultat dépend des voix installées et de leur chargement. Une nouvelle pression sur Écouter refait la détection.
- Enregistrement/relecture en mémoire via `getUserMedia` et `MediaRecorder`, uniquement sur geste explicite. Arrêt à 45 secondes, en quittant l’activité, en changeant de profil ou en masquant la page. Les pistes sont arrêtées et les URL temporaires libérées. Une permission reçue après avoir quitté l’activité est immédiatement nettoyée. Pas de téléversement, transcription, reconnaissance vocale, score oral ni enregistrement persistant.
- Atelier parent : collage de mots ou texte, extraction déterministe d’au plus 20 mots distincts depuis les 5 000 premiers caractères, prévisualisation puis assignation explicite au profil actif. Une nouvelle carte scolaire peut entrer dans chaque mission après calibration. Lecture orale vérifiée par un adulte (« Lu sans aide », « À retravailler », ou aide). Aucun découpage automatique risqué des syllabes, aucune IA, OCR, photo ou importation PDF.
- Réinitialisation confirmée d’un seul profil ou de toutes les données, retrait des cartes scolaires, affichage des réponses par domaine et avertissement si le stockage est indisponible.

## Adaptation, vérifiable dans `src/engine.js`

Le moteur utilise les réponses réelles, jamais le microphone. Chaque réponse est `correct`, `incorrect` ou `help`. L’aide montre la correction et compte comme aide, sans permettre de la convertir ensuite en réussite indépendante.

Une réussite programme une révision à J+1, puis J+3, J+7 et J+14 selon la série de réussites du défi. Une erreur ou une aide remet la série à zéro et le défi à revoir dès la prochaine mission. Les trois révisions les plus anciennes passent en priorité, puis une nouvelle carte scolaire et des activités des différents domaines. Les défis dont la date de révision est future ne sont pas proposés avant cette date. Un défi difficile déjà rencontré peut être révisé même si le niveau courant a baissé.

Le niveau de contenu est calculé sur les quatre dernières réponses du domaine : au moins deux réponses et 75 % de réussites indépendantes ouvrent le niveau 2; quatre réussites indépendantes ouvrent le niveau 3. Sinon, niveau 1. Ces niveaux sont des paliers de contenu, pas des grades scolaires. À profil, banque et date identiques, la sélection est identique, sans hasard ni réseau. La date est celle du navigateur; changer l’horloge peut changer les échéances. Quand tout est planifié pour plus tard, le bouton de mission est désactivé.

## Données locales et limites des navigateurs

La clé `atelier-mots-v1` de `localStorage` contient les deux profils et les textes scolaires. Ces données restent dans ce navigateur et sur cette origine. Aucun code d’analytique, police externe, compte, publicité ou accès API n’est inclus. Les enregistrements ne vont pas dans `localStorage`.

**Local ne signifie pas secret** : toute personne utilisant ce navigateur peut ouvrir les deux profils et l’espace parent. Les profils sont séparés dans le fonctionnement de l’application, sans authentification. Utiliser des surnoms. La navigation privée, le nettoyage du navigateur, une autre origine ou un changement d’appareil peuvent faire perdre l’accès aux progrès. Pas de synchronisation, sauvegarde distante, export/import ni gestion des modifications simultanées dans plusieurs onglets. Utiliser un seul onglet à la fois.

La première version est en ligne statique; elle n’installe pas de service worker et ne garantit pas un démarrage hors connexion. Aucun accès réseau n’est requis par la logique de lecture après le chargement des fichiers. Les voix système peuvent toutefois dépendre d’un service du fournisseur du navigateur/système; vérifier les réglages de l’appareil si l’écoute doit être totalement hors ligne. L’application n’affirme donc pas que toute synthèse vocale est hors réseau.

Safari/iPadOS peut demander une permission micro par site, exiger HTTPS, suspendre l’audio en arrière-plan et proposer d’autres voix que Chrome. Les formats d’enregistrement sont choisis par le navigateur, sans forcer WebM. Un refus ou une absence de support laisse la lecture utilisable. Tester les haut-parleurs, les permissions, la lecture du format choisi et les voix sur l’iPad réel avant usage régulier.

La banque est un point de départ pour le début du primaire, **pas un cursus complet de la 1re à la 4e année**. Étendre `src/content.js` avec des identifiants stables et du contenu relu : mots, graphèmes, textes plus longs, inférences. Ajouter un nouveau palier demande aussi d’étendre le moteur. Faire réviser le matériel par une personne enseignante au Québec avant d’en tirer des conclusions pédagogiques.

## Vérification

```sh
npm test                    # 11 tests du moteur, sans téléchargement
npm run build               # production statique
npm run test:browser         # facultatif : Chromium installé + build préalable
```

Le test de navigateur utilise le protocole DevTools et WebSocket natif de Node 22. Sur une autre machine : `CHROMIUM_PATH=/chemin/vers/chromium npm run test:browser`. Les ports locaux 5173 et 9223 doivent être libres. Le scénario couvre réponses, persistance après rechargement, isolation, préparation/assignation parent, calibration, nettoyage du micro simulé, réinitialisation, absence d’exception et débordement à 820 et 390 pixels. Il ne valide pas l’acoustique réelle ou Safari. Il exécute Chromium sans sandbox dans un profil temporaire et ne visite que l’application locale; ne pas l’utiliser pour naviguer ailleurs.

Résultats du runner Linux GitHub Actions pour cette livraison : **11 tests du moteur réussis et build réussi**. Le scénario navigateur est fourni mais n’a pas pu s’exécuter : Chromium échoue au démarrage de Crashpad avec `setsockopt: Operation not permitted`. Le serveur de prévisualisation est également bloqué ici par `listen EPERM` sur le port local; le sandbox interdit l’écoute réseau. La revue visuelle, VoiceOver, Safari/iPadOS et le micro réel restent à faire. Aucun résultat de ces essais n’est prétendu acquis.

## Vercel statique — configuration prête, aucun déploiement effectué

Dans un futur projet Vercel **dédié**, choisir ce dossier comme Root Directory (ou la racine du dépôt après extraction). Framework : Other, commande `npm run build`, dossier de sortie `dist`. `vercel.json` est contenu ici, sans modifier la configuration Vercel du dépôt existant. Il n’y a ni variable secrète ni fonction serveur. Les en-têtes limitent le microphone à cette origine, interdisent caméra/géolocalisation et bloquent les connexions applicatives externes. L’accès micro demandera toujours un geste et une permission du navigateur.

Ne pas relier ce travail aux déploiements Kennebec/eTradeValue. Ne pas lancer `vercel`, de commande de déploiement ou de provisionnement pour cette livraison. L’hébergement statique peut rendre le code et les exercices publics; il ne publie pas les données `localStorage` des appareils.

## Supabase Free personnel — travail futur, compte en attente

L’inscription sous l’adresse personnelle du parent est en attente. **Aucun projet, table, compte, connexion ou abonnement Supabase n’a été créé ou utilisé.** L’organisation Supabase déjà connectée est professionnelle et n’est pas autorisée pour ce projet familial. Ne pas la sélectionner, ne pas provisionner de ressource payante et ne pas copier ses clés. La version présente n’importe aucun SDK Supabase et n’affiche pas de faux formulaire de connexion.

Après création et confirmation explicites d’un compte personnel et d’un projet dédié au plan gratuit, concevoir séparément la synchronisation :

1. Authentifier le parent par Supabase Auth, sans adresse ni compte enfant. Prévoir déconnexion, suppression complète et consentement explicite avant transfert des progrès locaux.
2. Créer des tables privées de foyers, profils et réponses avec migrations relues. Activer RLS **avant tout accès client**, sans politique publique. Chaque opération SELECT/INSERT/UPDATE/DELETE doit vérifier `auth.uid()` et l’appartenance au parent; un `profile_id` reçu du client ne suffit jamais. Indexer et contraindre les relations. Tester deux parents concurrents, les quatre opérations, l’accès anonyme refusé et la suppression en cascade avant activation.
3. Garder toute clé de service côté serveur seulement. Une clé publiable côté navigateur n’est acceptable qu’avec les politiques RLS validées. Pas de stockage d’audio par défaut, pas de buckets publics ni de table de profils publiquement lisible.
4. Prévoir migration locale volontaire, version de schéma, conflits entre appareils, export/suppression et fonctionnement local en cas de déconnexion. Revoir alors la CSP `connect-src` pour n’autoriser que le projet dédié.
5. Vérifier les limites et conditions du plan Free au moment de l’intégration; ne pas activer de facturation, d’option payante ou de déploiement sans nouvelle instruction. L’application locale reste la solution utilisable entre-temps.

Ces étapes décrivent une intégration future; elles ne constituent pas une sécurité déjà livrée ni du SQL prêt à exécuter.

## Livraison et périmètre

Travail réalisé par l’agent Codex existant sur le runner **Linux GitHub Actions**, dans `/home/runner/work/kenebec-ai/kenebec-ai`, pas sur un Mac. Tous les fichiers ajoutés se trouvent dans `projects/lecture-famille/`. Aucun fichier d’application existante, configuration partagée, service de production, secret ou donnée existante n’a été modifié.

Branche isolée fournie par le workflow : `codex/agent-993b4ad7-56e0-433d-bf74-ee6bb3cd4dee`. Le workflow garde `auto_merge=false`, supervise le verrou/heartbeat puis effectue son commit/push après la sortie de l’agent. Aucun `AGENTS.md` applicable n’était présent dans les ancêtres ou dans ce nouveau dossier. Les credentials du verrou sont réservés au superviseur et ne sont pas utilisés par l’application.

La création de PR est réservée au connecteur GitHub par le workflow. Cette session n’a ni outil GitHub de création de PR ni authentification `gh`. `PR.md` fournit la description prête pour une PR de cette branche vers `main`, **sans fusion automatique**. Ne pas confondre la branche préparée avec une PR déjà ouverte; son URL devra être fournie après création par le connecteur.

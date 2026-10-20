# Livraison actuelle — histoires, voix serveur et iPad

Travail concret présent dans le workspace; commit et push laissés au superviseur comme demandé (`.git` en lecture seule). Aucun commit/push, fusion, contournement, clone/bundle, déploiement cloud, migration distante, appel OpenAI payant ou secret réel lu. Aucune modification de l’application pro/Render.

## Provenance

- Branche workspace : `codex/agent-1493591b-4f32-4fda-97a5-84f74cf2f7fa`.
- HEAD actuel : `eb14d881306bfc0426d04a36af0dec372f5f79ab`. Les changements sont non commités : ce SHA **ne contient pas encore la livraison**. Le SHA final et la preuve du push doivent être fournis par le superviseur après commit/push.
- Base importée : `origin/codex/agent-f93fc77b-cbc1-428d-8bd9-1f30b426f555`, SHA `4e2cea76f5e495062d3a5461410462dbbd9d802a`, uniquement `projects/lecture-famille` et `.github/workflows/educ-ecole-vercel.yml`.
- Asset exact : `origin/codex/educ-ecole-icon`, SHA `0d88ab4a02e6f048cdbf930a705b4917e7743333`, README lu par git show; base64 décodé directement sous `icons`. Aucun dossier assets extérieur créé.

## Livré

Les banques `src/content.js` et `src/garden.js` sont identiques à la base : toutes les histoires originales sont conservées. Les nouveaux ops, l’audit Supabase et `001-parent-backups.sql`/`parent-backup.mjs` sont conservés. Le tuteur serveur reconnaît les histoires originales ainsi que les activités intégrées et les cartes scolaires provisionnées côté serveur.

Conversation réelle implémentée, sans simulation de réponse en UI : capture WAV bornée, authentification parent Supabase effective, propriété de profil, RPC budgétaire durable atomique, STT → réponse avec niveau/activité → TTS, lecture française ralentie, texte de remplacement, interruption et nettoyage, courte conversation volatile. Instructions distinguant 1re/3e, références de syllabes/liaisons, identification IA et limites pédagogiques. Les clés restent dans l’environnement Node. Le handler `api/[...path].mjs` et le serveur Node utilisent le même runtime.

Budget : migration SQL préparée, verrou transactionnel foyer, compteur durable par mois Toronto, plafond global 40 CA, réservation conservatrice couvrant les trois appels + FX/marge/frais et coûts fixes explicites. Maximum entier conservé sur succès, échec ou annulation. Six échanges réservés par minute. Configuration/base/accès/consentement manquants : aucun appel OpenAI.

Installation : PNG approuvé 512 intact; dérivés 180/192/32; manifest standalone, apple-touch-icon, favicon, build et allowlists serveur/Vercel. Aide Safari « Partager → Sur l’écran d’accueil ». Pas de service worker, pas de promesse hors ligne. Sharp n’était pas installable (DNS npm refusé); dérivés produits par redimensionnement bilinéaire déterministe Python standard, avec source reproductible dans ops. Vérification visuelle du PNG180 effectuée.

## Validé ici

- **51 tests individuels, 0 échec**, dont les 36 tests importés, intégrité PWA, serveur audio, isolation, erreurs et interruption. `npm test` lance chaque fichier directement afin de vérifier les assertions individuelles dans cet environnement Node22.
- Bout en bout **mocks uniquement** : capture PCM → runtime avec connexion parent/cookie → vérification Supabase → réservation RPC → trois appels fournisseur → lecture. Pas de données réelles ni de clé réelle.
- `npm run build` réussi; 13 fichiers publics attendus vérifiés avec `staticFiles`, aucun serveur/API/ops/secret dans dist.
- Contrôle strict de tous les fichiers livrables : uniquement les deux zones autorisées. Syntaxe JS et manifest JSON vérifiées.
- Preuves actuelles : `evidence/current-tests.tap`, `evidence/current-build.txt`. Les autres preuves importées sont historiques.

## Bloqué / non validé

- Aucune vérification de clé/accès OpenAI, de consentement effectif, de ZDR approuvé ou d’éligibilité exacte des endpoints pour les mineurs. Modèles choisis et tarifs officiels vérifiés dans VOICE-SETUP; les modèles texte/TTS sont marqués deprecated et leur accès doit être confirmé. Aucun remplacement automatique non budgété.
- Pas de migration/profils parent réels ou config de coûts/FX appliqués. Le workflow conserve son déploiement **statique**; la fonction Node nécessite un hébergement dédié configuré séparément. La voix reste honnêtement indisponible tant que cette activation manque.
- Chromium tenté : lancement interdit par le sandbox (création de sockets), endpoint de débogage indisponible. Aucun test Safari/iPad réel.
- PostgreSQL local tenté : création de socket refusée. Les scénarios RLS et le test SQL durable à 20 processus concurrents sont livrés et ajoutés au workflow, mais n’ont **pas** été exécutés ici. Les tests mémoire importés ne sont pas une preuve de durabilité SQL.

Consulter `VOICE-SETUP.md` pour les sources officielles, la démonstration des bornes, les variables hébergeur et les conditions d’activation. Les profils scolaires serveur doivent être provisionnés; les réglages locaux existants ne sont pas synchronisés automatiquement.

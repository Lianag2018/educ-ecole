# Accès et reprise — projet personnel

Référence du 21 octobre 2026. Aucun secret en clair dans ce document.

## Contrôle actualisé — 6 novembre 2026 (America/Toronto)

Cette section prévaut sur les états historiques ci-dessous.

- GitHub `Lianag2018/educ-ecole` et Vercel Personnel sont accessibles. La production
  READY correspond à main `164b733f8294fbc1e6723c6593cd9e59d390ae4c`, source Git.
  Le parcours branche → PR → contrôles → fusion → déploiement Git est fonctionnel.
- `EDUC_OPENAI_API_KEY`, `EDUC_PARENT_ID` et `EDUC_VOICE_CONFIG` sont présents.
  Le dernier contrôle de configuration donne `learningEnabled:true` et
  `learningAutoEnabled:false`; il ne confirme pas l’activation vocale.
- Aucun nom de variable Grok/xAI n’était présent dans l’inventaire du projet
  personnel lors de ce contrôle. Ne pas confondre clé Luxura et raccordement école.

### Réutilisation autorisée de l’accès Grok Luxura

Le parent demande explicitement de reprendre la clé existante, sans lui redemander
un jeton. Source confirmée : `luxurahair/luxura-inventory-api`, crons Render
Facebook, Genius et Halo, variable `XAI_API_KEY`, modèle `grok-imagine-image`.
Dernier succès Halo observé : 5 novembre 2026 à 11 h 02, America/Toronto.
La valeur de la clé n’a pas été extraite; ces preuves ne testent pas l’API voix.

1. Retrouver le chemin serveur autorisé permettant de consommer cette variable
   sans l’imprimer, l’écrire au dépôt ni l’exposer dans un résultat d’outil.
   Le connecteur Render consulté ne propose pas de lecture des variables.
2. Le workflow `educ-ecole-openai-transfer.yml` existant est limité à OpenAI.
   Il ne constitue pas déjà un transfert xAI : une extension exige un changement
   explicite, revu et testé, avec ses verrous conservés, sans modifier les crons.
3. Vérifier l’accès vocal, les conditions API et la rétention du compte effectif.
   Une console navigateur déconnectée n’annule pas l’existence de la clé serveur;
   elle bloque seulement la vérification des réglages par cette console.
4. Ne pas modifier la rétention globale de l’équipe Luxura : selon la documentation
   xAI, ZDR s’applique à toute l’équipe et peut rendre des fonctions indisponibles.
   Évaluer une équipe école distincte si une configuration différente est nécessaire;
   ne pas prétendre qu’une nouvelle clé de la même équipe isole cette rétention.
5. Tester d’abord avec un signal synthétique ou un adulte consentant, vérifier
   l’isolement et le budget, puis seulement activer le parcours familial validé.

Aucun raccordement xAI ni changement de rétention n’est réalisé par cette mise à
jour documentaire. Les services, clés et publications Luxura sont à préserver.

## Contrôle actualisé du 27 octobre 2026

Le connecteur Vercel **Personnel** fonctionne maintenant pour l'équipe et le
projet personnels ci-dessous. Les anciens 403 décrivent les contrôles précédents.
Le projet de production contient déjà `EDUC_OPENAI_API_KEY` et l'intégration
Supabase. Ne pas recopier la clé ni utiliser une clé professionnelle.
`EDUC_PARENT_ID` et `EDUC_VOICE_CONFIG` restent absents au contrôle de ce jour.
Le connecteur Supabase actuel refuse la base familiale; cela ne prouve pas que
les identifiants serveur Vercel sont invalides.

`npm run check:connections` vérifie depuis l'environnement serveur autorisé :
accès au modèle utilisé pour les photos, accès Auth et métadonnées du schéma.
Le même contrôle s'exécute automatiquement pendant les builds du projet Vercel
personnel, production/main uniquement. Lire la ligne `EDUC_CONNECTION_CHECK`
dans le journal privé du build. Aucun secret, photo, génération ou écriture de
base dans ce contrôle. Ne pas publier les environnements locaux.
Les états `model_access_verified`, `auth_reachable` ou `present` prouvent seulement
les lectures correspondantes, pas le parcours Photo → activités. L'identité du
parent, les profils, le registre budgétaire et les conditions de traitement réelles
restent requis avant tout import. Documentation officielle du contrôle OpenAI :
https://developers.openai.com/api/reference/resources/models/methods/retrieve

## Identités à ne plus confondre

| Accès | Cible / état observé |
|---|---|
| GitHub application | Lianag2018/educ-ecole; lecture, écriture et PR vérifiées |
| Vercel personnel | lianag2018s-projects; team_cXAfCdSOp4u1HERGC1eFwg34 |
| Projet Vercel personnel | educ-ecole; prj_pxl5Jmoxwmgvtp9zDUXxvIGFFxo2 |
| Connecteur Vercel ChatGPT | Personnel accessible au contrôle du 6 novembre; anciens 403 résolus |
| Jeton EDUC_ECOLE_VERCEL | Existence montrée par capture du parent; valeur et validité actuelles non vérifiées ici |
| Coffre signalé par le parent | Secrets GitHub Actions de luxurahair/kenebec-ai |
| Agent Codex / superviseur | Parcours demandé par le parent pour consommer les secrets; ses accès doivent être vérifiés à l’exécution |

Un 403 du connecteur ChatGPT ne prouve PAS que le jeton EDUC_ECOLE_VERCEL est invalide. Ne pas demander de nouveau jeton ou de nouvelle invitation par réflexe. L’appartenance à une équipe, les permissions du connecteur et les permissions d’un jeton sont des contrôles distincts.

## Inventaire de noms, sans valeurs

- `EDUC_ECOLE_VERCEL` : jeton de gestion Vercel signalé dans kenebec-ai.
- `EDUC_ECOLE` : jeton GitHub signalé par le parent.
- `EDUC_ECOLE_RENDER`, `EDUC_ECOLE_SUPABASE` : jetons personnels signalés; scopes/validité à confirmer.
- `EDUC_OPENAI_API_KEY` : variable de génération narration côté Vercel; fonctionnement antérieurement observé par MP3 publiés.
- `EDUC_ORIGIN`, `EDUC_SUPABASE_URL`, `EDUC_SUPABASE_ANON_KEY`, `EDUC_SUPABASE_SERVICE_KEY`, `EDUC_PARENT_ID`, `EDUC_VOICE_CONFIG` : configuration serveur conversation décrite dans ../VOICE-SETUP.md; ne pas présumer qu’elle est complète.

Un secret de dépôt GitHub n’est ni lisible en clair par l’API ni automatiquement disponible dans un autre dépôt. Ne pas tenter son extraction dans les logs ou le chat. Un workflow autorisé peut l’utiliser sans le révéler.

## Parcours existants et pièges

1. Le workflow de kenebec-ai `.github/workflows/educ-ecole-openai-transfer.yml` a été relu le 21 octobre. Modes audit/apply; exécution main; reviewed_sha doit correspondre exactement au SHA exécuté; tests sans secrets puis superviseur déterministe. Il reçoit EDUC_ECOLE_VERCEL, RENDER_API_KEY et AGENT_LOCK_TOKEN. Son but est le transfert contrôlé de la variable OpenAI manquante, PAS un déploiement général.
2. Conserver ses verrous, son SHA revu et ses contrôles. Avant une opération, vérifier que le mode couvre réellement l’objectif. Ne pas élargir ce workflow professionnel en douce, ni annoncer un run simplement parce qu’un agent a reçu une consigne.
3. Le workflow local `.github/workflows/educ-ecole-vercel.yml` est historique : audit, preview-static, audit-supabase. Il cible via `ops/educ-ecole-vercel.mjs` le projet **educ-ecole-famille**, distinct du site actuel. Sa liste de fichiers statiques exclut le dossier audio. Il n’est pas une procédure de déploiement production de l’app actuelle.
4. La connexion Git Vercel du projet actuel est confirmée au 6 novembre. Vérifier le SHA et READY après chaque livraison; un ancien 403 du connecteur ne décrit pas l’état actuel.

## Procédure de reprise

1. Lire PROJECT-STATE, obtenir main et identifier les changements déjà fusionnés; ne pas recommencer la création de comptes.
2. Réutiliser une connexion autorisée à la cible exacte. Si le connecteur échoue, vérifier les capacités de l’agent/superviseur et du parcours à jeton déjà prévu. Consigner le résultat sans secret.
3. Un audit à jeton doit confirmer identité du compte, teamId, projectId et dépôt lié AVANT toute mutation; aucune sélection par défaut de l’équipe professionnelle.
4. Ne redemander une action au parent que pour un blocage concret que les outils ne permettent pas de résoudre; indiquer l’opération refusée, le moyen essayé et l’action précise nécessaire. Ne pas déconnecter ses autres comptes.
5. Tester, relire, fusionner selon l’autorisation en session, puis déployer le SHA vérifié sur le projet personnel. Ne pas considérer la tâche terminée avant vérification de la version publiée, ou signaler explicitement le blocage.
6. Mettre à jour PROJECT-STATE avec la preuve, la date, la prochaine action et les limites.

Les autorisations familiales déjà données ne permettent pas de modifier les applications professionnelles. Aucun changement de service professionnel, abonnement ou achat supplémentaire n’est impliqué par ce runbook.

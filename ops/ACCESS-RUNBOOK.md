# Accès et reprise — projet personnel

Référence du 21 octobre 2026. Aucun secret en clair dans ce document.

## Identités à ne plus confondre

| Accès | Cible / état observé |
|---|---|
| GitHub application | Lianag2018/educ-ecole; lecture, écriture et PR vérifiées |
| Vercel personnel | lianag2018s-projects; team_cXAfCdSOp4u1HERGC1eFwg34 |
| Projet Vercel personnel | educ-ecole; prj_pxl5Jmoxwmgvtp9zDUXxvIGFFxo2 |
| Connecteur Vercel ChatGPT | Ne liste que luxurahair; 403 sur l’équipe personnelle lors des derniers essais |
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
4. La connexion Git Vercel du projet actuel doit être vérifiée avant de compter sur un push. Les commits récents n’avaient aucun statut de déploiement lors des derniers contrôles; la cause n’est pas démontrée par le 403 du connecteur.

## Procédure de reprise

1. Lire PROJECT-STATE, obtenir main et identifier les changements déjà fusionnés; ne pas recommencer la création de comptes.
2. Réutiliser une connexion autorisée à la cible exacte. Si le connecteur échoue, vérifier les capacités de l’agent/superviseur et du parcours à jeton déjà prévu. Consigner le résultat sans secret.
3. Un audit à jeton doit confirmer identité du compte, teamId, projectId et dépôt lié AVANT toute mutation; aucune sélection par défaut de l’équipe professionnelle.
4. Ne redemander une action au parent que pour un blocage concret que les outils ne permettent pas de résoudre; indiquer l’opération refusée, le moyen essayé et l’action précise nécessaire. Ne pas déconnecter ses autres comptes.
5. Tester, relire, fusionner selon l’autorisation en session, puis déployer le SHA vérifié sur le projet personnel. Ne pas considérer la tâche terminée avant vérification de la version publiée, ou signaler explicitement le blocage.
6. Mettre à jour PROJECT-STATE avec la preuve, la date, la prochaine action et les limites.

Les autorisations familiales déjà données ne permettent pas de modifier les applications professionnelles. Aucun changement de service professionnel, abonnement ou achat supplémentaire n’est impliqué par ce runbook.

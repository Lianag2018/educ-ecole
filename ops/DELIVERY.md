> Rapport actuel : [CURRENT-DELIVERY.md](CURRENT-DELIVERY.md). Le texte ci-dessous est le rapport historique conservé de la base importée.

# Correction run39478970385 — 20 octobre 2026

Correction préparée dans le workspace. **Commit/push réservés au superviseur après
sortie.** Aucun commit, bundle, push, merge main, dispatch, secret lu ou déploiement
distant effectué par l’agent. Aucun contrôle de zones existant modifié.

## Provenance et zones

Import par `git archive` uniquement de `projects/lecture-famille` depuis
`origin/codex/agent-2a7dd453-60da-4d21-90c5-62fa69109472`, SHA
`50d85bb404a305fa501263239d652d658a089733`. Aucun autre fichier importé de cette
branche. Scripts build/serveur, modules serveur et tests déplacés sous `ops/`,
imports et scénario navigateur ajustés. `package.json` absent rétabli sans
dépendance, avec exception dans le `.gitignore` de ce dossier pour que le
superviseur le collecte malgré l’exclusion globale du dépôt. Seul fichier extérieur
ajouté : `.github/workflows/educ-ecole-vercel.yml`.
`.git` reste en lecture seule; le contrôle additionnel `ops/check-zones.mjs` ne
remplace pas celui du superviseur.

## Activation du workflow restant nécessaire

Un `workflow_dispatch` présent seulement sur cette branche n’est pas encore
enregistré comme workflow manuel GitHub. **L’activation sur la branche par défaut
reste nécessaire**, par publication distincte explicitement autorisée prise en
charge par le superviseur. Aucune fusion main effectuée ici. Après enregistrement,
sélectionner la branche contenant aussi le dossier familial, puis le mode :

| Mode | Effet |
| --- | --- |
| `audit` (défaut) | Tests/build, lectures Vercel seulement; aucune création |
| `preview-static` | Tests/build, vérification username/team/Hobby, puis seulement projet dédié et preview statique |
| `audit-supabase` | Tests/build, puis métadonnées du projet explicite; aucune mutation |

Aucun push/PR/cron ne déclenche ce workflow. Les jobs secrets attendent tests
unitaires, SQL sur PostgreSQL 16 jetable et build. Aucun artifact uploadé ou modèle
exécuté. Secrets injectés seulement dans leur étape déterministe respective,
jamais au niveau global/job/build/test/client. `EDUC_ECOLE` et `EDUC_ECOLE_RENDER`
ne sont pas utilisés.

### Vercel

Le superviseur transmet `EDUC_ECOLE_VERCEL` via GitHub Secrets à
`node ops/educ-ecole-vercel.mjs`. Refus de toute identité différente de username
`lianag2018`, team `lianag2018s-projects`, plan `hobby`, avant tout POST.
Seul projet admissible : `educ-ecole-famille`. Projet lié à Git, contenant des
variables ou une cible production refusé. Pas de PATCH de projet existant;
création uniquement sur 404 et choix explicite `preview-static`.

Seuls `dist/index.html` et `dist/src/*.(js|css)` sont envoyés, sans lien symbolique,
serveur, tests, données locales ou configuration de compte. Headers CSP conservés,
dont `connect-src 'none'`. Pas de clé ou SDK cloud dans le client. Le champ `target`
est omis : l’API actuelle définit alors une preview; la valeur littérale `preview`
n’est pas un target explicite valide. Aucun alias, domaine, production, abonnement
ou appel voix payant. Attente READY bornée et sortie limitée à l’URL validée et
aux métadonnées autorisées. Aucun body d’erreur API affiché.

**Identité, plan et preview réels non vérifiés dans cette session.** Aucun token
accessible à l’agent, aucun appel authentifié tenté.

### Supabase scoped : secret annoncé ajouté par l’utilisateur

Le superviseur injectera `EDUC_ECOLE_SUPABASE` seulement dans l’étape
`audit-supabase`. Fournir `supabase_project_ref` : les 20 caractères exacts de la
référence personnelle autorisée (pas un secret). Unique endpoint appelé :
`GET /v1/projects/{ref}`, permission scoped **Project Settings / Read**. Nom attendu :
`danielgiroux007@gmail.com's Project`. Sortie limitée à référence, nom attendu,
organization_id, région, statut, `identity_confirmed:false`, `migration_allowed:false`.

Le nom d’organisation `danielgiroux007@gmail.com's Org` est une attente utilisateur,
pas une identité vérifiée ici. Après audit, confirmer dans le Dashboard le lien
organization_id/nom, la référence, le propriétaire réel, le caractère personnel
et dédié et le plan gratuit. Un nom de projet ne prouve pas son propriétaire.
Un 403 reste un refus de permission : pas de demande de token Legacy/full compte.
Pas de liste globale, `whoami`, `supabase link`, API keys, SQL ou migration distante.

Documentation actuelle consultée le 20 octobre 2026 :

- [Personal Access Tokens](https://supabase.com/docs/guides/platform/personal-access-tokens) et [Management API](https://supabase.com/docs/reference/api/introduction) : token scoped distinct du Legacy; Project Settings Read suffit à la lecture ciblée.
- [Changelog demandé](https://supabase.com/changelog.md) : tentative directe refusée par l’outil web (`text/markdown`), curl local bloqué par DNS. [Version HTML](https://supabase.com/changelog) consultée à la place.
- [Annonce GA du 6 octobre 2026](https://supabase.com/changelog/scoped-personal-access-tokens-ga) : scopes par ressources/capacités, compatibles API/CLI; `whoami` non compatible avec scopes projet/org. Aucune équivalence avec Legacy supposée.
- [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Vercel deployments](https://vercel.com/docs/rest-api/deployments/create-a-new-deployment), [Vercel team](https://vercel.com/docs/rest-api/teams/get-a-team).

## Sauvegarde parent préparée, inactive

`ops/supabase/001-parent-backups.sql` prépare une table liée à `auth.users`, clé
parent + slot local p1/p2, quatre politiques RLS, WITH CHECK insert/update, refus
anon et cascade à suppression du parent. `ops/supabase/parent-backup.mjs` est un
adaptateur injectable **non importé par l’application, absent de dist**. Session
Auth parent confirmée et consentement explicite exigés. Aucun token Management,
service_role ou secret key ne doit être utilisé par ce futur client.

Projection limitée à calibration et records; audio, noms, textes libres et champs
inconnus exclus. Les identifiants non ASCII sont actuellement refusés, ce qui
nécessitera une évolution pour certaines cartes scolaires. **Pas une sauvegarde
complète** des cartes, planning, récompenses ou préférences. Pas de restauration
automatique, interface Auth ou synchronisation livrée. Mode local inchangé.

Restent après confirmation réelle d’identité : revue du schéma/projection et du
consentement; exécution RLS réelle; migration explicitement autorisée sur projet
dédié; configuration Auth et redirections; clé publiable fournie explicitement sans
extraction par cet audit; UI connexion/consentement/déconnexion/export/suppression;
restauration, conflits multiappareils et sauvegarde complète. Ajuster la CSP vers
ce seul projet uniquement à l’activation. Aucune intégration distante revendiquée,
aucune ressource Luxura/Kennebec utilisée.

## Vérifications et limites

- **36 tests unitaires réussis** : 25 importés + 9 livraison/API + 2 sauvegarde.
  Preuve détaillée : `evidence/delivery-tests.tap`.
- `npm test`, `npm run build` réussis; YAML chargé avec le parseur js-yaml installé
  sur le runner, déclenchement manuel et défaut audit vérifiés.
- Navigateur tenté : endpoint Chromium indisponible avant interaction; aucune
  capture ni validation iPad réelle ajoutée.
- PostgreSQL serveur local bloqué par EPERM sockets. La tentative single-user
  privilégiée ne valide pas RLS et n’est pas retenue comme preuve. Les scénarios
  SQL doivent encore réussir dans le service PostgreSQL du workflow avant preview :
  deux parents CRUD, refus croisés dans les deux sens, anon, sujet absent,
  réattribution et cascade. Fixture Auth simulée; Auth Supabase réel reste à tester.
- Zones strictes vérifiées, fichiers non suivis inclus. Anciennes preuves importées
  conservées comme historiques.

Depuis la racine, sans écriture `.git` :

```sh
git diff --name-only -z HEAD > /tmp/famille-delivery-paths
git ls-files --others --exclude-standard -z >> /tmp/famille-delivery-paths
node projects/lecture-famille/ops/check-zones.mjs < /tmp/famille-delivery-paths
git diff --check
```

# État courant — 22 octobre 2026 (America/Montreal)

## Reprise et preuves

Dépôt personnel uniquement : `Lianag2018/educ-ecole`. Base revue :
`37fd3fd2a31f45fc0dc32c7abb3e2445fef3b75f` (PR27). Le dernier état détaillé
est conservé **sans modification de son contenu** dans
[PROJECT-STATE-HISTORY-2026-10-22.md](PROJECT-STATE-HISTORY-2026-10-22.md)
(blob Git `975f31078c69927739557245be14d0dbf50a946e`).
Consulter aussi [ACCESS-RUNBOOK](ACCESS-RUNBOOK.md), [VOICE-SETUP](../VOICE-SETUP.md)
et [l’audit pédagogique](AUDIT-PEDAGOGIQUE-2026-10-22.md).

La preuve de livraison de la PR27 indique une production Vercel réussie, version
`2026.10.22-retour-vocal`, 1 147 narrations, mais un retour oral OpenAI non activé.
Ne pas confondre ces deux états. Les anciennes mentions de publication en attente
dans l’archive ne remplacent pas les preuves de livraison des PR26 et PR27.

## Correctif de la réservation du budget

Branche existante reprise : `fix/supabase-budget-empty-response`.
`famille_reserve_voice` retourne SQL `void`. PostgREST répond alors HTTP204,
sans corps JSON. L’ancien adaptateur faisait systématiquement `response.json()` :
il pouvait déclarer un échec après une réservation pourtant validée en base.

Le client HTTP est isolé dans `ops/server/supabase-client.mjs`, appelé par le
runtime existant. **Seul POST sur `/rest/v1/rpc/famille_reserve_voice` accepte
HTTP204 sans JSON.** Authentification, profils, listes et `famille_save_plan`
(qui retourne JSONB) exigent toujours une réponse JSON. Les erreurs HTTP restent
bloquantes; `rate_limit` reste distinct. Aucun nouvel essai automatique, aucune
annulation de réservation après une réponse ambiguë, aucun changement SQL.

Validation locale : 24 tests ciblés avec les objets Response natifs de Node 22,
identifiants synthétiques et aucun appel réseau. Syntaxe du runtime et du client
vérifiée. Le runtime de départ a été reconstitué depuis le connecteur et son blob
Git vérifié avant modification. La suite complète n’a pas été réexécutée dans
ce conteneur, qui ne dispose pas du checkout complet.

`npm run build` exécute désormais `node ops/test.mjs` avant `ops/build.mjs`.
Un échec de test bloque donc la fabrication et la génération audio. La préversion
Vercel doit réussir pour le SHA exact avant toute fusion. Consigner dans la PR
les SHA, contrôles et résultats réellement observés après publication; ce document
ne prétend pas que cette publication a déjà eu lieu.

## Activation orale : blocage distinct

L’autorisation parentale et l’usage des accès personnels existants ont été donnés.
Ils ne sont pas à redemander. Aucune clé n’a été affichée ou extraite et aucun
service professionnel n’a été modifié.

Lors de cette reprise, le connecteur Vercel refuse encore le projet personnel
avec HTTP403. Les outils GitHub exposés ne proposent pas de déclenchement manuel
arbitraire des workflows; le contrôle cloud répond mais annonce le dépôt de
coordination, pas une opération dédiée d’activation scolaire. Aucune opération
professionnelle n’a été lancée en remplacement. La tentative de lecture du statut
public via le connecteur Vercel ne résout pas le déploiement; ce résultat ne prouve
ni une panne du site ni un changement de configuration.

Les valeurs attendues restent celles de VOICE-SETUP : compte parent réel,
Supabase personnel identifié, réservation durable, clé OpenAI serveur et conditions
de confidentialité effectivement vérifiées. Ne jamais déclarer ZDR, consentement,
identité ou budget vérifiés par simple modification d’un indicateur. Aucun audio
d’enfant envoyé ni test de reconnaissance réel dans cette reprise.

## Périmètre préservé

Aucune modification de l’interface, des plages p1/p2, des 78 PDF, des 49 étapes,
des 40 associations PédagoFA, du catalogue audio ou des données de progression.
Le lecteur et le studio local ne dépendent pas de l’activation de ce service.

## Référence technique

PostgREST 10 : les fonctions SQL `VOID` renvoient `204 No Content`.
https://docs.postgrest.org/en/v10/releases/v10.0.0.html

## Préparation des cahiers de 1re année — 22 octobre 2026

Les photos reçues (lecture, orthographe, mathématiques et aide-mémoire Nougat) servent de repères pédagogiques. `src/mely-grade1.js` contient 18 thèmes, 36 cartes originales et une liste de 100 mots, réservés au profil de 1re année. Aucun scan ni identifiant scolaire dans le dépôt. Les exercices existants, l'historique et le profil de 3e année restent inchangés. La présence du code n'est pas une preuve de publication; vérifier la PR, les tests et le SHA déployé avant d'annoncer la mise en ligne. La progression reste soumise aux réponses observées et à la confirmation du parent. L'accès au manuel intégral de l'éditeur n'est pas importé.

## Banque Kalulu reçue — 23 octobre 2026
Archive fournie par le parent : 328 MP3 (105 sons, 223 syllabes) et index; contrôle ZIP local réussi. Nouvelle interface uniquement pour Mely-Ann (1re année), listes fermées et sons distants épinglés à la révision Kalulu 185b6579, avec crédits CC BY-SA 4.0 et mention fr_FR. Aucun MP3 privé, mot de passe, transcription ni contenu de manuel ajouté au dépôt. Lecture à la demande requiert Internet. Les phonèmes québécois du jardin des sons restent inchangés; aucun crédit de progression automatique. Tests ciblés et déploiement à confirmer par GitHub/Vercel; pas de validation iPad physique.

## Correction de l’écoute « m + a » — 23 octobre 2026
Le parent rapporte que le haut-parleur prononce « mma aaaa ». La cause du prototype séparé est confirmée : il enchaîne un /m/ simulé et un /a/ enregistré. La correction proposée pour le haut-parleur normal de l’exercice m + a en 1re année utilise un unique enregistrement Kalulu ma.mp3 (fr_FR), jamais deux sons successifs. Lecture arrêtée sur changement de profil, activité et autre narration. Aucune modification des autres syllabes, de Liana, du micro ou des progrès. PR34 existante réutilisée; ne pas fusionner sans écoute parent sur iPad comme convenu. Contrôles CI et préversion à constater; le site de production n’est pas encore corrigé par cette PR.

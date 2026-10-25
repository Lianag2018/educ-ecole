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

## Audit des syllabes de Liana (3e année) — 23 octobre 2026
Les deux exercices de fusion du profil avancé conservent la narration complète des mots « animation » et « invitation ». Les morceaux déjà disponibles sont désormais cliquables (a/ni/ma et vi/ta), les morceaux sans enregistrement (in, tion) restent visibles sans bouton trompeur. La banque de sons et syllabes n'est pas modifiée; l'enregistrement fr_FR est facultatif, et les modèles complets gardent la narration existante. Le parcours de Mely-Ann, la progression, le micro et les données restent inchangés. Préversion et CI à vérifier avant fusion; pas de test iPad physique.

## Jardin des mini-défis p1 — 25 octobre 2026 (America/Toronto)

Base distante vérifiée avant édition : `d82eab8dee251f3fced81899b7f52a9d6be18378`.
Branche : `feat/p1-jardin-mini-defis`. Publication et SHA déployé à confirmer.

Ajout réservé à p1 en 1re année : jardin animé, quatre coins, 72 cartes originales,
trois cartes par séance, sans limite de temps. Quantités et représentations observées
dans la première activité Nougat; suites, dizaines et petits calculs prolongent les
repères photographiés déjà documentés. Aucune prétention d'analyse des 51 activités.
Liens conservés vers le portail et l'activité effectivement ouverte; aucun fichier
éditeur ni identifiant scolaire importé. Aucune commande de téléchargement proposée
n'a été trouvée dans les écrans consultés; aucune activité interactive copiée.

Réutilise `answer`, l'historique, les échéances de révision et les constantes de
progression existants. Paliers Maths séparés par coin, fondés sur plusieurs jours;
aide/erreur restent effectives après nouvel essai le même jour. Aucun crédit au
lancement ni à l'ouverture externe. Trois défis puis écran de pause et retour au
jardin. Le jardin des sons demeure accessible. Animation réduite respectée.

La narratrice et son cache existants portent les nouveaux textes publics (catalogue
borné à 1 442 entrées / 85 208 caractères). Aucun changement de modèle, de voix,
d'empreinte des anciens fichiers, de protocole micro ou de données serveur. Un build
local/préversion ne génère pas les nouveaux MP3; seule la production main autorisée
les produit. Vérifier son statut audio avant de déclarer la nouvelle voix disponible.

Validation : suite Node complète et build réussis, 328 MP3 Kalulu assemblés. Nouveaux
tests : exactitude des réponses, quantités, trois choix distincts, paliers sur jours
distincts, aide/reprises, priorité des révisions, conservation de l'historique et des
assignations au rechargement et isolation p2. Chrome local : entrée p1, jardin,
quantités, indice puis réponse accompagnée, erreur, bonne réponse, fin de trois
cartes et retour au jardin constatés. Voix système de secours observée localement;
les nouveaux MP3 exigent le build production. Pas de validation iPad/Safari physique.

Le connecteur Vercel personnel renvoie encore 403 à l'inspection. Cela ne démontre
pas l'échec de la connexion Git ni une panne. Prochaine action : PR et contrôles de
préversion, puis publication et preuve du SHA/version/audio réellement servis.

### Livraison vérifiée — PR48, 25 octobre 2026 (America/Toronto)

PR48 : https://github.com/Lianag2018/educ-ecole/pull/48, fusion squash
`9a11dd07d1c0964a0483c67d96f8ff2c08608fe6`. Préversion du head
`34b3c9d6b9ca95f2be0c8b0d6947d5a27f454788` réussie, workflow GitHub
`40238804614` réussi et 334 tests Node locaux réussis. La relecture locale du diff
a précédé la fusion; la revue automatique externe était encore en cours à ce moment.

Le tableau Vercel personnel confirme Production / main / `9a11dd0`, deployment
`2HESYG11bGi1rgWwXkmAZqgnnNQu`, Ready en 3 min 22 s, avec l'alias
`https://educ-ecole.vercel.app`. Statut GitHub Vercel réussi. HTTP public vérifié :
version `2026.10.25-jardin-mini-defis`, module `src/mini-garden.js` identique au
module testé, SHA-256 `315e1774ecfea730199708d04381c901e1da00fb9c9e06c83be36e53737dfe8f`.
`/audio/status.json` : ready, 1 442 / 1 442, 291 générés, 1 151 réutilisés, aucune
erreur. Les 328 sons Kalulu restent dans le build.

Chrome public : entrée p1, jardin, lancement d'un défi de suite numérique,
« Narratrice IA · français québécois · lecture douce », puis arrêt effectif constatés.
Aucune réponse de test ajoutée en production. Chrome local : trois essais conservés
après rechargement, monde p2 conservé. Préversion : lancement dizaines/calculs et
sortie sans crédit automatique. Les tests multi-jours restent synthétiques; aucune
maîtrise réelle ni validation Safari/iPad physique n'est revendiquée.

Les ressources Nougat restent des liens. Aucun téléchargement d'éditeur proposé
n'a été identifié dans les écrans consultés; aucun contenu interactif copié.
La publication utilise la connexion Git existante; le 403 du connecteur Vercel
n'a nécessité aucun changement d'accès ni de service professionnel. Prochaine action :
usage accompagné et observation des réponses réelles, sans réinitialiser les profils.

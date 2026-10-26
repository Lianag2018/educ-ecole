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


## Chemin Raconte-moi les sons p1 — 25 octobre 2026 (America/Toronto)

Base distante vérifiée : `8452afab2242c1af3443edbc6cc0231179fa82fd` (PR49).
Branche `feat/p1-raconte-moi-les-sons`; PR et publication à confirmer.
Le parent a confirmé le titre du cahier. Les pages imprimées 34–112 ont été
consultées dans la session Chrome scolaire autorisée : 71 découvertes originales
couvrant les 79 pages dans l’ordre. Repères page par page dans
[RACONTE-MOI-LES-SONS-2026-10-25](RACONTE-MOI-LES-SONS-2026-10-25.md).
Aucun PDF ni fichier éditeur téléchargé; le cahier reste un lien scolaire.

Ajout p1/1re année : écouter, choisir l’image du modèle oral, assembler, lire
avec l’adulte, petit défi animé et pause. Placement simple pour les premières
voyelles; modèle de mot entier pour h muet et groupes sans son isolé exact.
Les modèles de mots peuvent nécessiter une lecture accompagnée au début.
Les indices sont bornés aux exemples (c/g, ai, eu, ch, w, ill); aucune copie
d’histoire, de dessin ou de geste de l’éditeur. Le parent peut choisir la page
travaillée en classe sans créditer les pages sautées.

Réutilise `answer`, les échéances et `PROGRESSION_RULES`, agrégées par journée
pour les paliers de ce chemin. Aide/erreur conservées après nouvel essai.
Session additive `rmsSession` par profil, sans remplacement des anciens résultats.
Aucun changement du moteur existant, p2, base serveur, micro ou consentements.
Les lecteurs de narration, phonèmes et Kalulu existants sont réutilisés;
catalogue borné à 1 579 entrées / 88 924 caractères, anciens paramètres inchangés.
Les nouveaux MP3 ne sont produits que par le build production main.

Validation locale : suite Node complète et build réussis, 328 MP3 Kalulu.
Tests ajoutés : couverture et ordre des pages, cas de contexte, choix uniques,
paliers multi-jours, aide/reprises, conservation ancienne progression et p2.
Chrome local : écoute enregistrée a, image erronée puis correcte accompagnée,
placement a, mot avec réécoute comptée comme aide, défi final, pause, rechargement
et reprise à la pause; h muet sans bouton de phonème constatés. Narration système
de secours locale; aucune prétention de validation des nouveaux MP3 production.
Pas de test Safari/iPad physique ni de maîtrise réelle revendiquée.

Prochaine action : relire le diff, contrôler CI et préversion au SHA exact,
publier puis vérifier version servie et disponibilité des narrations.


### Livraison vérifiée — PR50, 25 octobre 2026 (America/Toronto)

PR50 : https://github.com/Lianag2018/educ-ecole/pull/50, fusion squash
`fcc58389f153bd9a01a6c94218e8d98cf5b4832c`. Head testé
`6a3162df4d35b177a7f9995151cb836e589e67aa` : 338 tests Node réussis,
workflow GitHub `40246647308` réussi, préversion Vercel
`Dq1yVoHudBdGDLoJG5HPjEUBsv4z` Ready. Diff relu localement avant fusion;
revue automatique externe encore en cours au dernier contrôle.

Production / main / `fcc5838`, deployment `G38ySGrbyg69oL1o2v8revP1p3qV`,
Ready en 1 min 24 s; alias https://educ-ecole.vercel.app confirmé dans Vercel.
Version HTTP publique : `2026.10.25-chemin-des-sons`. Les trois fichiers publics
sont identiques octet par octet aux fichiers testés :

- rms-course.js SHA-256 `860f60cb3120940c69cd16666c2014e01bf82cc89cdbd53924ab9c08937bce02`
- rms-player.js SHA-256 `e594f0c65fd065dd66e78fe18b1d97b058155e79453fb047849813075851e6c4`
- rms-course.css SHA-256 `0bde48c38629d1061e64f0143dcd773c324c0853a4c1d1bd7831753db1323e4e`

Statut audio public : ready, 1 579 / 1 579, 131 générés, 1 448 réutilisés,
aucune erreur. Comparaison des catalogues : les 1 442 anciennes empreintes
sont conservées; 137 nouvelles entrées. Un nouveau MP3 d’indice est réellement
servi et identifié MPEG layer III / mono / 24 kHz.
Chrome public : entrée p1, chemin, lancement page 34, statut « Narratrice IA ·
français québécois · lecture douce », arrêt effectif et retour à la carte
constatés. Aucune réponse de test ajoutée en production. Préversion : lancement
et arrêt constatés. Les essais complets et le rechargement ont été faits en local.

Livré. Prochaine action : pratique accompagnée dans l’ordre de la classe;
choix de page avec l’adulte si nécessaire, sans réinitialiser les deux profils.
Le cahier a été consulté en ligne, pas téléchargé en PDF.

## 26 octobre 2026 · UTC — Voyage magique, préparation

Branche `feat/voyage-magique`, base distante vérifiée
`fe35483f98bcf277b9c60de357858a22d5e98129`. Accueil illustré des deux sœurs,
Mexique/Cuba/République dominicaine/royaume imaginaire; histoires p1/p2 et jeux
avec coquillages SVG, étoiles dédupliquées, bilan parent et ailes hebdomadaires.
Ancien checkout laissé intact. Aucune donnée locale familiale migrée ou supprimée.

345 tests Node réussis au premier contrôle, dont sept nouveaux tests de récompenses;
build local réussi sans génération payante. Chromium local indisponible : le
 téléchargement du binaire retourne une archive tronquée. Vérification visuelle
interactive et livraison distante encore à confirmer; ne pas annoncer production.
Image créée avec le générateur intégré depuis l’illustration approuvée : deux
sœurs aux visages conservés, ailes et cornes de licorne au-dessus d’une mer
caribéenne imaginaire, sans texte ni interface dans le bitmap; encodage WebP.

### Vérification de la préversion — 26 octobre 2026, 03:34 UTC

PR52 ouverte : https://github.com/Lianag2018/educ-ecole/pull/52.
Premier commit distant `7a5710e2710514ed1035bb589db521422cb06b7e`, préversion
Vercel Ready confirmée via statut GitHub et commentaire Vercel (pas via le
connecteur Vercel, qui retourne 403 sur l’équipe personnelle).
URL : https://educ-ecole-git-feat-voyage-magique-lianag2018s-projects.vercel.app/.
Navigateur distant réel : accueil illustré affiché, choix p1, première histoire,
réponse correcte et +5 étoiles, quatre coquillages, deuxième réponse correcte,
retour avec 10 étoiles, changement p2 avec zéro étoile confirmé. Données de test
uniquement dans le navigateur de préversion. Pas de test Safari/iPad réel.
La voix système est indisponible dans ce navigateur; qualité audio non validée.
Les textes de voyage rejoignent le catalogue de narration de production sans
élargir le budget d’alignement. 346 tests et build local final réussis.
Production inchangée; fusion non effectuée. Révision visuelle et interactive
réussie sur le parcours indiqué; prochaine étape : accord de fusion PR52.


### Révision dominicaine — 26 octobre 2026, UTC

Même branche `feat/voyage-magique`, même PR52; head distant de départ vérifié
`317e5c369093a1dbfeeaafa9bfc9877ea2466fb1`. Remplacement du choix principal
de quatre destinations par « Le trésor des deux sœurs » : bateau pirate,
palmiers, coffre sur la plage. Neuf activités originales par profil avec
différenciation de lecture, de calcul et d’indices. Illustration générée à
partir des références fournies; seuls les pixels illustrés optimisés en WebP
sont livrés, aucune photographie originale ni information de séjour.

353 tests Node et build local réussis. Les tests couvrent dessins/comptages,
calculs/base dix, variantes de lecture, progression distincte des réussites,
conservation des profils et catalogue de narration. Ordre du récit conservé
au rejeu; dates et règles des récompenses hebdomadaires inchangées.
Les voix nouvelles ne sont pas produites dans une préversion. Safari/iPad
physique et acoustique non validés. Version `2026.10.26-tresor-dominicain`.
Prochaine étape : vérifier la préversion interactive sur ce nouveau contenu.
Production inchangée; aucune fusion effectuée.


Contrôle réel sur la préversion de `fea22c72f2868479ab4203d5dfcccd4d6e0b5dc8` :
Vercel success; nouvel accueil illustré affiché. p1 : compréhension de la carte,
trois voiles SVG et mot « jardin » répondus correctement, +5 étoiles à chaque
défi; fin du chapitre puis bouton vers le sentier des palmiers fonctionnels.
Essais synthétiques dans le navigateur de préversion uniquement. Une dernière
correction supprime les numéros décoratifs devant les choix de cette aventure
pour ne pas les confondre avec les réponses de comptage; l’ancien atelier est
regroupé sous un volet secondaire. 353 tests et build repassés avec succès.
La voix reste indisponible dans ce navigateur distant, sans conclusion sur
la qualité acoustique.

### Voix douce et rythme naturel — 26 octobre 2026 (America/Toronto)

Demande parent : conserver une voix douce, à vitesse naturelle ajustable.
Même PR52, départ distant `068bf1e8fe49aa1b974010f3546ba0d635451681`.
Les 179 nouveaux textes propres aux aventures demandent désormais un rythme
naturel et fluide, voix féminine douce en français québécois, génération à 1x.
Les 1 579 empreintes des enregistrements pédagogiques antérieurs restent
identiques : aucune régénération globale; aucun texte retiré. Le multiplicateur
0,65 imposé à la voix native est retiré; le mode explicite historique de sons
très lents reste conservé. Curseur 0,6–1,5x et valeur sauvegardée inchangés;
hauteur de la voix MP3 préservée pendant les changements de vitesse.

355 tests et build local réussis, dont reprise au mot courant, débit natif,
persistance du réglage et instructions des contes. Aucun appel de génération
payante effectué. L’écoute réelle de ces nouveaux MP3 n’est pas validée : leur
production attend le build main autorisé. Ne pas confondre configuration/test
logiciel et qualité acoustique. Production inchangée; fusion non effectuée.

## Révision du début de lecture — 26 octobre 2026 (America/Toronto)

Même branche et PR52, départ distant 6f38839603dd75eed3cb5bc79f8c4036e09d6c24.
Audit des banques et parcours documenté dans AUDIT-NIVEAUX-2026-10-26.md.
Variantes courtes pour 15 compréhensions p1, mots-indices isolés, affichage phrase
par phrase et choix pictographiques. Compréhension orale séparée des paliers de
lecture autonome; pas de progression automatique après le Bravo p1. Représentations
exactes de trois calculs; notions ultérieures du cahier sous un volet parent.
P2 conserve ses textes et raisonnements, données et récompenses conservées.

360 tests Node réussis, dont cinq nouveaux contrôles de contenu, séparation,
conservation des textes scolaires et dessins/calculs. Build local réussi sans
appel TTS payant. Chromium local non installé : archive téléchargée tronquée.
Aucune validation Safari/iPad physique ou acoustique. Nouveaux MP3 non générés
par la préversion. Production inchangée, pas de fusion. Vérifier le déploiement
et le parcours dans le navigateur distant avant d’annoncer la livraison.

### Pop-it supplémentaire — 26 octobre 2026 (America/Toronto)
Intégration au-dessus de l'audit partagé f30f1a73, sans remplacer ses corrections.
Fenêtre modale native : bulles réversibles, consigne écoutable, cinq défis sans
chronomètre. Débutant : additions/soustractions de quantités jusqu'à 10. Avancé :
ajout de petites multiplications/divisions exactes représentées en rangées.
Résultats séparés dans profile.popit; les erreurs restent accompagnées après
réouverture le même jour. Aucun crédit automatique de maîtrise ou de plan hebdo.
Tests arithmétiques et isolation des opérations ajoutés; contrôle navigateur et
préversion à consigner après livraison. Aucun test physique iPad revendiqué.

Validation Pop-it : 362 tests Node et build local réussis; préversion Vercel
3acffb92 réussie. Navigateur réel : p2 ouvre la modale, enfonce trois bulles,
reçoit le retour d'erreur puis la réussite accompagnée; changement multiplication
et rangées observés. Données synthétiques dans la préversion seulement.
Correction visuelle finale : diamètre des bulles borné même avec une seule colonne.
Production non fusionnée. L'écoute humaine et l'iPad physique restent non vérifiés.

## Pop-it complet de troisième année — 26 octobre 2026 (America/Toronto)
PR52, base 91c272d. La troisième année ouvre d'abord le calcul et un champ de
réponse libre. Le petit Pop-it ouvre/réduit une aide complète de 144 bulles,
axes 1–12 et produits comme le matériel fourni; additions/soustractions utilisent
une numérotation 1–144. Sur téléphone, le tableau défile horizontalement pour
conserver des cibles de 44 pixels. Aucune réponse saisie n'est perdue en ouvrant
l'aide. Les bulles restent enfoncées après réduction/réouverture dans le défi.
Défis : additions/soustractions à deux chiffres avec regroupement, tables 1–6,
extension facultative jusqu'à 12. Cinq problèmes par opération/palier. L'aide ou
une erreur restent conservées dans le résultat journalier; aucun effacement des
anciennes réussites. Défis débutants inchangés. Tests du tableau, de l'arithmétique,
de l'aide persistante et de la séparation des profils; préversion à vérifier.

## Accueil original préservé — 26 octobre 2026 (America/Toronto)
PR52, départ distant 7295b7e. À la demande du parent, l’entrée reprend exactement
l’illustration accueil-famille.png, ses visages et le choix des deux profils.
Le bateau reste dans le voyage après sélection. Décor animé par CSS : nuages,
étoiles, soleil doux et trois lucioles; aucun visage régénéré, aucun service vidéo.
Case de pause des animations et préférence système de réduction respectées.
Préversion et contrôle visuel de cette révision à confirmer; production inchangée.

## Dossier photo de devoirs — 26 octobre 2026 (America/Toronto)
PR52, base f8d8189. Espace Parents : dossier local IndexedDB par profil/semaine,
8 photos JPEG/PNG/WebP maximum; préparation JPEG réduite sans métadonnées, aperçu,
sélecteur téléphone/appareil photo et suppression individuelle confirmée. Aucun
envoi automatique ni synchronisation annoncée. Une photo sauvegardée peut alimenter
le formulaire d’analyse existant avec confirmation réinitialisée; protections du
serveur intactes. Activation réelle de l’analyse à vérifier séparément.
Accueil original conservé. Vidéo Runway demandée depuis voyage-soeurs.webp, tâche
f7b5d6d2-3f21-48d6-983f-de4f217d01eb : génération en cours, pas encore intégrée.


## Correctif des modèles français — 26 octobre 2026 (America/Toronto)

Base distante revérifiée : `fe35483f98bcf277b9c60de357858a22d5e98129`.
Branche `fix/french-word-models`; publication à confirmer. Signalement parent :
prononciations mélangées/anglicisées et voyelles étirées dans les aides de lecture.
Cause confirmée dans le code : synthèse de fragments isolés, par exemple
« bi. bli. o. thèque. bibliothèque. », plus ralentissement génération à .85
et secours natif à .65. Les tests précédents vérifiaient disponibilité/lecture,
pas la qualité phonétique à l’oreille; leur réussite ne prouvait pas celle-ci.

Les 16 aides de décodage et les modèles du chemin des sons lisent désormais
des mots entiers en contexte français. « Tu choisis. Choisis. »,
« Rapporte le livre. Rapporte. », « La bibliothèque. Bibliothèque. ». Les choix
constitués d’un mot isolé reçoivent aussi un contexte français; nombres/ponctuation
gardent leurs règles. Les boutons annoncent le mot entier; les découpages sont
des repères oraux visuels. Repère oral rapporte corrigé en ra / porte;
l’orthographe rapporte du texte scolaire reste intacte, avec ses deux p.
Échec d’un MP3 de syllabe : message explicite, sans deviner sa prononciation
avec une synthèse d’un fragment brut. Les vrais phonèmes et syllabes enregistrés
restent utilisés. Aucun identifiant de carte ni résultat réinitialisé.

292 entrées de phonétique/modèles/lecture sociale demandent une diction française
liée et naturelle, sans chant, scansion ou étirement, vitesse de génération 1.
Nouvelles empreintes incluent cette vitesse : les anciens fichiers concernés ne
peuvent pas être réutilisés. Autres paramètres, voix coral et modèle existants
conservés; catalogue borné 1 580 textes / 90 720 caractères. Secours système
des modèles à vitesse naturelle, voix française obligatoire et réglage parent
respecté; autres lectures gardent leur comportement.

341 tests et build réussis (328 Kalulu) avant dernière modification de routage
vers le modèle du mot entier. Le premier head PR53 échoue en CI sur une assertion
de source du parcours Liana : son appel de lecture attendu avait été déplacé dans
un ternaire. Le nouvel appel reste limité à p1 et l’appel d’origine de p2 est
conservé explicitement. Suite complète et préversion à revérifier au head corrigé. Tests ajoutés : association
des cinq mots, absence des anciennes séquences fragmentées, couverture de tous
les modèles, corps de requête/vitesse, voix française et débit du secours natif.
Chrome local : cinq boutons repérés et actionnés, état Amélie/fr-CA et arrêt
constatés; la connexion d’onglet a interrompu la première vérification, reprise
le 26 octobre. Aucune écoute humaine de chaque fichier ni garantie d’accent
parfait n’est revendiquée. Aucun microphone ou enregistrement d’enfant transmis.

Réglages vérifiés avec la documentation officielle OpenAI :
https://developers.openai.com/api/docs/guides/text-to-speech
Elle permet le pilotage d’accent/débit par instructions, mais précise aussi que
les voix sont optimisées pour l’anglais : la consigne seule n’est pas une preuve
de qualité française. Prochaine action : CI/préversion, publication, contrôle des
nouveaux MP3 et de l’association au bouton; puis écoute familiale des modèles.


## Réconciliation PR52 / PR53 — 26 octobre 2026 (America/Toronto)

Head voyage de9078c réconcilié avec main 644776d (correctifs des modèles
français). Les cinq conflits sont résolus en conservant les deux historiques,
les modèles français en mots entiers, leurs empreintes audio corrigées, le
rythme naturel des voyages et la lecture phrase par phrase des débutantes.
Accueil original, Pop-it complet p2 et dossier photo local conservés. Le test
de voix de secours attend désormais le multiplicateur choisi à 1×, conformément
au réglage naturel du voyage, sans ancien facteur caché de 0,65.
Suite Node et build local réussis. Les photos locales sont distinguées de
l’analyse serveur dans le formulaire parent. Vidéo candidate générée mais
non intégrée : fidélité visuelle encore à revoir. Aucun nouveau rendu payant,
aucune fusion vers main, aucune réinitialisation des données. Préversion du
commit de réconciliation à vérifier après publication.

### 2026-10-26 — Première page animée par Runway (PR52)
L’illustration originale accueil-famille.png sert de référence au clip accueil-anime.mp4 (10 s, muet, 4:3, 1,42 Mo). Revue de frames à 5 et 9 s : composition, visages et textes préservés, clignements/sourires et geste de la chouette. Image originale en secours; vidéo visible après playing, pause via la case existante, arrêt en arrière-plan et réduction des animations système. Nettoyage du lecteur au changement de page. 371 tests et build réussis; lecture et pause/reprise vérifiées sur la préversion Vercel. Aucun changement de production ni fusion.

### 26 octobre 2026 — Bravo et Pop-it cohérent (America/Toronto)
PR52, base 8aa5756. Bonne réponse actuelle célébrée même après aide, sans transformer le résultat accompagné en réussite autonome. Bravo visuel animé, narration existante courte et passage suivant après 4 secondes indépendamment de la disponibilité audio, pour les deux profils. Rester ici annule le passage mission; fermeture/changement annulent les callbacks, aucune avance en onglet caché. Pop-it : mêmes félicitations et suite automatique, tableau complet 12×12 préservé pour p2; additions/soustractions bornées à 12, facteurs/diviseurs et quotients des tables jusqu’à 12. 375 tests et build local réussis. Préversion à vérifier; production inchangée.

## Refonte illustrée — 26 octobre 2026 (America/Toronto)

Première tranche sur PR52 / feat/voyage-magique, départ distant 478ae04.
Accueil original et données conservés. Ajout de scènes de graines manipulables,
additions/soustractions représentées et six défis de groupes ×/÷ pour p2.
Accès directs depuis le voyage, textes de présentation raccourcis. La voix met
à jour les contrôles sans reconstruire la scène ni perdre les objets sélectionnés.
Les jeux gardent le moteur de réponses, la distinction aide/erreur et les profils.
Les calculs hors contrat graphique conservent leur rendu existant; le Pop-it
complet 12×12 reste disponible, sans modification de ses plages.

381 tests Node réussis et build local réussi, dont six tests de quantités,
manipulations, limites, séparation des profils et mise à jour audio sans remplacement.
Aucun appel payant de génération. Publication et contrôle navigateur à confirmer.
L'extension du navigateur utilisateur n'est pas accessible dans ce contexte;
la vérification utilisera le navigateur distant. Aucun test Safari/iPad physique.
La transformation des autres parcours et les expressions animées des personnages
restent à réaliser. Aucune fusion main ni modification des services professionnels.

Contrôle préversion 72fe261 : statut Vercel success (HHQMXd2M9nzLPsTwJE5CV3mV3ssX).
Chrome distant : accueil intact, collections zéro puis un, graine sélectionnée
conservée pendant l'écoute, remise à zéro, bonne réponse et passage automatique;
p2 : trois groupes de quatre, manipulation puis réponse accompagnée (sans étoiles
supplémentaires), passage à quatre groupes de six. Données de test uniquement.
Le contrôle a révélé un guillemet manquant sur le raccourci Sons/Défis, corrigé
avec un test de non-régression. Fin audio : retrait du surlignage sans reconstruire
la scène. 382 tests et build finaux réussis. Le correctif doit être vérifié sur
la préversion finale; les premières preuves navigateur portent sur 72fe261.

## Accueil : liens dans l’illustration — 26 octobre 2026 (America/Toronto)

Même PR52, base distante dcf97c5. Image et vidéo originales désormais affichées
entières au ratio 4:3, largeur jusqu’à 1400 px. Suppression des deux cartes de
profil répétées sous l’image. Boutons HTML sur les deux « C’est parti! »,
l’espace parent et les quatre cases sons/syllabes/lecture/nombres. Chaque
raccourci choisit explicitement le bon profil avant l’activité. Focus clavier,
libellés accessibles, pause et réduction des animations conservés. Aucun
changement d’historique, de voix, de microphone ni d’autorisation serveur.
382 tests et build locaux réussis. Vérification visuelle de préversion à suivre;
aucune validation iPad physique. Les autres éléments dessinés du bitmap ne sont
pas tous des contrôles actifs. Production inchangée.

## Accueil : texte unique et poussière d’étoiles — 26 octobre 2026
PR52, base feba415. Retrait du texte HTML superposé et des fonds opaques des
boutons de départ : seul le lettrage de l’illustration reste visible. Zones
accessibles transparentes conservées. Transition décorative de 18 étoiles,
720 ms avant activation du bouton existant, sans crédit de progression.
Double clic bloqué pendant la transition; navigation annulée si la page est
quittée ou cachée. Animation réduite/pause : ouverture immédiate sans étoiles.
Suite complète et build réussis. Préversion interactive à vérifier; pas de
validation Safari/iPad physique. Production inchangée.

## Ressemblance de Liana — 26 octobre 2026
PR52, base f7b0352. Image dominicaine retouchée avec le générateur intégré :
visage et cheveux de la sœur brune guidés par le personnage de droite de
accueil-famille.png. Tenue rayée, carte et composition conservées. Consigne :
reprendre les proportions illustrées, yeux, joues et sourire de la référence;
ne pas changer la petite sœur ni le décor. Revue visuelle effectuée, encodage
WebP qualité 88. Aucun code de jeu modifié; accueil original inchangé.
Préversion à contrôler; cette retouche est une image fixe, pas une nouvelle vidéo.
Audit des apparitions : src/app.js utilise accueil-famille et accueil-anime;
les avatars .portrait/.family-face recadrent la même référence accueil-famille.
La couverture dominicaine est partagée par les deux profils. voyage-soeurs.webp
est visuellement cohérent mais sans référence active dans src. Les icônes app
représentent la chouette, pas les enfants. Contrôle visuel du visage à 1,3 s dans
le lecteur de préversion; audit complet des frames vidéo non conclu : les copies
MP4 téléchargées produisent des erreurs de décodage ffmpeg. Ne pas revendiquer
une validation intégrale de chaque frame ni modifier la vidéo sur cette base.

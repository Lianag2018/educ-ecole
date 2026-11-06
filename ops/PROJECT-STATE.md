# Accueil vocal — 6 novembre 2026 (America/Toronto)

Base main vérifiée b2ef287 (PR93). Production Grok activée, déploiement
 dpl_3xwqQjXXogmk7TWvmDfrENDh3Tbd READY; statut public available:true.
Retour audio réel vérifié au déploiement précédent, sans audio entrant.
Les indications historiques ci-dessous sur l'activation sont remplacées.

Correction des commandes illustrées sans cible tactile : chouette, nombre,
haut-parleur et micro du nombre. La chouette ouvre son écran; le nombre ouvre
l'exercice adapté au profil actif (7 ou 307); le haut-parleur lit le 307 illustré.
La navigation seule ne capture aucune voix. Le bouton explicite de la séance
conserve le contrôle d'accès serveur et la coupure existante.

Le statut différencie désormais connexion parent absente et service indisponible;
un bouton mène directement à Réglages et accès. Aucun secret, budget, mécanisme
d'authentification ni donnée familiale modifié. Validation navigateur avec faux
statuts prévue sur les deux profils; publication à confirmer sur la PR.
Aucun essai physique iPhone/iPad revendiqué.

# Grok — cause de refus du ticket isolée — 6 novembre 2026 (America/Toronto)

PR93 ouverte sur Lianag2018 depuis le fork personnel, correctif complété.
Le diagnostic réel du relais montre `authentication_failed`, phase `ticket`,
code `ticket_decrypt_failed`. Le tour de parole manquant n'était donc pas
l'unique cause du probe échoué. L'utilisation de la valeur d'une clé API comme
secret partagé exigeait que les deux environnements aient exactement la même
chaîne; elle est remplacée par une clé dédiée dans le coffre Supabase.

Migration `grok_relay_dedicated_vault_key` appliquée. La clé est générée dans
Vault, jamais imprimée ou copiée au dépôt. RPC SECURITY INVOKER, exécution
réservée à service_role, droits anon/authenticated refusés et vérifiés.
Vercel et le relais chargent cette même clé pour les tickets AES-GCM.
Le budget durable, l'usage unique et la coupure serveur 120 secondes restent.

Relais déployé version Supabase 6, santé `educ-grok-v3`. Il garde le worker actif
et reconnaît `conversation.item.created` ainsi que l'ancien alias `added`.
Diagnostics limités aux noms d'étapes fixes, sans corps fournisseur ni audio.
24 tests ciblés passent; suite générale en cours à cette écriture. Retour audio
réel encore à vérifier après fusion et redéploiement de Vercel. `enabled` reste
false jusqu'à cette preuve. Aucun essai physique iPad revendiqué.

# Grok — le jeton seul ne fait pas parler — 6 novembre 2026

Le déploiement `dpl_DBeyT18czQ8CGeUW3EYZFc8eKg1H` échoue parce que le probe
entend le relais, crée le jeton, puis ne reçoit aucun audio. Cause dans le
relais v1 : `response.create` part dès `session.updated`, sans tour. Avec la
détection de silence, Grok attend une phrase et ne salue pas.

Correctif : après `session.created`, envoyer `session.update`; après
`session.updated`, insérer un seul tour texte fixe; seulement ensuite
`response.create`. Le modèle du socket est `grok-voice-latest`. Santé attendue
après redéploiement du relais : `educ-grok-v2`. Le probe Vercel reste un échec
tant que Supabase sert encore v1. `enabled: false` laisse aussi les boutons
fermés; ce n’est pas corrigé par ce diff.

# Grok — relais déployé et raccordement en validation — 6 novembre 2026

Cette entrée remplace les anciens états « transport non construit ». Le parent
renonce explicitement à l’essai adulte préalable; aucun indicateur adulte fictif
n’est ajouté. Les tests techniques restent requis.

Relais personnel Supabase `educ-grok-relay` déployé, version 1; schéma
`grok_relay_single_use_reservations` appliqué. Autorisation par ticket chiffré
AES-GCM/HKDF, durée 120 secondes, consommation atomique d’une réservation
existante, refus des messages de configuration du navigateur. La clé xAI reste
sur Vercel; seul le relais récupère le jeton éphémère dans le ticket chiffré.
Aucune donnée vocale ou transcription n’est enregistrée par notre relais.

Adaptateur PCM navigateur et session Vercel ajoutés. Contexte scolaire fourni par
identifiant serveur, nombre borné au profil. AudioContext ouvert au toucher pour
Safari, fermeture capture/lecture/transport sur abandon et arrière-plan.

Validation locale : 20 tests ciblés réussis; 81 suites générales réussies.
Deux suites ne s’exécutent pas complètement dans la copie locale partielle :
assets icônes/manifest et phonèmes non téléchargés. CI complète requise.
Contrôle réel SQL : ticket inconnu refusé, RPC interdit à anon/authenticated et
autorisé au seul service_role. Aucun essai vocal réel ni iPad physique.

Activation restante : configuration Grok de production distincte d’OpenAI,
contrôles CI, fusion et probe de connexion xAI/relais côté build pour un SHA
précis. Le probe est payant, réservé au budget et ne transmet aucun audio.
La présence du relais ACTIVE ne prouve pas une connexion fournisseur réussie.

# Grok — raccordement commencé, non activé — 6 novembre 2026 (America/Toronto)

Base vérifiée : main `c1f9cc88a1b19cd81331c16aaf7922170d86278e` (PR91),
production Vercel `dpl_EtQFeXdFq4fiphiXYXkC21XvA3De`, vidéos publiées.
Branche de travail : `codex/grok-reading-live`. Cette entrée décrit du code
préparatoire, pas une voix opérationnelle ni une nouvelle production.

`EDUC_XAI_API_KEY` est désormais installée côté serveur personnel, variable
sensible, production uniquement. Transfert GitHub autorisé terminé, reçu
`luxurahair/kenebec-ai/actions/runs/42265378847`; inventaire Vercel vérifié sans
déchiffrement. Aucun secret n'a été exposé. Ne pas refaire le transfert.

Ajouts : trois boutons initialement indisponibles, statut dédié, cycle de vie
annulable du microphone et contrat de transport injectable. Nettoyage sur arrêt,
changement de profil, navigation, arrière-plan et déconnexion. Aucun transport
Grok réel n'est fourni par cette branche; le serveur refuse toute émission.
Les tests utilisent uniquement un faux micro et un faux transport.

Vérification : suite `npm test` réussie, dont 11 nouveaux tests de refus et de
courses asynchrones. Aucun essai vocal réel/adulte/enfant ni Safari physique.

Blocage précis : le jeton éphémère xAI expire pour l'ouverture, mais ne ferme pas
la session ouverte. Le serveur doit posséder le transport et sa coupure pour
respecter le plafond familial durable. La documentation xAI précise que la session
survit à l'expiration du jeton; ne pas remplacer cette garantie par un minuteur
client. Le transport serveur borné, la validation d'accès voix du compte, la revue
xAI et le premier essai adulte restent à réaliser. Ne pas fusionner ce brouillon
en présentant les boutons comme fonctionnels.

Prochaine action : implémenter et héberger le relais personnel borné, raccorder
réservation durable et contexte scolaire validé côté serveur, puis tester avec
un adulte. Aucun service professionnel à modifier pour cette étape.

# Reprise de la livraison Nougat — 6 novembre 2026 (America/Toronto)

PR91 reprise au SHA `486fee84fc597018cceedf110143097e8d5f34d8`.
Les deux workflows du dernier SHA sont réussis : vérification des deux profils
`42244613667` et vérification de l'évolution `42244613748`. Le job d'évolution
payante est skipped sur une PR, comme prévu; cela ne signifie pas qu'il est activé.
Les contrôles comprennent les parcours navigateur, la base de test, les imports
parent, la pagination, l'isolation des profils et l'arrêt des lecteurs.

Revue du diff complet, trois tests ciblés vidéo et build local réussis à la
reprise. Préversion Vercel `dpl_Ejj3QkLX6YKd6bHryfEzZLcW2meN` READY sur ce SHA.
Le navigateur de revue atteint la protection Vercel; aucun accès partagé créé
et aucune protection modifiée. La validation UI distante automatisée est verte;
aucun essai manuel de cette préversion ni essai physique iPad revendiqué.

Prochaine action : fusionner la PR91 vérifiée, attendre le déploiement Git et
contrôler le SHA de `educ-ecole.vercel.app` et le parcours public. Grok live et
la refonte des autres écrans restent à réaliser; ne pas annoncer leur activation.

# Vidéos et exercices adaptés — 6 novembre 2026 (America/Toronto)

Base main : `6e1ab7ca9abf283c1cfd459cfd671eeee257f83d` (PR90 architecture).
Ajout d’une salle vidéo, entrées Prof à la guitare et Maître Lucas dans le monde
des deux filles et entrées par matière. Catalogue officiel : 37 vidéos du Prof,
huit de Maître Lucas, autres vidéos existantes conservées. Déterminants en
priorité parmi les leçons disponibles aux deux profils.

Chaque vidéo a deux exercices originaux. Aides et erreurs conservées par journée,
reprises prioritaires, deux journées indépendantes avant consolidation; variantes
pour noms/déterminants/adjectifs et tables. Les autres notions gardent leur
pratique initiale. Progrès locaux isolés, aucune maîtrise clinique annoncée.

Lecteurs intégrés au toucher, arrêt navigation/arrière-plan; catalogue paginé
et étapes vidéo/questions séparées. Aucun fichier de créateur téléchargé.
Sources publiques officielles vérifiées le 6 novembre; intégration réellement
disponible encore dépendante de YouTube. Pas de prétention d’essai de tous les
enregistrements ni de l’iPad physique.

Validation : 516 tests Node et build local réussis. Chromium local ne fournit
pas de point de débogage dans cet environnement; test navigateur ajouté au
workflow existant pour les deux profils, pagination, tailles tablette/téléphone,
lecture au toucher, arrêt et sauvegarde. CI et production à confirmer sur la PR.
Grok live et refonte des autres écrans restent en cours, pas activés ici.

# Architecture actualisée — 6 novembre 2026 (America/Toronto)

Base distante et production vérifiées :
`164b733f8294fbc1e6723c6593cd9e59d390ae4c` (PR89), Vercel READY, source Git/main.
PR88/89 publiées; PR89 : 513 tests locaux, build et contrôles CI réussis lors
 de sa livraison. Les mentions « à confirmer » de ces entrées sont historiques.

Demande parent intégrée dans ARCHITECTURE, VOICE-SETUP et ACCESS-RUNBOOK :
écoute Grok en direct avec aide sur la lecture, reprise sécurisée de l’accès
XAI_API_KEY existant dans Luxura, écrans enfants entièrement utilisables sans
défilement obligatoire, pagination des contenus longs et adaptation p1/p2.

Complément demandé : raccorder « Parler avec la chouette » et « Lis ce nombre à
voix haute » sur l’accueil au même service Grok, avec contexte scolaire du profil
actif et une seule session micro à la fois. Contrat ajouté dans ARCHITECTURE et
VOICE-SETUP; ces deux fonctions live restent à développer.

Cette livraison est documentaire uniquement. Aucun écran modifié, aucune clé
copiée, aucun appel vocal, aucun réglage enfant ou de rétention désactivé.
Le transport Grok et la refonte des écrans restent à implémenter puis tester.

Prochaine action : auditer le chemin serveur autorisé du secret existant sans
le divulguer, vérifier les capacités vocales/configuration du compte, préparer
l’adaptateur; en parallèle logique, réaliser les vues paginées et vérifier les
deux profils. Une console xAI déconnectée n’est pas une preuve d’absence de clé.

Validation de cette livraison : revue documentaire et diff; contrôles CI à suivre
sur le SHA de la PR. Aucun test acoustique ou physique iPad revendiqué.

# Comptines.tv par niveau — 6 novembre 2026 (America/Toronto)

Base main : 88ecbe1b2e564ac5085a2266a7813c1ced7e1cc1, PR88 publiée et contrôles verts.
Ajout de cinq activités ciblées, dans les catégories enfant déjà présentes :
1re/2e → Français (voyelles, son ou), Maths (compter 1–12 et deux groupes de six).
3e → Français (compréhension de la forêt, vocabulaire et pluriels en ou).
Le niveau initial suit le profil; le sélecteur permet de revoir les bases.
Deux questions originales par activité; progrès locaux séparés existants conservés.
Liens externes directs Comptines.tv vérifiés; les pages proposent chanson et/ou
texte. Aucun lecteur intégré ajouté, aucun audio/paroles copié, aucune activation IA.
Validation locale et CI à confirmer sur la PR avant publication.

# Chansons par matière et bonds — 5 novembre 2026 (America/Toronto)

Base main et production vérifiée : ebf4248a96779a4caa8f9ebbe0b13fe2e590e0a0 (PR87).
22 fiches musicales / collections : Français, Maths, Temps et nature, Émotions
et respect. Niveau exploré 1–3 sans changer le profil; 2 questions originales
par fiche, résultats de pratique séparés par enfant, sans crédit de maîtrise.
Tables existantes conservées. Collections externes clairement distinguées des
lecteurs intégrés. Vidéo chargée au clic, arrêt à la navigation et arrière-plan.

Bonds de 2, 5, 10 : plages 0–20 (départ), 0–50, 0–100, représentation de tous
les bonds, écoute d’un nombre via narration existante, séries de 2–3 questions.
Aide ou erreur exclut la réussite sans aide. Aucun changement automatique de
niveau, aucune nouvelle génération audio payante ni configuration fournisseur.

Demande de test de dyslexie réorientée par le parent : il veut une écoute réelle,
pas un formulaire d’observations. Aucun parcours manuel ni test clinique ajouté.
Grok STT documente le français et des repères par mot; aucune validation clinique
chez les enfants ni admissibilité de traitement de leurs voix dans ce compte
confirmée. ZDR, conditions fournisseur et activation restent non vérifiées.
Aucune voix d’enfant transmise, aucun raccordement Grok activé.
Sources examinées : docs.x.ai/developers/model-capabilities/audio/speech-to-text,
docs.x.ai/developers/faq/security, x.ai/legal/terms-of-service-enterprise,
OOAQ troubles-apprentissage, Dyslexia Canada evaluations-psychoeducatives.

Tests Node locaux réussis; navigateur CI étendu aux chansons, bonds, deux profils,
plafond100, aide, erreur, arrêt vidéo et petit écran. Publication à confirmer
sur la PR de cette livraison. Aucun essai physique Safari/iPad annoncé.

# Chanson de la table de 1 — 6 novembre 2026 (UTC)

Base publiée vérifiée : da74ef5354d8eed0282a61d5f3ebf8dd2162c342 (PR86).
Ajout du lecteur officiel « Apprendre la table de 1 », Les Titischools,
vidéo g5EoCRYHgQQ. Identité et intégration confirmées par YouTube oEmbed.
Même parcours : Liana → Maths → Tables en chansons → 1; groupes et exercices
existants conservés. Chargement uniquement au toucher, sans copie audio.
PR86 : 509 tests et vérification navigateur CI réussis, production confirmée.
Validation et publication de cet ajout suivies sur sa PR.

# Tables en chansons — 5 novembre 2026 (America/Toronto)

Base distante et production vérifiées : d0ed43b54a883cf751615268649f1f27eb073220 (PR85).
Maths du profil avancé : nouvelle île, table de 3 par défaut, tables 1–10,
groupes manipulables 0–10 et trois questions par série sans chrono. Une erreur
ou l'affichage des groupes exclut la réussite sans aide. Compteur de missions
local par profil, sans crédit artificiel en lecture ni diagnostic de maîtrise.

Lecteurs officiels YouTube chargés uniquement après clic; aucun audio/paroles
copiés, aucun envoi de voix/photo ni appel OpenAI. Vidéo retirée à la sortie,
au changement de table et en arrière-plan. Lien externe si l'intégration échoue.
La manipulation est indépendante du rythme de la vidéo, pas une synchronisation.
CSP autorise uniquement youtube-nocookie.com pour les cadres; referrer limité à
l'origine pour identifier le lecteur sans nom/profil. Disponibilité et publicité
restent sous contrôle YouTube. Certaines tables n'ont pas encore de chanson.

Tests Node/build locaux réussis; test navigateur ajouté à la CI. Chromium local
ne démarre pas (socket interdit), donc aucune validation iPad physique annoncée.
CI distante, revue et déploiement à confirmer sur la PR de cette livraison.

# Tableau de travail au stylet — 4 novembre 2026 (UTC)

Base distante vérifiée : b9877c498db4a32b10342848433e815f5ba53be1.
Les missions ouvrent maintenant un brouillon à côté de l’énoncé, avec deux
volets défilants; sur petit écran les volets se superposent verticalement.
Crayon sensible à la pression Pointer Events, gomme, annulation et quadrillage.
Le dessin tactile est désactivé par défaut et peut être choisi explicitement.
La lecture plein écran reste un choix manuel, et ne s’ouvre plus automatiquement.

Brouillons locaux isolés par profil et identifiant de carte, conservés après
navigation; aucun envoi réseau, correction automatique ou crédit de réussite.
Un échec de stockage est signalé. Les traits sont bornés et validés au chargement.
L’effacement complet est annulable jusqu’au prochain trait ou démontage.

Tests Node et build local réussis. Prévisualisation locale indisponible : le
serveur du dépôt écoute 5173, alors que la passerelle requiert 4173. Aucun essai
physique Safari/Apple Pencil revendiqué. Publication et revue visuelle distante
à confirmer sur la PR. Configuration voix et données des profils inchangées.

# Validation parent des activités — 4 novembre 2026 (America/Toronto)

Base publiée vérifiée : 1b64fb0e4f7c2dcebcc6cfd5483d84dad9cbd7c6, PR83.
Les deux imports photo retournent désormais un aperçu signé, non sauvegardé et
non synchronisé vers les enfants. La validation parent appelle /api/plans/approve,
vérifie signature, parent, profil, niveau et expiration de 30 minutes avant de
sauvegarder le plan avec la RPC existante. Aucun nouvel appel OpenAI à la validation
ou à sa reprise. Les plans historiques déjà publiés sont conservés.

Le brouillon reste en mémoire de page : navigation, changement de profil et
logout l'annulent. Annulation avant validation : aucune activité de cette photo
publiée. Le lot conserve les pages antérieures déjà approuvées. Le serveur ne
renvoie plus un champ plan à l'import, pour empêcher un ancien client d'installer
le brouillon sans passer par l'approbation. Préférence ajoutée aussi au formulaire
principal Photo → activités. Aucune migration ou nouvelle clé nécessaire.

Tests locaux et build réussis; tests navigateur des deux profils ajoutés :
approbation, double clic, annulation, effacement et échappement HTML. CI distante
et publication à vérifier sur le SHA final. Aucun appel réel d'enfant/OpenAI.
Les conditions d'activation fournisseur/budget restent inchangées. La création
autonome de code via GitHub depuis une demande privée n'est pas installée par ce
parcours : ce sont les activités prises en charge qui seront préparées après
activation, pas des types de jeux arbitraires.

# Agents, Actions et demandes parent — 4 novembre 2026 (America/Toronto)

Base distante vérifiée ef402377d08f86e63e14ffa28c7f465822294d98 (PR82).
Cinq derniers runs évolution consultés : succès. Cela ne prouve pas une analyse
payante : le mode automatique est désactivé dans la dernière configuration connue.

Deux profils GitHub ajoutés : développement et vérification, limités au dépôt
personnel et aux données synthétiques. Aucune session autonome lancée. CI étendue
à toutes les PR, main et merge queue; le résumé horaire distingue désactivation
et traitement. Aucune protection administrative de branche configurée.

Formulaire photo : préférence parent facultative bornée, passée au raccordement
OpenAI existant dans le contexte utilisateur, cache différencié. Aucune clé
copiée; aucun appel fournisseur pendant les tests. Les préférences peuvent
prioriser les notions visibles, pas inventer un jeu logiciel arbitraire.
L'erreur fournisseur ne prétend plus qu'aucun envoi n'a eu lieu après un échec.

Activation réelle encore bloquée : approbation ZDR/éligibilité et configuration
budgétaire non confirmées. Aucune valeur de rétention forcée. Parcours privé de
brouillon/validation et déclenchement d'un agent depuis Parents restent à
implémenter; voir AGENTS-SETUP.md. Publication/CI distante à confirmer sur la PR.

# Lettres vertes et accès scolaires parent — 2 novembre 2026 (America/Toronto)

Base réellement publiée : cc59a0df (PR81), 66/66 alignements acoustiques.
Demande parent confirmée : lettres de la syllabe prononcée vertes, sans rectangle.
Suppression du fond/ombre de la syllabe active et du cadre de secours par mot;
les lettres muettes restent grises. Repères audio inchangés.

Ajout d'une consultation privée dans Parents → Réglages et accès, après session
parent réelle et récente. Endpoint POST même origine, aucun accès par simple cookie
d'appareil familial, Cache-Control no-store. Aucun mot de passe dans le dépôt,
les assets, les URL, localStorage ou sauvegardes. Masquage à la navigation,
déconnexion, arrière-plan et après une minute. Nougat : étapes groupe, utilisateur,
mot de passe puis sélection du cahier. Les valeurs ne sont jamais injectées sur
un site tiers par un lien.

Le nom de variable serveur p1 Nougat existait déjà. Tentative de mise à jour avec
les données confirmées par le parent refusée par l'approbation automatique :
accord explicite de stockage du secret dans Vercel requis. Aucun nouvel écrit
secret accompli; aucun contournement. Contenu de la variable existante non lu ni
confirmé. Identifiants MaZone CEC p2 non retrouvés dans les photos recherchées.
503 tests Node réussis; contrôles navigateur et publication à confirmer.
Tests navigateur ajoutés avec données fictives : session parent obligatoire,
deux profils séparés, mot de passe masqué, aucun stockage local, effacement logout.
Aucune connexion scolaire réelle ni essai iPad physique revendiqué.

# Repères acoustiques des syllabes — 2 novembre 2026 (America/Toronto)

Suivi principal. Base publiée 7a89e8d (PR80) : les 22 lectures manquantes
correspondent à 14 textes uniques (huit récits partagés). 66 enregistrements
candidats au total. Corrige les mentions antérieures de 74 candidats : elles
comptaient deux fois les textes partagés. Les deux profils gardent leurs parcours.

MFA 3.4.3 + modèle french_mfa exécutés localement sur les vrais MP3 publics.
66 fichiers, 338 occurrences de mots découpés en plusieurs unités, aucune unité
non résolue à l'export. Ajout des découpages du vocabulaire des récits, lettres
muettes conservées. Les repères sont des estimations acoustiques de modèle,
pas une division uniforme du temps ni une certification humaine phonétique.
Aucune voix d'enfant ni devoir privé traité; aucun appel OpenAI pour cet alignement.

Assets liés au SHA-256 réel de chaque MP3; vérification des empreintes au build,
des intervalles et des indices côté lecteur. Réutilisation des repères par page,
pause/vitesse calées sur currentTime. Ponctuation pendant les silences réels,
pause finale conservée. Mises à jour DOM seulement au changement de syllabe.
Production utilisera les assets sans retranscription payante des 66 fichiers.

Tests de couverture des deux profils, toutes les pages, chaque unité et de la
correspondance aux vrais MP3 ajoutés. Tests navigateur renforcés avec lecture des
deux enregistrements réels (un par profil), syllabe active, pause/reprise et tailles
d'écran. PR81, code 434cb924 : 500 tests Node réussis, verify/tests GitHub verts,
Chrome confirme les deux profils, syllabe active sur vrai MP3 et pause/reprise.
Preview Vercel READY. Publication finale à vérifier après fusion.
Le test a révélé et corrigé un défaut réel : le suivi attendait une durée MP3
finie. Les repères suivent désormais currentTime même lorsque duration vaut
Infinity pendant le chargement. Le serveur local sert aussi les seuls assets
audio autorisés (manifest, alignment et noms MP3 SHA-256).
Aucun essai iPad physique.
Reproduction et attribution : ops/acoustic/README.md.

# Suivi principal : synchronisation syllabique — 2 novembre 2026 (America/Toronto)

Cette conversation est le suivi principal demandé par le parent. Base publiée
vérifiée : b2bb68a, Vercel READY, 52/52 alignements par mot, aucun échec.
PR75/76 réunies par PR77; PR78 répare le jardin et PR79 remplace « Un bateau ».
La synchronisation syllabique n'est pas encore publiée.

Audit du parcours réel : six petites lectures p1 et seize récits supplémentaires
p1/p2 n'avaient pas de MP3. Ajout des 22 textes intégrés au catalogue existant,
sans changer les empreintes déjà présentes. 74 candidats d'alignement, limite80
inchangée. Test de couverture de toutes les histoires des deux profils.
Alignement acoustique MFA local en préparation avec les MP3 publics, sans voix
ou donnée d'enfant. Modèle français téléchargé; validation phonétique et assets
syllabiques encore à produire. Aucun résultat de test physique iPad revendiqué.

# Dernier modèle audio court — 2 novembre 2026 (America/Toronto)

PR78 publiée (9d59d72), 493 tests réussis. Jardin réparé par quatre extraits :
51/52 alignements prêts. Une réparation bornée de « Un bateau » omet encore
le déterminant. Révision de la consigne de synthèse de cette seule phrase pour
faire entendre ses deux mots. Nouvelle empreinte pour un seul MP3, autres 2087
fichiers inchangés. Alignement du nouvel enregistrement et couverture finale à
vérifier en production. Retrait des rejets devenus hors catalogue.

# Réparation des deux transcriptions — 2 novembre 2026 (America/Toronto)

PR77 fusionnée, SHA 8c0992f. PR75 intégrée et fermée comme fusionnée.
491 tests Node (490 suite + 1 cache), tests navigateur deux profils/trois tailles
et préversion réussis. Diagnostic production : « Un » omis; plusieurs phrases
du jardin omises entre 16 et 29 secondes. Aucun problème HTTP constaté.
Réparation bornée par extraits MP3 de dix secondes, contexte d'une seconde,
positions conservées depuis les vraies trames audio. Une seule réparation par
fichier; cache durable des résultats, aucun nouvel essai sur les builds suivants.
Les passages restent rejetés si la transcription est insuffisante. Les repères
restent par mot, sans prétention syllabique acoustique. Résultat distant à vérifier.

# Réunion des lecteurs PR75/76 — 2 novembre 2026 (America/Toronto)

Base main 59cdd7d (PR76 publiée). Intégration de la vue lecture PR75 f039cc5
avec pages courtes, pause/reprise et réutilisation des extraits PR76. Questions
masquées pendant la lecture, commandes et navigation conservées dans la fenêtre.
Contrat de repères syllabiques revus PR75 conservé; aucune interpolation de mots
présentée comme une syllabe mesurée. Les liaisons restent sur la même ligne.

Deux échecs d'alignement en production (50/52). Le diagnostic initial masquait
la cause et réessayait à chaque build. Conservation des transcriptions rejetées
(des textes intégrés publics uniquement), sans nouvelle facturation au prochain
build; codes d'erreur bornés et compteurs honnêtes. Les mots rejetés ne servent
jamais au lecteur. Cause exacte et résolution distante encore à confirmer.
Aucun enregistrement enfant ni donnée privée impliqué. Tests et publication
à vérifier sur le SHA final; aucun essai iPad physique revendiqué.

# Lecteur tablette et repères audio — 2 novembre 2026 (America/Toronto)

Base distante bf9421044cb4da48dd0372f53701730dbe45eca7.
Commandes Écouter/Pause/Reprendre/Réécouter visibles, pages courtes des histoires
pour les deux niveaux, suppression du plafond défilant du texte sur tablette.
Quatre couleurs stables, cau/che/mar ajouté, lettres muettes conservées grises,
syllabe active verte sans déplacement ni changement de taille. Ponts de liaison
existants conservés; pas de promesse d'alignement phonétique des liaisons.

Le lecteur accepte des repères syllabiques explicites liés au temps média et
actualise l'affichage à chaque frame de lecture. Pause, recherche et vitesse
conservent la position. Les données de production existantes ne fournissent que
des mots : elles encadrent le mot, sans inventer une position syllabique. Sans
repères audio, les couleurs restent fixes. L'objectif de synchronisation exacte
par syllabe reste à terminer par alignement et vérification des enregistrements;
aucune interpolation ne doit être annoncée comme mesure phonétique.

PR76 : premier SHA distant 40e97ee, contrôles tests/verify et préversion READY.
486 tests Node locaux réussis après renforcement des pauses et des extraits audio.
Les petites pages réutilisent les MP3 existants lorsque leurs limites sont
présentes dans les repères par mot; sinon repli système. Aucun nouveau MP3 créé.
Test navigateur ajouté au contrôle CI. Chromium local
indisponible (téléchargement incomplet). Build local réussi. Aucun essai physique
iPad, aucune nouvelle génération payante ni changement de budget/accès. Dernier SHA,
contrôles distants et publication à confirmer. Prochaine action : vérifier la CI,
puis la version réellement publiée; produire les repères syllabiques vérifiés.

# Progression des cartes — 31 octobre 2026 (America/Toronto)

Base bc30916 (cartes PR73 publiées; module public comparé au source).
Première année : départ à 5 minutes, puis 4, 3, 2 et 1 minute. Plages 0–5 puis 0–8 puis 0–12 débloquées
par deux variantes distinctes à au moins 80 % du total, sans pause, au même
palier de temps et dans le même mode (+, −, mélange). Aucun transfert entre profils
ou entre opérations. Anciens résultats sans plage ignorés pour ce déblocage.
Troisième année : plage complète et 60 secondes conservées. Bilan de progrès
sur même tableau/réglage : gain en secondes sur le meilleur temps entièrement
juste, ou bonnes réponses supplémentaires; aucune prime de vitesse aux erreurs. Progression déterministe locale,
aucun appel IA payant. Tests et build locaux réussis. Publication à confirmer.

# Cartes verticales — 31 octobre 2026 (America/Toronto)

Base f822eb7 (PR72 publiée et ressources vérifiées au tour précédent).
Défi vitesse propose des cartes verticales, une à la fois, ou le tableau scolaire.
Additions, soustractions ou mélange; nombres 0–12 en troisième année (sommes
jusqu’à 24) et 0–5 en première (sommes jusqu’à 10). Six variantes par réglage.
Une minute partagée pour la série, saisie puis Valider/Entrée, bouton Passer;
bilan final distinct pour erreurs et cartes non terminées. Zéro accepté.
Les photos servent de référence de disposition; aucun scan ni logo intégré.
Profils, historiques, pause et tableau existant conservés. Aucun appel payant.
Tests locaux/build et publication à confirmer; pas de test sur iPad physique.

# Tableaux minute et lecture — 30 octobre 2026 (America/Toronto)

Base 79b5e548. Six variantes de tableaux additions/soustractions par réglage,
60 secondes pour le tableau complet. 18/21 calculs en troisième année,
6/10 en première année. Saisie numérique, arrêt à échéance, bilan séparant
justes/erreurs/non terminés. Pause explicite ou onglet caché signalée comme aide.
Historique local par profil; seuls les calculs répondus alimentent le suivi existant.
Accès direct Maths → Défi vitesse. Aucune performance importée depuis les photos.
Lecture : couleurs fixes des syllabes connues, terminaisons muettes explicites,
pont vert des liaisons répertoriées, suppression du point mobile. Mots inconnus
conservés entiers; pas de prétention à une annotation phonétique exhaustive.
Aucun appel payant ni modification des accès scolaires. Tests et build locaux réussis. Publication
à confirmer. Aucun essai physique Safari/iPad revendiqué.

# Petites lectures — 30 octobre 2026 (America/Toronto)

Base f5ff43d7. Six histoires originales de 3–4 phrases pour le parcours de
première année, sans réduction automatique en compréhension orale. Aide aux mots
facultative; ouverture de cette aide signalée comme accompagnement. Six nouveaux
assemblages de deux/trois syllabes sont proposés avant les anciens exercices.
Entrée Français : petites lectures au premier plan. Parcours de troisième année,
historiques et paliers conservés; aucune réussite artificielle. Aucun appel payant.
Publication et vérification de production à confirmer.

# Sauvegarde des appareils autorisés — 30 octobre 2026 (America/Toronto)

Base 3696c116. La synchronisation vérifie désormais l’autorisation serveur de
l’appareil pour activer les profils sans choix préalable. Une suspension explicite
par profil reste prioritaire. Les historiques locaux sont envoyés par le parcours
existant, avec identifiants persistants, fusion idempotente et séparation p1/p2.
Le calcul local des paliers reste fondé sur les observations; aucune réussite ni
hausse de niveau n’est inventée. Aucun appel payant ni indicateur de rétention
modifié. Les réglages OpenAI consultés ne confirment pas ZDR. Analyse IA désactivée.
Tests ciblés : appareil autorisé, appareil inconnu, suspension, déconnexion et
absence d’évolution payante. Publication et récupération réelle restent à vérifier.

# Diagnostic des alertes évolution — 29 octobre 2026 (America/Toronto)

Base c9c69ab, run 40983835702 : échec dans run-learning-job, pas dans les tests.
Configuration Vercel personnelle relue : learningEnabled=true,
learningAutoEnabled=false. Le serveur confondait désactivation explicite et
configuration invalide (503). Après vérification OIDC, une désactivation explicite
retourne désormais skipped=learning_disabled, sans accès aux profils/base/fournisseur.
Le runner annonce « aucun traitement effectué ». Configuration manquante ou activée
mais incomplète, refus d'authentification et erreurs HTTP restent des échecs.
Les diagnostics journalisés sont limités à une liste fermée de codes sans secrets.
Les anciens logs ne permettent pas de prouver le code HTTP du run signalé;
aucune activation OpenAI ni traitement de devoir réel n'est revendiqué.
Tests de ces distinctions ajoutés; publication et exécution réelle à vérifier.

# Parcours continus — 28 octobre 2026 (America/Toronto)

Base main vérifiée : 4709d03ab60087afa177c4f06e1df1d1f97ee1a4.
Correction du site scolaire demandée par le parent : nouvelles séries après les
trois défis quotidiens, exclusions persistantes des cartes déjà visitées dans la
journée, reprise d'une série incomplète et séparation des deux profils.
Les séances par matière présentent six cartes puis proposent la suite du lot.
Banques originales : 24 assemblages de mots par niveau, 60 calculs addition/
soustraction débutants, 98 calculs avancés (quatre opérations), huit courts
textes de compréhension par niveau. Les textes sont des exercices originaux,
pas des livres Alloprof téléchargés ni un programme scolaire complet.
Les réponses mobiles passent sur une colonne pour afficher les mots entiers.
Catalogue de narration payante inchangé (2088 textes); nouveaux contenus avec
les enregistrements existants lorsqu'ils correspondent et repli voix système.
Aucun secret, consentement ou plafond modifié; aucun contenu privé exporté.
Tests locaux des banques, de douze séries sans répétition, de reprise et des
profils ajoutés. Parcours Chromium ajouté à la CI (nouvelle série, rechargement,
suite des syllabes et réponses sans coupure à 390 px). Résultat CI et publication
à confirmer sur la PR; aucun essai physique iPhone/iPad revendiqué.
Cette branche ne fusionne pas le jeu archipel dans le site scolaire.

# État courant — 28 octobre 2026 (America/Toronto)

## Activation mobile : validation visible — 28 octobre

Après un signalement iPhone de bouton sans réaction, le formulaire utilise une
validation explicite de longueur et de confirmation. Compteur de caractères,
message annoncé et placé à l'écran après chaque tentative; aucun appel réseau
si les champs sont incomplets. Les contraintes serveur sont conservées.
Le parcours navigateur automatisé vérifie mot de passe court, confirmation vide,
différente puis activation réussie avec API simulée. Aucun mot de passe réel
utilisé; aucun test physique iPhone revendiqué.

## Raccordement des routes parent — 28 octobre

Production cec9408 : POST /api/parent/provision renvoie une 404 Vercel avant
le runtime. Aucun compte Auth ni consommation de jeton constaté après cet essai.
Regroupement des routes API dans une seule fonction et réécriture explicite
Vercel vers le runtime existant. Évite les routes introuvables et la multiplication
des fonctions. Aucun contrôle parent ou fournisseur modifié. La migration
educ_family_devices_parent_activation est appliquée sur la base familiale;
RLS et droits RPC serveur vérifiés.
Invitation privée autorisée par le parent, livraison restant à confirmer.


## Activation parent et tablette familiale — 28 octobre 2026 (America/Toronto)

Branche isolée `feat/parent-tablette`, base distante revérifiée `25b853bb` (PR63).
Page d'activation parent par invitation Supabase à usage unique. Mot de passe
choisi par le parent, aucune auto-confirmation administrative. Provisionnement
fermé par défaut, limité au projet/base familiaux, à un destinataire configuré,
à une heure maximum et à une utilisation atomique. Livraison privée du lien
par le canal de messagerie autorisé, sans secret dans le dépôt ou les journaux.

Autorisation facultative d'appareil pendant 90 jours : cookie HttpOnly/Secure,
seule empreinte stockée, révocation par le parent, accès uniquement aux essais
structurés et aux plans déjà analysés. Les enfants gardent leur accès par prénom.
La session parent d'une heure reste requise pour les documents, le tuteur et les
modifications d'autorisation. Aucun indicateur de confidentialité ou d'IA activé.
Les données locales et le choix de synchronisation de chaque enfant sont conservés.

Validation locale : 463 tests et build réussis; SQL des droits, limites, durée,
révocation et usage unique vérifié sur PostgreSQL embarqué jetable. Le job PR
ajoute les vérifications PostgreSQL 16 et six réclamations concurrentes ainsi
qu'un parcours Chrome. Le lancement Chrome local est bloqué par les sockets du sandbox; le job PR doit
confirmer ce parcours avant fusion. Livraison et vraie confirmation parent restent à vérifier.
Procédure exacte : [PARENT-SETUP.md](PARENT-SETUP.md).

## Mise en production de la PR63 — 28 octobre 2026 (America/Toronto)

La PR63 est fusionnée : `25b853bb3341954a55fbaaadfc98866e127b6e23`.
Déploiement personnel `dpl_BmayEW8cJSJbhV5s92hTY4jXANxx` READY, alias
`educ-ecole.vercel.app` confirmé. Les deux modules publics de mémoire/synchronisation
correspondent exactement au code revu; 454 tests et les workflows de la PR réussis.

Trois migrations appliquées au Supabase familial : `educ_family_voice_budget`,
`educ_private_school_plans`, `educ_private_learning_memory`. Six tables privées,
RLS activée et aucun accès direct anon/authenticated. Le linter émet uniquement
les six avis INFO attendus pour RLS sans politique : accès réservé au serveur.
La base ne contenait aucune table applicative avant ces migrations.

Configuration serveur ajoutée : `learningEnabled:true`, `learningAutoEnabled:false`.
Le build confirme accès modèle OpenAI, Auth Supabase, tables budget/plans et RPC.
Le compte parent recherché est absent; `EDUC_PARENT_ID` n'est pas configuré.
Aucun profil enfant ou résultat fictif n'a été inséré. Les conditions de rétention,
prix et coûts restent non attestées; aucun indicateur privé n'a été forcé.
La sauvegarde nécessite encore un vrai compte parent et les deux profils serveur.
L'analyse des photos, l'adaptation payante et la voix ne sont pas déclarées actives.

Prochaine action : terminer la connexion à la console familiale pour créer le
compte parent par le parcours Auth normal. La connexion sécurisée a abouti à un
CAPTCHA hCaptcha; reprise manuelle demandée, aucun contournement. Puis confirmer
le parent, provisionner les slots scolaires, vérifier les conditions OpenAI et
le budget avant activation et test réel Photo → activités. Aucun mot de passe,
jeton, courriel privé, photo ou donnée scolaire dans ce journal.

## PR préparée : sauvegarde privée et évolution pédagogique

Branche `feat/evolution-apprentissage`, isolée à partir de `f7c63c0`.
La connexion au projet Supabase familial a été constatée dans la conversation
annexe; le diagnostic de connecteur plus bas est historique. Cette PR ne change
ni les paramètres ni le schéma de la production et ne présume pas l'état de la
configuration poursuivie dans la conversation principale.

Ajouts : journal privé idempotent des réponses par enfant, synchronisation
facultative dans Parents → Progrès, adaptation OpenAI bornée aux domaines connus,
contexte de progrès dans le tuteur et accès aux activités des plans sauvegardés.
Le workflow `educ-evolution.yml` vérifie les PR puis, sur main, déclenche les
nouveautés privées par OIDC. Aucun contenu d'enfant ni secret dans GitHub.
Les nouveaux documents déclenchent une révision serveur; les photos s'analysent
déjà automatiquement après sélection dans Photo → activités.

Le plafond partagé de 40 CAD est conservé. Pas de nouvel essai payant automatique
pour une même révision après un résultat ambigu; au plus une tentative par enfant
et par jour. Les réponses restent locales quand la session parent a expiré et
reprennent à la connexion suivante. Il ne s'agit pas d'un agent qui republie seul
du code. Voir [EVOLUTION-SETUP.md](EVOLUTION-SETUP.md) pour activation et limites.

Validation : 454 tests Node et build locaux réussis; contrôles SQL exécutés sur
PostgreSQL embarqué jetable (PGlite). Les contrôles PostgreSQL 16 avec six sessions
concurrentes sont inclus dans le job PR. Un test Chromium réel valide la
reconnexion, la fusion privée, l'isolation des enfants et la mise en page tablette
avec des API locales simulées; il est inclus dans le job PR. Les tests fournisseur sont simulés;
aucune nouvelle photo réelle ni facturation OpenAI utilisée pour cette PR.
La validation du parcours sur iPad physique et l'activation restent à faire.

## Raccordement OpenAI et diagnostic serveur — 27 octobre 2026

Base distante vérifiée : `1f8c0d3816f411c608973473fef72747e835f944` (PR61),
production READY sur le Vercel personnel. Les 2 088 narrations sont disponibles.
L'intégration Supabase de production cible bien le projet familial déjà fourni.
La clé serveur OpenAI et les variables Supabase sont présentes; `EDUC_PARENT_ID`
et `EDUC_VOICE_CONFIG` sont absents. Le connecteur Supabase ne donne accès qu'aux
projets professionnels et refuse le projet familial. Le superviseur cloud actuel
ne propose pas d'opération de provisionnement familial. Aucun service professionnel
n'a été modifié; aucune valeur secrète extraite ou publiée.

`npm run check:connections` utilise les variables serveur existantes pour vérifier
l'accès au modèle OpenAI, Auth, les quatre tables nécessaires et la présence des
deux RPC. Vérification automatique dans le build Vercel personnel, production/main
uniquement. GET/HEAD sans génération, écriture ou photo. Le journal ne contient que
des états fermés; ni compte, clé, cookie, ligne de table, erreur fournisseur brute
ni contenu scolaire. Les builds locaux et previews ne font pas ces appels.
Un modèle accessible ne prouve ni l'extraction, ni la facturation, ni la rétention.
Le contrôle ne déduit jamais le compte parent et ne change aucune condition privée.
Validation locale : 434 tests réussis et build réussi, 328 MP3 Kalulu conservés.
La validation distante de cette nouvelle vérification reste à effectuer après
publication. Le parcours complet Photo → activités n'est pas déclaré opérationnel.



## Codes d’accès visibles — 27 octobre 2026 (America/Toronto)

Base distante vérifiée : `d11093028a7622ee11ba45d4efb76f2f9b1e37f7` (PR60).
Production de cette base confirmée au contrôle précédent, version navigation-simple.
Branche `feat/codes-acces-enfants` : bandeau en haut des mondes et des écrans
avec ressources scolaires, isolé par profil. Codes de groupe/liste et identifiants
copiables; absence indiquée explicitement. Accueil illustré et séances d’exercices
conservés sans ajout de panneau. La liste Voca locale existante est réutilisée.

Réglages parent pour les accès de chaque profil, sauvegarde atomique locale et
conservation de l’ancien accès en cas d’échec. Aucun mot de passe, code réel,
jeton, session ou identifiant privé dans les fichiers publiés. Aucune connexion
automatique Nougat/CEC ni synchronisation entre appareils ajoutée.

Validation locale : 428 tests réussis, dont isolation des profils, reprise des
codes, refus des champs étrangers, échappement et sauvegarde en échec.
Build réussi avec 328 MP3 Kalulu. PR61, préversion du commit `82a396b`
vérifiée dans Chrome : trois formulaires enregistrés avec valeurs fictives,
isolation des profils, affichage, conservation après rechargement et copie/collage
réel. Dernière retouche : noms
des personnages cohérents et références des profils préservées pour les outils
parent montés. CI du SHA final et publication à confirmer. Aucun test iPad physique.
Version préparée : `2026.10.27-codes-acces`.

## Navigation simplifiée — 27 octobre 2026, préversion vérifiée

Base distante vérifiée : `6496b11fad8b3bebe5a5ebbb6e94016877411aac` (PR59).
Branche `feat/navigation-enfants`; accord de réalisation reçu après audit.
La première page illustrée reste conservée. Après le choix de l'enfant :
aventure du jour de trois activités, Français et Maths. Le parcours du jour
reprend localement pour le même profil/date/niveau, et privilégie son plan de
la semaine lorsqu'il existe. Aucun crédit de réussite par simple navigation.
Les activités complémentaires restent accessibles sous leur matière ou dans
le coffre. Alloprof vocabulaire rejoint Français; les liens d'installation
restent dans Parents. Le Pop-it contextuel représente le calcul en cours
uniquement si ses axes ou unités le permettent, sans répondre à la place de
l'enfant. Les essais avec cet outil restent accompagnés.

Parents comporte quatre sections : semaine, documents, progrès, réglages.
Changer de section conserve les formulaires montés et leur sélection de fichiers.
Les enregistrements de progression, photos locales et contrats serveur ne sont
pas migrés. Aucune activation Supabase/IA supplémentaire incluse.

PR60; première préversion du commit `e6b9737` vérifiée dans Chrome :
les deux profils, portes Français/Maths, parcours trois étapes, retour et
rechargement à l'étape 2, Pop-it 3 × 4 avec résultat vert seulement à la fin,
retour au même exercice, bilan deux réussites autonomes et une accompagnée,
et sections Parents avec conservation d'un brouillon. Accueil initial conservé.
Contrôle GitHub `tests` réussi sur ce commit; dernière retouche : aide audio
repliée et sélection quotidienne qui inclut les mots d'école sans imposer une
calibration de six questions ni confondre compréhension orale et lecture.
Validation locale : huit tests supplémentaires couvrent reprise, isolation,
plan courant, mots assignés, suite du chapitre, limites du Pop-it et formulaires.
421 tests locaux réussis; build local réussi avec 328 MP3 Kalulu avant la
dernière retouche de sélection (à revalider par le build Vercel du SHA final).
Publication production et dernier SHA à confirmer avant déclaration en ligne.
Aucun test sur appareil physique Safari/iPad.

## Compatibilité de l'intégration Supabase/Vercel — 26 octobre 2026, soir

Base distante revérifiée : `d67b8d037ee477b7f1485d5a71cba2dbd2679673` (PR58).
Les captures du parent confirment le projet personnel sain et sa connexion au
projet Vercel `educ-ecole` de l'équipe personnelle. Ce constat remplace les anciens
doutes sur l'existence de la base. Les valeurs privées n'ont pas été lues.
Le statut HTTP public vérifié après raccordement donne encore
`authConfigured=false`, `available=false`, `oralCheckReason=setup_required`.
Le connecteur Vercel ChatGPT retourne encore 403 pour cette équipe; cela ne
remet pas en cause l'intégration ni la validité du jeton de supervision existant.

Branche `fix/supabase-integration-env` : le runtime accepte les noms serveur de
l'intégration Vercel, modernes ou anciens. Les variables EDUC explicites gardent
la priorité comme ensemble entier; un ensemble incomplet ne mélange jamais ses
clés avec un autre projet. L'adaptateur HTTP utilise les clés opaques dans apikey,
sans les présenter comme JWT Bearer. Connexion et validation utilisateur passent
par la clé publique; les lectures serveur gardent la clé privée. Les contrôles
d'origine, identité parent, confidentialité et budget restent inchangés.

413 tests locaux réussis, build réussi avec les 328 MP3 Kalulu; appels Supabase
simulés uniquement. Publication et CI à confirmer. Aucune migration distante,
création de compte parent, copie de clé, modification d'environnement ou
synchronisation interappareils effectuée par ce correctif.

L'intégration GitHub montrée séparément pointe sur ce dépôt/main avec working
directory `.`. Le dépôt n'a pas de `supabase/config.toml` ni de
`supabase/migrations`; les SQL préparés restent sous `ops/supabase` sans structure
CLI de déploiement automatique. Ne pas annoncer que cette option applique les
schémas. Prochaine étape : vérifier les variables réellement injectées et le vrai
compte parent Auth, puis appliquer les schémas revus et tester l'authentification.
La synchronisation générale des profils/progrès reste un développement distinct.

## Accès direct Voca — 26 octobre 2026 (Toronto)

Correction du raccourci générique de PR56 : activation privée locale pour p2,
via un fragment strictement validé puis retiré de l’adresse. Le code de liste
reste dans le profil sur l’appareil, jamais dans le dépôt ou les fichiers publiés.
Le bouton ouvre le parcours invité Alloprof avec la liste déjà sélectionnée;
aucune saisie de code ni connexion exigée. Alloprof conserve son bouton Commencer.
Pas de transfert d’identifiants Nougat/CEC, ni de synchronisation interappareils.
Échec de sauvegarde : ancien profil et ancienne configuration préservés.

Base distante 9f59c1113e1ad948801ed1bbc76d11609c94c471 (PR57). Son déploiement
et le retrait des photos des deux espaces enfants ont été vérifiés en production.
Chrome a ouvert la vraie liste autorisée de 24 mots directement depuis le parcours
invité Alloprof; aucun mot de passe, réponse d’enfant ou résultat envoyé.
406 tests locaux et build réussis. Version préparée 2026.10.26-voca-acces-direct;
publication et vérification du bouton personnalisé à confirmer après déploiement.
Le suivi hebdomadaire sauvegarde les listes privées, mais ne pousse pas encore
leurs mots ou un éventuel nouveau code dans les appareils.

## Photos réservées aux parents — 26 octobre 2026 (Toronto)

Suite à la correction demandée par le parent, retrait des accès « Mes photos de
devoirs » dans les deux voyages et les deux ateliers. Route enfant photo retirée;
import, compression, galerie, archives et photos déjà enregistrées conservés
intégralement dans Parents. Version `2026.10.26-photos-cote-parent`.
Base `09ffd0f859e0b274291f9e9608b7e99a63575131`, fusion PR56 (liens Voca).
402 tests locaux et build réussis. Aucun changement de stockage ou des données.
La vérification visuelle de production suivra la publication de ce correctif.

## Vocabulaire Alloprof pour le profil de 3e année — 26 octobre 2026 (Toronto)

Base distante `edd541f0ae84878b330d8fc5a05b1911085f54b1`, fusion PR52.
La production de cette base a été vérifiée avec la version
`2026.10.26-voyage-photos-auto` et le déploiement Vercel
`7CUL2QD2ABSw2175SShs6xvGvdDZ` réussi. Cela livre le voyage, les Pop-it et le
parcours photo; l’analyse OpenAI réelle reste non activée, comme détaillé plus bas.

Branche `feat/liana-vocabulaire-alloprof`, version
`2026.10.26-vocabulaire-liana` : carte « Mes mots · Alloprof » dans le voyage,
l’atelier et les défis de p2. Lien direct officiel Voca et lien App Store;
consignes repliées pour Commencer → Continuer sans se connecter → code de liste,
ou listes Primaire 3. Aucun changement du profil p1, des portraits ou de l’accueil.
Aucun code de liste, mot scolaire ou identifiant privé embarqué dans le dépôt.
Aucun point attribué ni résultat importé pour une ouverture de lien.

Preuves : navigation Chrome réelle le 26 octobre sur Alloprof, parcours invité
et ouverture de l’exercice vérifiés sans envoyer de réponse. Lien direct
statique affichant Commencer confirmé. 401 tests locaux réussis, build réussi
avec les 328 MP3 Kalulu. Aucun test matériel Safari/iPhone; publication et
rendu de cette nouvelle carte encore à vérifier à ce stade.

## Photos de devoirs — vérification du 26 octobre 2026

Base distante vérifiée : `644776d00e049ae20bcd68ed8f7cc90de2b9c1db`,
fusion PR53 (head corrigé `d73783f4d34ebd519c3343afe5e61062f142853b`, CI et
préversion réussies). Les modèles français sont fusionnés, mais le statut audio
public reste partiel : 1 125 / 1 580, `audio_request_timeout`. Ne pas annoncer
une génération complète ni une validation humaine de la prononciation.

Branche `feat/parent-photo-import` : photos JPEG/PNG/WebP directement dans
l’espace parent, appareil photo proposé sur mobile; jusqu’à huit images par lot.
Chaque image exige profil, semaine, matière et jeu compatible. Consultation
dans le monde de chaque enfant et lancement du jeu existant à son niveau.
Le ZIP Alloprof demeure disponible dans une option repliée distincte.

Conversion locale en JPEG sur fond blanc, maximum 2 000 pixels de côté,
qualité initiale 0,82, réduction bornée si nécessaire. Cible 900 Ko, plafond
1,2 Mo; refus avec demande de recadrage plutôt qu’une réduction illimitée.
Une seule copie JPEG est enregistrée, sans original ni métadonnées EXIF;
taille, dimensions et économie réelle sont affichées. Base IndexedDB séparée
`atelier-school-photos-v1`, transaction atomique pour le lot, lectures par profil,
archivage et restauration. Aucun changement des résultats, profils ou PDF.
Ce stockage reste local à l’appareil : ni synchronisation privée ni envoi
OpenAI dans ce formulaire. L’analyse du plan existante dépend toujours du
service privé non activé; l’association à un jeu n’extrait pas les mots du cahier.

Preuves locales : 347 tests réussis, build réussi avec 328 MP3 Kalulu.
Chrome : deux illustrations publiques importées via le sélecteur natif,
JPEG de 174 et 10 Ko, économies de 89 et 86 %; aperçu affiché, rechargement,
associations et tailles conservés, parcours enfant vers Nombres 0–99,
absence des photos p1 dans p2, archivage et restauration vérifiés.
Aucune photo privée transmise, aucun appareil iPad/iPhone physique testé,
aucune garantie de lisibilité de toutes les photos après compression.
Livré par PR54, head `fb9a6783a4b67270d6911522df731caecf6c5b61`, fusion
`a36e992e7cd3253ec83568b2c4674e77b1a642e9`. CI 40365318459 réussie,
préversion Vercel DCibTaS5depNhtAKTUCL9Ccc1eKu réussie et production
7UcPyxSKWzL3WXVtQeit8KBTin96 réussie. Version publique
`2026.10.26-photos-devoirs` : index et trois modules photo comparés octet par
octet au code testé. Chrome public confirme le formulaire galerie/appareil
photo, le stockage local annoncé et le ZIP replié; aucune photo de test ajoutée
en production. Capture de preuve locale conservée hors dépôt.

La reprise audio de cette publication atteint 1 578 / 1 580,
`audio_request_timeout` : deux narrations restent à générer. Pas de génération
parallèle déclenchée. Prochaine action : contrôler les deux manquantes après
la prochaine compilation, puis écouter les modèles en famille. Pour les photos,
vérifier la lisibilité des premières vraies feuilles et tester le sélecteur sur
un iPad/iPhone réel; la synchronisation privée reste une étape distincte.

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

## Pop-it cohérent par opération — 26 octobre 2026
PR52 base e7c6338. Suppression du comptage 1–144 utilisé comme aide +/−.
Liana : +/− sur 12 unités, quantité de départ déjà enfoncée; ajout aux seules
bulles libres, retrait aux seules unités de départ. × : table complète 12×12
avec produits, axes guidés et équation de la case sélectionnée. ÷ : même table,
colonne du diviseur active; la ligne du total donne le quotient, jamais le nombre
de cases pressées. Réinitialisation restaure le départ; aide facultative conservée.
Mely : départ pré-enfoncé, ajout/retrait cohérents, opérations +/− seulement.
Tests couvrent les manipulations sur chaque exercice et les tables jusqu’à 12,
conservation des profils/aides. Suite et build locaux réussis; contrôle préversion
à suivre. Aucune fusion main ni modification des données familiales.

## Pop-it complet manipulable — 26 octobre 2026 (Toronto)
PR52 base d8bee52. Correction demandée : tableau 12×12 dans les quatre modes
pour Liana, 144 bulles réversibles sans cases bloquées. +/− : une unité par
bulle, chiffres de position 1–144; lignes/colonnes enfoncent ou relèvent 12 unités.
×/÷ : produits de la table réelle, choix libre des axes et repérage du croisement;
la case touchée explique produit ou quotient. Plusieurs bulles restent pressées.
La réponse reste saisie par l’enfant et validée séparément. Aide facultative,
draft, profils, historique et parcours débutant préservés. Tests et build locaux
réussis. Préversion à vérifier; aucune fusion main ni validation iPad physique.
Relief demandé ensuite : silicone bombé/concave CSS persistant selon aria-pressed,
ombrage intérieur, déplacement court au toucher, retour au second clic. Aucun
plugiciel, dépendance payante ou vidéo requis; reduced-motion supprime la transition.

## Tables Pop-it + et × pour les deux profils — 26 octobre 2026 (Toronto)
PR52, base b3220ac. Même moteur de tableau complet 12×12 pour tous les accès
Pop-it des deux profils. Addition : vraies sommes ligne + colonne (2–24);
multiplication : produits (1–144). Tous les chiffres restent visibles. Choix
des axes, chemin de bulles réversibles jusqu’au croisement; vert uniquement
lorsque le bon chemin est entièrement pressé, retiré si une bulle est relevée.
Opérandes inversés acceptés. Mély : petits calculs et découverte × (facteurs
1–3, produits au plus 9), aide ouverte; Liana : aide facultative et tables
avancées conservées. Réponse saisie séparément, succès accompagné enregistré
sans crédit automatique par manipulation. Accueil, voix et données préservés.
Tests du chemin incomplet/complet/relevé, axes erronés, deux profils et sommes
réelles réussis; build local réussi. Contrôle de préversion à suivre. Main non fusionné.
Préversion b6022ef : Vercel success. Chrome distant : p2 multiplication 6×4,
8/9 bulles sans vert puis 9/9 avec 24 vert; relever une bulle retire le vert.
Addition 7+5=12 confirmée. Profil p1 : tableau ouvert, 2+1=3 puis 2×1=2
confirmés par pression des chemins. Capture du tableau vert conservée.
387 tests et build réussis. Aucun test Safari/iPad physique; production inchangée.

## Photos → activités automatiques — 26 octobre 2026 (Toronto)
PR52 réconciliée avec main 9301bf0 / photos publiées PR54. Dossier photo optimisé
préservé, accès depuis le voyage. Nouveau parcours parent explicite « Ajouter
les photos et préparer les jeux » : sélection vaut demande d’envoi des seules
photos sélectionnées à OpenAI; compression et stockage local, précontrôle du
service authentifié, analyse séquentielle sans retry, installation des notions
validées pour le profil. Ajout des tâches à la même semaine, dédoublonnage,
refus au-delà de 12 sans écrasement. Navigation/profil annule le traitement.
Notions illisibles/hors banque signalées, aucune réussite créditée par import.
Ancien import manuel et archives locales conservés, aucune migration destructive.
Tests de pipeline simulés (pas preuve OpenAI réel) : sauvegarde avant envoi,
refus sans config, cumul de pages, erreur partielle sans retry, annulation et
isolation de profils. Aucune photo privée envoyée pendant le développement.
Blocage réel vérifié : /api/voice/status production authConfigured=false;
Vercel personnel retourne 403; Supabase connecté ne liste que luxura-inventory
et kenbot-prod, aucun projet scolaire. Aucun contournement ni réemploi de base
professionnelle. Activation OpenAI réelle NON LIVRÉE, conditions privées de
VOICE-SETUP toujours requises. L’autorisation parent ne remplace pas la config.

Contrôle de préversion du 26 octobre : 399 tests locaux et build réussis;
CI 40371014600 et préversion ed33bbb réussies. JPEG synthétique 800×1000
importé par le véritable sélecteur Chrome : compression, sauvegarde locale
11 Ko (38 %), arrêt explicite au service privé non activé. Rechargement :
association p1/semaine conservée. Le décodage bitmap et un repli d’aperçu
local corrigent les images object-URL qui ne se chargeaient pas dans ce
navigateur. Aperçu sauvegardé confirmé à 800×1000 sur préversion 075341e.
Le même décodeur sert à préparer l’image pour l’analyse. Galerie actualisée
après sauvegarde automatique. Aucune photo d’enfant transmise, aucun appel
OpenAI réel validé. PR52 prête à examiner; production non modifiée à ce stade.


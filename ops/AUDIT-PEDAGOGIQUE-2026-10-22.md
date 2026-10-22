# Audit pédagogique et interaction orale — 22 octobre 2026

## Objet et portée

Revue du fonctionnement de l’atelier familial, des parcours différenciés p1/p2, de la progression locale, des raccourcis vers les 78 PDF Alloprof et du nouvel exercice oral. Base publiée : `73bb5bb34d2e1e955000a8c87653aa06cd0bb4e1` (PR26). Version préparée : `2026.10.22-retour-vocal`.

Cette revue du contenu et du logiciel s’appuie sur des références québécoises. Elle ne constitue pas une évaluation individuelle, un diagnostic, une certification de l’application ou une validation par un orthopédagogue. Aucun résultat d’enfant, bilan scolaire privé ou enregistrement réel n’a été utilisé pour établir un niveau. L’année scolaire paramétrée est un contexte de départ; le parent choisit le point de départ des fiches et ajuste avec l’école.

## Constats corrigés

| Constat vérifié dans le code précédent | Changement et conséquence | Preuve pertinente |
|---|---|---|
| Quatre réponses correctes sur une carte le même jour pouvaient produire un palier 3 et une révision à J+14. | Une carte apporte au plus une observation par jour. Les paliers et révisions exigent des journées distinctes. | Tests moteur : répétition immédiate, plusieurs jours, maintien des révisions dues. |
| Une aide ou une erreur suivie d’une réussite était remplacée par le dernier clic correct dans le rapport. | La journée conserve le caractère accompagné. Chaque essai brut reste dans l’historique; le résultat effectif est aussi celui crédité par la mission. | Tests `dailyEvidence`, rapport, réponse et reprise. |
| Le tri par niveau/identifiant sautait l’ordre écrit des premières activités. | L’ordre pédagogique `order` détermine les nouveautés; les révisions dues restent prioritaires. | Tests des prochaines fondations `first-blend-li` et `first-sound-i`. |
| Les anciens sujets `sons`, `syllabes`, etc. pouvaient disparaître des observations de lecture. | Lecture interprétée comme Français, sans modifier l’historique ni incorporer Maths au niveau de lecture. | Tests compatibilité et isolation des matières. |
| La lecture automatique de la carte avancée donnait un modèle avant une réponse qualifiée d’autonome. | Introduction par consigne; modèle accessible explicitement. Modèle de mot, aide, reprise et pratique orale sont signalés comme accompagnement. | Vérification navigateur du résultat `help` après pratique orale. |
| Huit consignes d’assemblage et sept introductions de sons contenaient déjà la réponse attendue. | Introduction neutre des assemblages; mot modèle distinct pour les sons. Les modèles de lecture demandés et les explications restent disponibles. | Tests des huit assemblages et des quatorze cartes de sons : aucune bonne réponse divulguée dans l’introduction contrôlée. |
| Le panneau oral affichait le mot entier avant un choix d’assemblage. | Panneau replié au départ, après les choix. Son ouverture est signalée comme aide; le mot devient disponible pour pratiquer ensemble. | Vérification navigateur du panneau initialement fermé. |
| Le raccourci de la fiche sur les centaines ouvrait 1 000. | Étape centaines : 462. Étape milliers avec zéro : 1 204. Pas de raccourci vers le studio des nombres pour une étape de suites. | Test d’interface des trois étapes; vérification navigateur de 462, 1 204 et de la colonne 0. |
| Des pistes pouvaient continuer pendant la fermeture du panneau oral ou une confirmation parentale de ligne. | Arrêt explicite de la capture et de la requête; une réponse tardive ne s’applique pas à une nouvelle cible. | Tests client et navigateur avec microphone synthétique. |

## Progression : règles de l’atelier

Ces seuils sont des réglages explicites du logiciel, pas des normes ministérielles ou cliniques. Ils limitent les promotions fondées sur des répétitions immédiates; ils ne prouvent pas la généralisation des apprentissages.

- Observation : une carte, un domaine et une journée. Une aide ou erreur avant une réussite le même jour conserve un résultat accompagné.
- Palier 2 : au moins deux jours et au moins 75 % de réussites sans aide signalée dans les quatre dernières observations au maximum. Une seule carte peut suffire sur plusieurs jours, certaines petites banques avancées étant limitées.
- Palier 3 : quatre réussites sans aide signalée, sur au moins trois jours et deux cartes.
- Révision : 1, 3, 7 puis 14 jours après des journées réussies distinctes. Une reprise accompagnée reste à revoir.
- Rapport : « sans aide signalée », « accompagnée ou reprise » et « à revoir ». L’absence de signalement ne démontre pas l’absence d’aide externe.
- Anciennes données : seuls `streak`, `result` et `due` sont recalculés depuis l’historique exploitable. Historique, essais, fiches, noms, autre profil et champs supplémentaires restent conservés. Les entrées malformées sont ignorées pour le calcul, sans réinitialiser la famille.

L’application ne vérifie pas si un adulte donne une aide hors de l’écran. Le parent reste responsable de noter ce soutien. Les activités et profils demeurent locaux au navigateur; cette mise à jour n’ajoute pas de synchronisation entre appareils.

## Adaptation par profil et usage des fiches

| Profil | Départ conservé | Travail proposé | Décision de progression |
|---|---|---|---|
| p1, 1re année | Fondations, sons, assemblage puis premiers mots; nombres 0–99. | Courtes étapes des parcours, objets à dénombrer, groupes de dix, reformulation d’un mot. | Résultats observés; le parent peut reprendre les préalables et choisir une étape de départ. |
| p2, 3e année | Lecture, compréhension, vocabulaire, valeur de position; nombres 0–1 999. | Centaines avant milliers, zéro de position, comparaison et justification, mot employé dans une phrase. | Révisions et observations sur plusieurs jours, avec distinction de l’aide. |
| Famille | Huit ressources communes, consignes adaptées au profil. | Petite activité partagée, sans imposer le même exercice ni le même niveau. | Confirmation propre à chaque profil. |

Les 78 PDF, 426 pages, six parcours et 49 étapes de la livraison précédente sont conservés. Il ne s’agit pas de 426 pages converties en exercices interactifs : l’app guide vers les pages utiles, sépare les corrigés et laisse les originaux chez Alloprof ou dans l’import privé local. Ouvrir une fiche ou un atelier ne valide aucune étape. Le parent choisit « à reprendre », « avec de l’aide » ou « prêt pour la suite ».

## Aides de compréhension ajoutées

`learning-coach.js` propose des questions originales et facultatives. Le tableau numérique s’adapte à la grandeur du nombre : dizaines/unités, puis centaines, puis milliers. Les positions à zéro restent visibles. Les manipulations passent des objets aux groupes, puis aux représentations; la décomposition et une comparaison accompagnent la lecture du nombre. Ces propositions ne sont pas notées automatiquement.

Pour les mots, l’adulte peut demander une explication, un geste ou une phrase, puis proposer un nouvel exemple ou une reprise un autre jour. Le panneau parent recommande un objectif court, un modèle si nécessaire, un essai ensemble puis un essai indépendant, et un arrêt en cas de fatigue. Ces questions complètent l’écoute et la répétition; elles ne couvrent pas le programme annuel.

## Retour oral : sens exact du résultat

L’exercice couvre les nombres de la plage du profil et dix mots intégrés explicitement autorisés. Il ne couvre ni les phonèmes isolés, ni les syllabes seules, ni tous les textes et PDF, ni les mots privés importés. Le modèle sonore et le studio de réécoute local restent disponibles indépendamment.

La réponse vocale est transcrite sans envoyer la réponse attendue au fournisseur. Le serveur compare ensuite des formes entières : chiffres ou formes françaises des nombres, mots autorisés. Les variantes écrites de `cent(s)` et `vingt(s)` ne servent qu’à reconnaître un nombre oral, jamais à corriger une dictée. Une transcription inconnue, une langue ambiguë ou une absence de signal exploitable donne un résultat incertain.

| Retour | Interprétation autorisée | Ce qu’il ne démontre pas |
|---|---|---|
| « Bravo! J’ai reconnu ta réponse. » | La transcription acceptée correspond à la cible. | Prononciation parfaite, lecture autonome, compréhension, identité de la locutrice. |
| « Écoutons le modèle, puis essaie encore. On prend notre temps. » | Une autre réponse entière connue a été reconnue. | Diagnostic de difficulté ou faute articulatoire. |
| « Je n’ai pas bien entendu. Tu peux réessayer avec l’adulte. » | Le système ne peut pas conclure de façon suffisamment déterministe. | Échec de l’enfant. |

Aucun résultat oral n’appelle `answer`, ne valide un PDF ou une ligne et ne monte le palier. Pas de pourcentage de prononciation, détection d’accent, estimation d’âge ou évaluation émotionnelle. Une reconnaissance vocale peut mal interpréter une voix d’enfant; la revue n’a mesuré ni le taux d’erreur réel ni une supériorité d’OpenAI sur xAI pour le français québécois enfantin.

## Activation et vérification réelle

OpenAI `gpt-transcribe` est retenu pour cette première intégration, qui réutilise le contrôle parent, la réserve budgétaire et le périmètre serveur déjà présents. La présence de code n’active pas le service. Voir [VOICE-SETUP](../VOICE-SETUP.md) pour l’authentification, les limites et les conditions effectives de traitement des données de mineurs.

Le connecteur Vercel personnel retourne 403; le Supabase personnel et l’approbation Zero Data Retention du projet OpenAI ne sont pas vérifiés. Aucun drapeau de consentement ou de rétention n’a été inventé. Aucun audio d’enfant n’a été envoyé. Les contrôles de bout en bout utilisent un microphone synthétique et des réponses fournisseur simulées, et sont présentés comme tels. Les fichiers de narration publique sont des textes pédagogiques intégrés.

Le déploiement de l’interface suit l’intégration Git du dépôt personnel. Les preuves du SHA réellement publié, du manifeste audio et du statut oral doivent être inscrites dans la PR de livraison; elles ne doivent pas être déduites des tests locaux. Safari/iPad physique, écoute humaine exhaustive et usage accompagné par la famille restent non vérifiés.

## Références primaires consultées le 22 octobre 2026

- [MEQ — Français au primaire](https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/programme-formation-ecole-quebecoise/primaire/francais-langue-enseignement). Le programme actualisé est offert à titre informatif en 2026–2027; son application obligatoire est annoncée pour 2027–2028. Ne pas le présenter comme déjà obligatoire cette année.
- [MEQ — Progression des apprentissages en français](https://cdn-contenu.quebec.ca/cdn-contenu/education/pfeq/primaire/progressions-apprentissages/PFEQ-progression-apprentissages-francais-langue-enseignement-primaire.pdf), notamment pages 10 et 71–74 : sens des mots, identification, compréhension et stratégies de lecture.
- [MEQ — Progression des apprentissages en mathématique](https://cdn-contenu.quebec.ca/cdn-contenu/education/pfeq/primaire/progressions-apprentissages/PFEQ-progression-apprentissages-mathematique-primaire.pdf), pages 5–6 : sens du nombre, représentations, regroupements et valeur de position.
- [L’ADOQ — Le rôle de l’orthopédagogue](https://www.ladoq.ca/fr/orthopedagogue) et [référentiel des compétences](https://cdn.ca.yapla.com/company/CPYptsjQ7USWTEKzc86lCbx4g/asset/files/ladoq_referentiel-des-competences-orthopedagogues_v2_web_low.pdf), domaines d’évaluation et d’intervention. Ces références décrivent une pratique professionnelle; elles ne certifient pas ce logiciel.
- [CSSDM — Outils de lecture](https://communauteweb.cssdm.gouv.qc.ca/abc/2-3-1-outils/) : choix des stratégies selon les besoins et enseignement explicite avant l’activité d’interaction.
- [OpenAI — Transcription](https://developers.openai.com/api/docs/guides/speech-to-text), [usage avec des mineurs](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance), [contrôles de données](https://developers.openai.com/api/docs/guides/your-data).

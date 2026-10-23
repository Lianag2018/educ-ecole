# Architecture pédagogique et ludique — 23 octobre 2026

## Principes
Une seule application, un moteur de défis, deux profils isolés : Mely-Ann (1re année, p1) et Liana (3e année, p2). Les univers sont des portes d'entrée, pas des bases parallèles. Chaque défi : écouter ou observer → agir → répondre → expliquer → revoir plus tard. Une étoile mesure la participation, jamais une compétence diagnostiquée.

## Carte de placement
| Domaine | 1re année | 3e année | Sources | Défi |
|---|---|---|---|---|
| Sons et syllabes | Jardin des sons, syllabes magiques | Mots explorateurs, syllabes longues | first-reading.js, sound-garden.js, kalulu-bank.js, syllable-audio.js | Écouter, assembler, choisir |
| Lecture | Petites histoires, premiers mots | Récits, liaisons, intonation, compréhension | content.js, learning.js, guided-reading.js | Chercher les indices et expliquer |
| Nombres | 0–99, dizaines, objets | 0–1 999, milliers et centaines | numbers.js, learning-coach.js, garden.js | Composer, comparer, vérifier |
| Calcul | Addition/soustraction concrète | Tables 1–6, résolution | mely-grade1.js, learning.js, speed-math.js | Essai court, indice facultatif |
| Univers social | École, maison, quartier | Carte, boussole, temps, peuples autochtones | learning.js, squishy.js | Observer, comparer, justifier |
| Documents | 28 PDF Alloprof et repères Nougat | 42 PDF Alloprof, devoirs | family-library*.js, school-plan.js | Une page et une consigne à la fois |
| Récompenses | Encouragements, étoiles | Squishy et missions | worlds.js, progress.js, squishy.js | Effort sans fausse maîtrise |

## Responsabilités
- Contenus et objectifs : modules de domaine, jamais codés en dur dans le moteur de navigation.
- Navigation et interface : app.js et worlds.js; étapes de jeu transversales dans challenge-guide.js.
- Progrès et reprises : engine.js, progress.js, historique conservé séparément par profil; révisions espacées.
- Audio : narratrice et MP3 complets en priorité; phonèmes et syllabes seulement quand un enregistrement réel est connu. Ne jamais lire le signe +.
- Micro : autorisation parentale et confidentialité; reconnaissance automatique non assimilée à un diagnostic.
- Ressources scolaires : références et exercices originaux; aucun mot de passe ni reproduction intégrale de manuel protégé.

## Résultats de l'audit
- Confirmé dans le code : deux niveaux, activités distinctes, moteur de révision, audio avec arrêt, défis et encouragements.
- Amélioration de cette livraison : consignes de défi en trois gestes pour les deux profils, portes d'entrée décrites par une action, progression visuelle qui reflète la réponse et suppression du passage automatique après 800 ms. L'enfant choisit Continuer.
- À vérifier physiquement : audio sur iPad, ergonomie tactile, réseau instable, son Kalulu français de France vs narratrice québécoise.
- Non confirmé : reconnaissance OpenAI réelle avec enfant, synchronisation Supabase personnelle, validation par une orthopédagogue.

## Règles avant toute extension
Tout nouveau contenu doit définir niveau, domaine, objectif, type de défi, source/licence, modèle audio disponible, règle d'observation et emplacement. Les tests doivent vérifier les deux profils et l'arrêt de lecture. Un seul chantier/PR et aucune relance automatique en boucle. Pas de migration des données pour un changement cosmétique.

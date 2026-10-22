// Parcours familiaux construits à partir des 42 PDF du profil avancé.
// Les pages sont les positions physiques dans le PDF, à partir de 1.
// Le parent décide quand une étape est prête; aucune maîtrise n’est déduite d’une ouverture.
export const P2_PATHS = [
  {
    "id": "reading",
    "title": "Lire et comprendre",
    "icon": "📖",
    "description": "Un court passage, une stratégie et une explication avec un parent.",
    "steps": [
      {
        "id": "p2-reading-prepare",
        "title": "Avant de lire",
        "goal": "Prévoir le sujet avec le titre et une image.",
        "instruction": "Observe le titre et une image du texte sur les forêts. Dis ce que tu connais déjà et pose une question. Lis ensuite le premier paragraphe avec un parent pour vérifier ton idée.",
        "readyWhen": "L’enfant montre un indice qui l’a aidée et dit une chose qu’elle a apprise. Le parent choisit si elle est prête à poursuivre.",
        "documents": [
          {
            "id": "p2-781c04d44080",
            "pages": [
              4
            ],
            "role": "activity",
            "note": "Un seul paragraphe suffit pour cette séance."
          },
          {
            "id": "p2-781c04d44080",
            "pages": [
              1,
              2,
              3
            ],
            "role": "parent",
            "note": "Modéliser le survol à voix haute, sans demander de lire tout le document."
          },
          {
            "id": "p2-00b37dd086d9",
            "pages": [
              1,
              2,
              3,
              4
            ],
            "role": "parent",
            "note": "Aide pour relier une connaissance à une question; la lecture peut modifier une première idée."
          }
        ],
        "practice": "reading"
      },
      {
        "id": "p2-reading-structure",
        "title": "Se repérer dans le texte",
        "goal": "Reconnaître un texte qui informe et trouver une section utile.",
        "instruction": "Regarde les titres du texte. Raconte-t-il une histoire ou donne-t-il des informations? Choisis une forêt, puis montre où chercher une information à son sujet.",
        "readyWhen": "L’enfant explique son choix avec un titre, une image ou une phrase, puis retrouve la section utile.",
        "documents": [
          {
            "id": "p2-844870b99b37",
            "pages": [
              5
            ],
            "role": "activity",
            "note": "Commencer par la distinction histoire/information."
          },
          {
            "id": "p2-844870b99b37",
            "pages": [
              1,
              2,
              3,
              4
            ],
            "role": "parent",
            "note": "Comparaisons et relations de cause sont des prolongements; ne pas tout présenter à la fois."
          },
          {
            "id": "p2-b76dac7ed7bb",
            "pages": [
              1,
              2,
              3,
              4
            ],
            "role": "parent",
            "note": "Les indices graphiques orientent la recherche; confirmer ensuite avec les mots du texte."
          }
        ],
        "practice": "reading"
      },
      {
        "id": "p2-reading-verify-words",
        "title": "Lire et vérifier un mot",
        "goal": "Utiliser les lettres et la phrase pour lire un mot difficile.",
        "instruction": "Lis une phrase avec un parent. Choisis un mot à revoir, repère une partie que tu connais et lis toutes ses lettres. Relis la phrase pour vérifier le sens. Si tu bloques, montre exactement où.",
        "readyWhen": "L’enfant relit le mot écrit et peut expliquer ce qui l’a aidée, ou demander une aide précise.",
        "documents": [
          {
            "id": "p2-3c5ccb5b8d1d",
            "pages": [
              5
            ],
            "role": "activity",
            "note": "Choisir une seule phrase et un mot accessible."
          },
          {
            "id": "p2-4a092884e397",
            "pages": [
              2
            ],
            "role": "material",
            "note": "Facultatif: le parent peut écrire la difficulté exprimée."
          },
          {
            "id": "p2-3c5ccb5b8d1d",
            "pages": [
              1,
              2,
              3,
              4
            ],
            "role": "parent",
            "note": "Observer la base et la terminaison du mot, sans le deviner d’après sa silhouette."
          },
          {
            "id": "p2-6fd12851c9e4",
            "pages": [
              1,
              2,
              3
            ],
            "role": "parent",
            "note": "Utiliser le sens de la phrase pour vérifier la lecture."
          },
          {
            "id": "p2-757c8f534cd2",
            "pages": [
              1,
              2,
              3
            ],
            "role": "parent",
            "note": "Une hypothèse de contexte doit être contrôlée avec les lettres du mot."
          }
        ],
        "practice": "reading"
      },
      {
        "id": "p2-reading-vocabulary",
        "title": "Comprendre et réutiliser un mot",
        "goal": "Expliquer deux mots puis les employer dans une phrase.",
        "instruction": "Choisis deux mots du passage avec un parent. Cherche une partie connue, explique leur sens et invente une phrase. Tu peux les inscrire sur la carte de vocabulaire.",
        "readyWhen": "L’enfant explique le sens des deux mots dans le passage et réutilise au moins l’un d’eux avec l’aide nécessaire.",
        "documents": [
          {
            "id": "p2-273c7338fdce",
            "pages": [
              5
            ],
            "role": "activity",
            "note": "Choisir deux mots dans un court passage, pas toute la page."
          },
          {
            "id": "p2-11d399f4a4c5",
            "pages": [
              4
            ],
            "role": "material",
            "note": "Utiliser la carte à personnaliser; laisser les contraintes avancées de côté."
          },
          {
            "id": "p2-273c7338fdce",
            "pages": [
              1,
              2,
              3,
              4
            ],
            "role": "parent",
            "note": "Modèles de familles de mots; vérifier l’hypothèse de sens ensemble."
          },
          {
            "id": "p2-11d399f4a4c5",
            "pages": [
              1,
              2
            ],
            "role": "parent",
            "note": "La roue est une variante facultative pour une autre séance."
          },
          {
            "id": "p2-76d6e509a7e3",
            "pages": [
              1,
              2
            ],
            "role": "parent",
            "note": "Codes Magimot facultatifs pour choisir une liste de la classe. Le PDF ne contient pas les mots eux-mêmes."
          }
        ],
        "practice": "vocabulary"
      },
      {
        "id": "p2-reading-punctuation",
        "title": "Faire entendre la ponctuation",
        "goal": "Lire deux phrases en respectant leur ponctuation.",
        "instruction": "Dans « Une excursion inoubliable », trouve un point et un point d’interrogation. Écoute le parent lire deux phrases, puis relis-les à ton tour en faisant les pauses.",
        "readyWhen": "Le parent entend une pause en fin de phrase et une différence entre une affirmation et une question.",
        "documents": [
          {
            "id": "p2-660f41910651",
            "pages": [
              7
            ],
            "role": "activity",
            "note": "Deux phrases suffisent; la lecture complète peut attendre."
          },
          {
            "id": "p2-660f41910651",
            "pages": [
              1,
              2,
              3,
              4
            ],
            "role": "parent",
            "note": "Modèles de ponctuation. Ajouter les autres signes progressivement."
          }
        ],
        "practice": "reading"
      },
      {
        "id": "p2-reading-main-idea",
        "title": "Trouver l’idée importante",
        "goal": "Dire de quoi parle surtout un paragraphe.",
        "instruction": "Lis un paragraphe du texte des forêts. Dis son idée la plus importante et montre un détail qui l’appuie. Pose ensuite une question sur ce passage.",
        "readyWhen": "L’enfant formule une idée fidèle au paragraphe et peut montrer un passage qui l’appuie.",
        "documents": [
          {
            "id": "p2-a6caffc0f3c2",
            "pages": [
              5
            ],
            "role": "activity",
            "note": "Un paragraphe seulement."
          },
          {
            "id": "p2-a6caffc0f3c2",
            "pages": [
              1,
              2,
              3,
              4
            ],
            "role": "parent",
            "note": "Les idées principales commentées sont des modèles pour le parent, pas des phrases à faire réciter."
          },
          {
            "id": "p2-50e2b03f4e39",
            "pages": [
              1,
              2,
              3
            ],
            "role": "parent",
            "note": "Aider à distinguer une question répondue dans le texte d’une question qui exige une autre recherche."
          }
        ],
        "practice": "reading"
      },
      {
        "id": "p2-reading-links",
        "title": "Relier les mots et les idées",
        "goal": "Retrouver ce qu’un mot remplace et comprendre un lien simple.",
        "instruction": "Avec le parent, choisis une phrase contenant « ils » ou une autre reprise. Montre les mots qu’elle remplace. Si cela va bien, explique aussi un lien comme « parce que », « mais » ou « puis ».",
        "readyWhen": "L’enfant retrouve le référent et vérifie que la phrase garde son sens; le lien entre deux idées peut être repris dans une autre séance.",
        "documents": [
          {
            "id": "p2-2ef21a9512ef",
            "pages": [
              5
            ],
            "role": "activity",
            "note": "Choisir une reprise dans une phrase accessible."
          },
          {
            "id": "p2-2ef21a9512ef",
            "pages": [
              1,
              2,
              3,
              4
            ],
            "role": "parent",
            "note": "La fiche traite des mots qui remplacent d’autres mots: référents, genre, nombre et sens."
          },
          {
            "id": "p2-7dc016328b6b",
            "pages": [
              1,
              2,
              3,
              4
            ],
            "role": "parent",
            "note": "Choisir un seul lien courant; les catégories complètes ne sont pas à mémoriser."
          }
        ],
        "practice": "reading"
      },
      {
        "id": "p2-reading-schema",
        "title": "Organiser ce que l’on comprend",
        "goal": "Placer deux informations dans une branche de schéma.",
        "instruction": "Choisis une forêt dans le texte et le schéma informatif. Écris son nom puis ajoute deux informations trouvées dans un paragraphe. Explique à un parent où tu les as trouvées.",
        "readyWhen": "L’enfant relie les deux informations à la bonne branche et retrouve leur origine dans le texte.",
        "documents": [
          {
            "id": "p2-c48071043b52",
            "pages": [
              5
            ],
            "role": "activity",
            "note": "Lire un paragraphe seulement."
          },
          {
            "id": "p2-c48071043b52",
            "pages": [
              7
            ],
            "role": "material",
            "note": "Utiliser le schéma informatif et compléter une seule branche."
          },
          {
            "id": "p2-c48071043b52",
            "pages": [
              1,
              2,
              3,
              4
            ],
            "role": "parent",
            "note": "Le schéma rempli sert de modèle; ne pas le faire recopier en entier."
          },
          {
            "id": "p2-0263dab196d3",
            "pages": [
              1,
              2,
              3
            ],
            "role": "parent",
            "note": "Prolongement lorsque le schéma est facile: une inférence justifiée par un indice du texte et une connaissance. Ce n’est pas exigé dans la première séance."
          }
        ],
        "practice": "reading"
      },
      {
        "id": "p2-reading-response",
        "title": "Raconter et donner son avis",
        "goal": "Rappeler un passage et justifier une réaction.",
        "instruction": "Lis ou écoute un court passage de « Une excursion inoubliable ». Raconte ce qui arrive, puis choisis une question de lecture avec le parent. Donne une raison tirée de l’histoire pour expliquer ta réponse.",
        "readyWhen": "L’enfant raconte l’essentiel du passage et donne une raison liée à l’histoire; une opinion cohérente n’a pas besoin d’être identique à celle du parent.",
        "documents": [
          {
            "id": "p2-829aadd8bc32",
            "pages": [
              4
            ],
            "role": "activity",
            "note": "Un court passage; le parent peut lire à voix haute."
          },
          {
            "id": "p2-5624ae3435ba",
            "pages": [
              1
            ],
            "role": "material",
            "note": "Choisir une ou deux cartes adaptées à ce qui a été lu."
          },
          {
            "id": "p2-5b867e9a20ff",
            "pages": [
              1,
              2,
              3
            ],
            "role": "parent",
            "note": "Rappeler dans ses propres mots; revenir au texte est permis."
          },
          {
            "id": "p2-829aadd8bc32",
            "pages": [
              1,
              2,
              3
            ],
            "role": "parent",
            "note": "Questions de réaction et de ressenti, à justifier par l’histoire."
          },
          {
            "id": "p2-b1d0b1c36570",
            "pages": [
              1,
              2,
              3,
              4
            ],
            "role": "parent",
            "note": "Pour une autre séance: recommander le texte et donner une raison. Cette fiche ne contient pas de texte annexé."
          }
        ],
        "practice": "reading"
      }
    ]
  },
  {
    "id": "numbers",
    "title": "Nombres et découvertes",
    "icon": "🔢",
    "description": "Manipuler, représenter et expliquer une petite découverte mathématique.",
    "steps": [
      {
        "id": "p2-numbers-place",
        "title": "Centaines, dizaines et unités",
        "goal": "Montrer la valeur de chaque chiffre dans un nombre.",
        "instruction": "Construis 462 avec des objets ou du matériel de base 10. Place les chiffres dans le tableau centaines, dizaines, unités. Explique ce que vaut chaque chiffre.",
        "readyWhen": "L’enfant relie chaque chiffre à la quantité représentée et peut expliquer son placement.",
        "documents": [
          {
            "id": "p2-f2f2e5f743c4",
            "pages": [
              6
            ],
            "role": "material",
            "note": "Cartes de chiffres à choisir."
          },
          {
            "id": "p2-f2f2e5f743c4",
            "pages": [
              7
            ],
            "role": "material",
            "note": "Tableau C/D/U; utiliser aussi des objets groupés par dix."
          },
          {
            "id": "p2-f2f2e5f743c4",
            "pages": [
              1,
              2,
              3
            ],
            "role": "parent",
            "note": "Faire un exemple ensemble si les groupements de dix sont encore difficiles."
          }
        ],
        "practice": "numbers"
      },
      {
        "id": "p2-numbers-zero",
        "title": "Le zéro et les milliers",
        "goal": "Garder les bonnes positions dans un nombre jusqu’à 1999.",
        "instruction": "Avec un parent, représente 1 204 dans les quatre colonnes de droite du tableau. Explique la colonne où tu places zéro. Si les positions sont encore difficiles, reprends d’abord 306 et 36 dans le tableau C/D/U.",
        "readyWhen": "L’enfant place le millier, les centaines, les dizaines et les unités, puis explique le rôle du zéro avec sa représentation.",
        "documents": [
          {
            "id": "p2-f2f2e5f743c4",
            "pages": [
              8
            ],
            "role": "material",
            "note": "Utiliser seulement milliers, centaines, dizaines et unités; masquer les deux colonnes de gauche."
          },
          {
            "id": "p2-f2f2e5f743c4",
            "pages": [
              4,
              5,
              7
            ],
            "role": "parent",
            "note": "306 et 36 servent de reprise plus simple. La distinction entre chiffre des dizaines et nombre total de dizaines n’est pas exigée ici."
          }
        ],
        "practice": "numbers"
      },
      {
        "id": "p2-numbers-addition",
        "title": "Échanger pour additionner",
        "goal": "Comprendre pourquoi dix unités deviennent une dizaine.",
        "instruction": "Représente 236 et 118 avec des jetons, des dizaines et des centaines. Réunis le matériel. Quand tu as dix unités, échange-les contre une dizaine, puis explique le total au parent.",
        "readyWhen": "L’enfant montre un échange qui conserve la quantité et peut relire le total obtenu.",
        "documents": [
          {
            "id": "p2-06dd02d9f752",
            "pages": [
              6,
              7
            ],
            "role": "material",
            "note": "Matériel de dizaines et de centaines; ajouter des jetons pour les unités."
          },
          {
            "id": "p2-f2f2e5f743c4",
            "pages": [
              7
            ],
            "role": "material",
            "note": "Tableau C/D/U facultatif pour ranger le matériel."
          },
          {
            "id": "p2-06dd02d9f752",
            "pages": [
              1,
              2,
              3
            ],
            "role": "parent",
            "note": "Modèle de 236 + 118. Privilégier la manipulation; reprendre la méthode écrite de la classe lorsqu’elle est enseignée."
          }
        ],
        "practice": "maths"
      },
      {
        "id": "p2-numbers-subtraction",
        "title": "Échanger pour soustraire",
        "goal": "Retirer une quantité après un échange simple.",
        "instruction": "Construis 42 avec quatre dizaines et deux unités. Pour enlever 18, échange une dizaine contre dix unités. Retire ce qu’il faut, puis montre et explique ce qui reste.",
        "readyWhen": "L’enfant conserve la quantité pendant l’échange et explique comment elle a retiré 18.",
        "documents": [
          {
            "id": "p2-06dd02d9f752",
            "pages": [
              6
            ],
            "role": "material",
            "note": "Dizaines; ajouter des jetons pour les unités."
          },
          {
            "id": "p2-f2f2e5f743c4",
            "pages": [
              7
            ],
            "role": "material",
            "note": "Tableau C/D/U pour garder les positions visibles."
          },
          {
            "id": "p2-06dd02d9f752",
            "pages": [
              1,
              2,
              4,
              5
            ],
            "role": "parent",
            "note": "Le PDF montre 131 − 57, avec plusieurs échanges. La première séance utilise seulement 42 − 18. Garder le modèle plus long pour plus tard et suivre les méthodes de la classe."
          }
        ],
        "practice": "maths"
      },
      {
        "id": "p2-numbers-patterns",
        "title": "Poursuivre une suite",
        "goal": "Repérer une règle que l’on peut expliquer.",
        "instruction": "Choisis un motif avec des objets ou des couleurs. Répète-le trois fois, cache les trois éléments suivants et fais deviner la suite au parent. Explique ta règle.",
        "readyWhen": "L’enfant donne une règle qui permet de retrouver correctement les éléments suivants.",
        "documents": [
          {
            "id": "p2-e1b3e49b313d",
            "pages": [
              5
            ],
            "role": "activity",
            "note": "Quelques motifs à observer pour démarrer."
          },
          {
            "id": "p2-e1b3e49b313d",
            "pages": [
              1,
              2,
              3,
              4
            ],
            "role": "parent",
            "note": "Commencer par un motif répété. Une suite comme 0, 2, 4, 6 sera un autre petit essai, quand la règle concrète est claire."
          }
        ],
        "practice": "numbers"
      },
      {
        "id": "p2-numbers-measure",
        "title": "Mesurer une longueur",
        "goal": "Utiliser des unités identiques sans trous ni chevauchements.",
        "instruction": "Choisis un livre et estime sa longueur. Aligne des trombones identiques le long du livre, sans espace et sans chevauchement. Compte-les et explique ta façon de mesurer.",
        "readyWhen": "L’enfant place les mêmes unités correctement et explique pourquoi elles doivent avoir la même taille.",
        "documents": [
          {
            "id": "p2-d22bb1e38d48",
            "pages": [
              3,
              4
            ],
            "role": "activity",
            "note": "Une seule longueur à mesurer; le résultat dépend de l’objet et des unités choisis."
          },
          {
            "id": "p2-d22bb1e38d48",
            "pages": [
              1,
              2
            ],
            "role": "parent",
            "note": "Faire comparer un placement correct et un placement avec un trou. Capacités et aires attendent une autre séance."
          }
        ],
        "practice": null
      },
      {
        "id": "p2-numbers-shapes",
        "title": "Décrire des figures",
        "goal": "Classer des figures à partir de leurs propriétés.",
        "instruction": "Choisis quatre figures à découper avec le parent. Regroupe celles qui vont ensemble et explique ton choix. Compte les côtés d’un triangle et d’un rectangle.",
        "readyWhen": "L’enfant justifie un classement avec une propriété visible, par exemple le nombre de côtés.",
        "documents": [
          {
            "id": "p2-7697b56bc287",
            "pages": [
              9
            ],
            "role": "material",
            "note": "Choisir seulement quelques figures familières."
          },
          {
            "id": "p2-7697b56bc287",
            "pages": [
              1,
              2,
              3,
              4,
              8
            ],
            "role": "parent",
            "note": "Références de figures planes et idées de manipulation; ne pas exiger tous les noms à la fois."
          }
        ],
        "practice": null
      },
      {
        "id": "p2-numbers-solids",
        "title": "Trouver des solides",
        "goal": "Reconnaître deux objets en volume dans la maison.",
        "instruction": "Observe les modèles de solides. Trouve deux objets de la maison qui ressemblent à un cube, un prisme ou un cylindre. Dessine-les ou nomme-les dans la fiche et explique ton choix.",
        "readyWhen": "L’enfant décrit une ressemblance utile et distingue l’objet en volume d’un dessin plat.",
        "documents": [
          {
            "id": "p2-7697b56bc287",
            "pages": [
              10
            ],
            "role": "material",
            "note": "Modèles de solides à comparer."
          },
          {
            "id": "p2-7697b56bc287",
            "pages": [
              11
            ],
            "role": "activity",
            "note": "Remplir deux cases seulement."
          },
          {
            "id": "p2-7697b56bc287",
            "pages": [
              5,
              6
            ],
            "role": "parent",
            "note": "Aider à décrire les faces et les formes; cône et sphère peuvent être explorés dans une autre séance."
          }
        ],
        "practice": null
      },
      {
        "id": "p2-numbers-clock",
        "title": "Lire une heure entière",
        "goal": "Distinguer l’aiguille des heures et celle des minutes.",
        "instruction": "Prépare l’horloge mobile avec le parent. Place trois heures entières annoncées. À chaque fois, montre l’aiguille des heures et celle des minutes.",
        "readyWhen": "L’enfant place une heure entière et explique le rôle des deux aiguilles.",
        "documents": [
          {
            "id": "p2-cea2fdaabf9e",
            "pages": [
              2
            ],
            "role": "material",
            "note": "Horloge mobile et aiguilles."
          },
          {
            "id": "p2-cea2fdaabf9e",
            "pages": [
              1,
              3
            ],
            "role": "parent",
            "note": "La page PDF 3 contient huit cadrans avec matin/après-midi: la garder pour une séance ultérieure, après les demi-heures, les quarts et le comptage par 5. Les pages sont numérotées selon leur position dans le PDF."
          }
        ],
        "practice": null
      }
    ]
  },
  {
    "id": "problems",
    "title": "Résoudre et expliquer",
    "icon": "🧩",
    "description": "Suivre un petit problème étape par étape, puis essayer une nouvelle situation.",
    "steps": [
      {
        "id": "p2-problems-understand",
        "title": "Comprendre la question",
        "goal": "Dire ce que l’on cherche avant de calculer.",
        "instruction": "Lis ou écoute le problème de Damien. Raconte la situation avec tes mots et dis ce que l’on cherche. Pour cette première étape, tu n’as pas encore besoin de calculer.",
        "readyWhen": "L’enfant explique la question et le sens des mots importants de la situation.",
        "documents": [
          {
            "id": "p2-9c89a3b90808",
            "pages": [
              4
            ],
            "role": "activity",
            "note": "Utiliser seulement la situation de Damien; ne pas passer aux autres problèmes."
          },
          {
            "id": "p2-9c89a3b90808",
            "pages": [
              1,
              2,
              3
            ],
            "role": "parent",
            "note": "Modéliser la reformulation. Les pages 5–6 offrent des prolongements qui ne font pas partie de cette séance."
          }
        ],
        "practice": null
      },
      {
        "id": "p2-problems-data",
        "title": "Relier les données",
        "goal": "Comprendre le rôle des nombres utiles.",
        "instruction": "Reprends Damien. Combien d’oranges mange-t-il chaque jour et pendant combien de jours? Dessine une case pour chaque jour, puis explique quelles informations t’ont aidée.",
        "readyWhen": "L’enfant relie les deux oranges à chacun des sept jours et peut expliquer d’où viennent ces données.",
        "documents": [
          {
            "id": "p2-522b22d3e98f",
            "pages": [
              3
            ],
            "role": "activity",
            "note": "Relier les données avant de choisir une opération."
          },
          {
            "id": "p2-522b22d3e98f",
            "pages": [
              1,
              2,
              4
            ],
            "role": "parent",
            "note": "Les deux pommes sont utiles parce que le texte annonce autant d’oranges. La mention de la sœur n’aide pas le calcul."
          }
        ],
        "practice": null
      },
      {
        "id": "p2-problems-plan",
        "title": "Choisir un plan",
        "goal": "Choisir un dessin ou des objets pour représenter la situation.",
        "instruction": "Pour aider Damien, choisis des jetons ou un dessin. Prépare sept groupes et explique au parent comment ton outil permettra de répondre à la question.",
        "readyWhen": "L’enfant choisit une représentation adaptée aux données et explique comment l’utiliser.",
        "documents": [
          {
            "id": "p2-522b22d3e98f",
            "pages": [
              3
            ],
            "role": "activity",
            "note": "Rappel de la situation déjà comprise."
          },
          {
            "id": "p2-fcc7604f506b",
            "pages": [
              5
            ],
            "role": "material",
            "note": "Deux outils simples: dessiner ou manipuler."
          },
          {
            "id": "p2-c16f35ebe82d",
            "pages": [
              1,
              2,
              3
            ],
            "role": "parent",
            "note": "Rester à deux oranges par jour. La variante à 42 oranges n’est pas demandée."
          },
          {
            "id": "p2-fcc7604f506b",
            "pages": [
              1,
              2,
              3,
              4
            ],
            "role": "parent",
            "note": "Ne pas utiliser les pages 6–7 dans cette séance. La page 6 comporte 88 boutons dans l’énoncé mais 48 dans l’équation, ainsi que trois en-têtes de monnaie identiques; elle ne doit pas servir de correction."
          }
        ],
        "practice": null
      },
      {
        "id": "p2-problems-calculate",
        "title": "Garder des traces",
        "goal": "Faire un calcul que l’on pourra expliquer et vérifier.",
        "instruction": "Place deux jetons dans chacun des sept groupes. Trouve le total, garde un dessin ou un calcul lisible et écris une courte réponse avec le mot « oranges ».",
        "readyWhen": "Les traces de l’enfant montrent les groupes, le calcul et une réponse liée à la question.",
        "documents": [
          {
            "id": "p2-a2849e11c214",
            "pages": [
              5
            ],
            "role": "material",
            "note": "Chiffres et grille de dix si utiles; de simples jetons et une feuille suffisent."
          },
          {
            "id": "p2-a2849e11c214",
            "pages": [
              1,
              2,
              3,
              4
            ],
            "role": "parent",
            "note": "Le modèle donne 14 oranges. Le prolongement 7 × 42 = 294 n’est pas demandé. Ne pas présenter ces modèles comme une série de problèmes indépendants."
          }
        ],
        "practice": "maths"
      },
      {
        "id": "p2-problems-check",
        "title": "Vérifier sa solution",
        "goal": "Vérifier le calcul et relire la question.",
        "instruction": "Reprends tes traces de Damien. Recompte les groupes d’une autre façon. Relis la question et vérifie si ta phrase répond bien à ce qui était demandé.",
        "readyWhen": "L’enfant montre une vérification et peut corriger une erreur ou préciser sa phrase de réponse.",
        "documents": [
          {
            "id": "p2-774415f4a704",
            "pages": [
              3
            ],
            "role": "activity",
            "note": "Choisir deux questions de vérification adaptées au travail déjà fait."
          },
          {
            "id": "p2-774415f4a704",
            "pages": [
              1,
              2,
              4
            ],
            "role": "parent",
            "note": "Vérifier aussi les données, l’unité et le sens de la réponse; le problème de Coralie attend une autre séance."
          }
        ],
        "practice": null
      },
      {
        "id": "p2-problems-explain",
        "title": "Expliquer sa démarche",
        "goal": "Rendre sa solution compréhensible à quelqu’un d’autre.",
        "instruction": "Montre ton travail à un parent. Explique ce que tu cherchais, ce que tu as fait et comment tu as vérifié. Le parent peut te poser une question pour mieux comprendre.",
        "readyWhen": "Le parent peut suivre la démarche de l’enfant et retrouver sa réponse grâce à ses explications.",
        "documents": [
          {
            "id": "p2-0d91e57f7298",
            "pages": [
              3
            ],
            "role": "activity",
            "note": "Choisir trois questions d’appui; inutile de réciter toute la liste."
          },
          {
            "id": "p2-0d91e57f7298",
            "pages": [
              1,
              2
            ],
            "role": "parent",
            "note": "Soutenir l’explication orale avec les traces; accepter les mots de l’enfant."
          }
        ],
        "practice": null
      },
      {
        "id": "p2-problems-console-total",
        "title": "Un nouveau problème",
        "goal": "Réutiliser sa démarche pour trouver un effectif.",
        "instruction": "Lis la mission « Maths et manettes » avec un parent. Pour commencer, trouve seulement combien d’élèves de 3e et de 4e année participeront. Garde tes traces et vérifie la réponse.",
        "readyWhen": "L’enfant relie les deux effectifs, explique son calcul et vérifie que le total répond à la question.",
        "documents": [
          {
            "id": "p2-e41f514c4173",
            "pages": [
              2,
              3
            ],
            "role": "activity",
            "note": "Séance limitée au scénario et à 55 + 65 élèves."
          },
          {
            "id": "p2-e41f514c4173",
            "pages": [
              6
            ],
            "role": "parent",
            "note": "Grille d’observation de la démarche, sans corrigé. Le total attendu est 120; le budget de la page 5 n’est pas demandé."
          }
        ],
        "practice": "maths"
      },
      {
        "id": "p2-problems-console-material",
        "title": "Organiser le matériel",
        "goal": "Relier les consoles au nombre de télévisions.",
        "instruction": "Dans la carte du matériel, regarde seulement les 10 consoles rétro et les 8 nouvelles consoles. Trouve le nombre total de consoles, puis le nombre de télévisions si chaque console en a une. Explique le lien.",
        "readyWhen": "L’enfant organise les deux quantités et explique pourquoi le nombre de télévisions est le même que le total des consoles.",
        "documents": [
          {
            "id": "p2-e41f514c4173",
            "pages": [
              4
            ],
            "role": "activity",
            "note": "Se limiter aux consoles et aux télévisions dans cette petite séance."
          },
          {
            "id": "p2-e41f514c4173",
            "pages": [
              2,
              3,
              6
            ],
            "role": "parent",
            "note": "Attendu: 18 consoles et 18 télévisions. La moitié de 120 pour les manettes attend la compréhension du partage en deux. Le budget de la page 5 demande plusieurs multiplications et reste un prolongement accompagné."
          }
        ],
        "practice": "maths"
      }
    ]
  }
];

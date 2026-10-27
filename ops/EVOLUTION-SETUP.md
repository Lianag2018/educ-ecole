# Évolution des apprentissages — branche à vérifier

Cette PR prépare une sauvegarde privée des réponses et une adaptation pédagogique.
Elle ne modifie aucun service en production et ne constitue pas une activation.
Le dépôt GitHub public ne reçoit ni feuilles scolaires, ni réponses, ni noms,
ni codes d’accès. Aucune clé OpenAI/Supabase n’est ajoutée à GitHub Actions.

## Parcours prévu

1. Le parent se connecte dans Educ École, puis choisit **Parents → Progrès →
   Activer pour cet enfant**, séparément pour les deux profils.
2. Les essais locaux reçoivent un identifiant stable avant envoi. Le serveur
   conserve un journal par parent et enfant. Les nouveaux essais et les réponses
   des autres appareils sont réunis sans remplacer l’historique local. Une aide
   ou une reprise ne devient pas une réussite autonome par répétition.
3. **Devoirs et documents → Photo → activités** utilise le parcours existant :
   sélectionner les images déclenche leur analyse. L’insertion d’un nouveau plan
   met aussi l’adaptation en attente. La même extraction sauvegardée ne crée pas
   une nouvelle révision.
4. La synchronisation propose immédiatement une analyse si elle est disponible.
   Le workflow horaire reprend les nouveautés restées en attente, même si le
   navigateur est fermé. Il ne peut traiter que les données déjà arrivées au
   serveur. Déposer un fichier dans une conversation ChatGPT ne l’envoie pas à
   Educ École.
5. OpenAI reçoit un bilan agrégé des 2 000 derniers essais et au plus deux plans
   récents, puis retourne jusqu’à trois priorités de français et une stratégie
   prédéfinie. Ces priorités départagent les domaines de même besoin observé;
   les révisions dues, la difficulté mesurée et l’année scolaire restent
   prioritaires. Une proposition expire pour la sélection après sept jours.
   L’aventure déjà commencée reste stable. Les exercices des plans en maths et
   en français continuent d’être construits par les modèles d’activités existants.
6. Les questions directes au tuteur utilisent aussi ce bilan serveur, y compris
   dans une activité issue d’un plan. Les phrases/audio de la conversation ne
   sont pas ajoutés au journal de progrès. Les notions incomplètes ou non prises
   en charge sont affichées au parent pour clarification.

Ce workflow **adapte les activités**, il ne donne pas à un modèle l’autorisation
de réécrire ou publier seul le code de l’application. Les futures fonctionnalités
passent par une PR et les vérifications habituelles.

## Configuration après revue et fusion

À réaliser uniquement dans le projet familial Supabase et le projet Vercel
`educ-ecole`, jamais dans un projet professionnel.

1. Vérifier les prérequis existants : compte parent vérifié, deux entrées dans
   `famille_voice_profiles`, `EDUC_PARENT_ID`, `EDUC_ORIGIN`, clés Supabase et
   `EDUC_OPENAI_API_KEY` serveur. Ne pas remplacer les valeurs déjà configurées.
2. Après revue SQL, appliquer `ops/supabase/003-learning-memory.sql` **une fois**.
   Il dépend de `002-voice-budget.sql` et `school-plans-schema.sql`. Les tables et
   RPC sont réservées à `service_role`; aucune politique n’ouvre un accès direct
   aux navigateurs. Les fichiers SQL de test ne doivent jamais être appliqués à
   la base familiale.
3. Dans le JSON `EDUC_VOICE_CONFIG`, ajouter `learningEnabled: true` pour la
   sauvegarde. Ajouter `learningAutoEnabled: true` seulement lorsque les
   validations existantes de consentement, confidentialité, éligibilité des
   données, hébergement, tarifs et conversion sont effectivement satisfaites.
   Les indicateurs existants ne sont jamais forcés par cette PR.
4. Déployer le commit revu. Les routes explicites `/api/learning/{sync,evolve,run}`
   et `/api/plans/{status,import,list}` utilisent le runtime existant.
5. Fusionner le workflow sur `main` pour rendre son horaire disponible. Un
   lancement manuel dans **GitHub → Actions → Évolution Educ École** utilise la
   même authentification OIDC. L’identité autorisée est fixée au dépôt personnel,
   à sa branche `main`, à ce fichier de workflow et aux événements
   `schedule`/`workflow_dispatch`. Une PR ou un fork ne peut pas exécuter le travail
   privé. GitHub peut retarder les horaires et suspendre ceux d’un dépôt public
   inactif; la synchronisation depuis l’application reste le premier déclencheur.
6. Vérifier avec un parent : une feuille réelle lisible pour chaque enfant,
   une réponse sur deux appareils, reconnexion après expiration, et contrôle du
   registre budgétaire. Ne pas annoncer le parcours en production avant ce test.

## Budget, reprise et limites

- Plafond familial inchangé : **40 CAD/mois**, autres frais configurés compris.
  Les analyses utilisent la même réservation SQL durable que les photos et le
  tuteur. Le montant maximum est débité avant OpenAI; pas de remboursement
  automatique après une réponse ambiguë.
- Au plus une tentative d’adaptation par enfant et par jour de Toronto. Une
  révision réclamée ne sera pas réessayée automatiquement après un échec, même
  le lendemain. Une nouvelle réponse ou un nouveau plan crée une autre révision,
  admissible le lendemain si une tentative a déjà eu lieu aujourd’hui. Une
  erreur de budget ou de configuration après réclamation laisse donc les
  priorités antérieures en place. Aucun bouton ne contourne ces règles.
- La session parent reste limitée à une heure. Après expiration, les essais
  continuent localement; la prochaine connexion reprend l’envoi. L’horaire GitHub
  ne peut pas lire un navigateur hors connexion.
- Seuls les essais structurés, les priorités et les plans déjà analysés sont
  synchronisés. Les réglages, noms, codes, photos locales, récompenses, progression
  de navigation et cartes saisies manuellement ne sont pas des sauvegardes cloud
  de cette PR. Une nouvelle installation garde son point de départ pédagogique.
- Effacer les données **locales** ne supprime pas le journal serveur; réactiver
  la synchronisation le récupère. La suppression serveur reste une opération
  parent à prévoir séparément. Le service ne stocke pas de transcriptions.
- Des copies anciennes d’un même historique sans identifiants peuvent être
  importées comme essais distincts; les preuves de maîtrise restent regroupées
  par activité et journée et ne gonflent donc pas la progression.

## Vérifications reproductibles

`npm test` et `npm run build` couvrent la sauvegarde, les erreurs, les limites
budgétaires, les signatures RSA OIDC, les données non fiables et la sélection.

Le job PR lance également `node ops/test-learning-db.mjs` avec PostgreSQL 16
jetable sur `localhost/educ_test`. Il vérifie les droits réels, les transactions,
les doublons, le verrouillage de six sessions concurrentes et le plafond partagé.
Il ne se connecte pas à Supabase. Les identités sont synthétiques. Les tests du
fournisseur utilisent des réponses simulées, sans appel OpenAI payant.

`CHROMIUM_PATH=/chemin/vers/chromium node ops/tests/learning-browser.mjs`
vérifie le DOM et le vrai `fetch` du navigateur, la reconnexion, les deux enfants
et la mise en page tablette avec des endpoints locaux simulés. Ce contrôle est
également exécuté dans le job PR avec Chrome du runner Ubuntu.

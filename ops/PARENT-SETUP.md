# Compte parent et tablette familiale

Les enfants n'ont aucun compte Auth. Les profils locaux p1/p2 restent accessibles
par leur prénom. La session parent conserve sa durée d'une heure pour les imports,
le tuteur et les changements d'autorisation. L'accès facultatif de tablette dure
90 jours et autorise seulement `/api/learning/sync` et `/api/plans/list`.
Le workflow existant peut traiter les nouveautés sauvegardées si sa configuration
OpenAI est effectivement prête; l'accès tablette n'active aucun service payant.

Le cookie `educ_device` est Secure, HttpOnly, SameSite Strict, limité à `/api` et
contient 32 octets aléatoires. Seul son SHA-256 est stocké. Toute demande vérifie
la durée et la révocation en base. Aucune identité enfant ni clé fournisseur dans
le cookie ou localStorage. La table et les RPC n'acceptent que service_role;
les fonctions sont security invoker. Vingt appareils actifs maximum par foyer.
Un parent connecté peut retirer toutes les autorisations; un appareil peut
retirer seulement la sienne. Fermer la session parent conserve l'autorisation
explicitement donnée à l'appareil. Effacer les cookies la retire localement.

## Mise en service par un opérateur autorisé

1. Vérifier projet Vercel personnel, Supabase familial et SHA de main. Appliquer
   `ops/supabase/family-devices-schema.sql` une seule fois après revue et tests.
2. Publier la version revue. Pour une invitation, définir exclusivement en
   production `EDUC_PARENT_SETUP_EMAIL`, `EDUC_PARENT_SETUP_TOKEN` (32 octets
   aléatoires encodés base64url), `EDUC_PARENT_SETUP_EXPIRES` (ISO UTC, moins d'une
   heure). Ne jamais placer ces valeurs dans GitHub, les builds ou des logs.
3. Appeler POST `/api/parent/provision` avec Origin exact et le jeton opérateur
   Bearer, corps `{}`. La route est liée au projet et à la base personnels, fermée
   par défaut, bornée dans le temps et à usage unique en base. Elle ne retourne
   aucune clé serveur. Elle ne modifie jamais le mot de passe d'un parent confirmé.
4. Enregistrer le `parentId` renvoyé dans `EDUC_PARENT_ID`, préparer les slots p1
   (1re année) et p2 (3e année) sans écraser les profils existants, puis retirer
   les variables temporaires et republier le même SHA. Si la réponse est ambiguë,
   inspecter l'état avant une nouvelle tentative. Ne jamais auto-confirmer Auth.
5. Livrer l'`activationUrl` uniquement au courriel privé du parent identifié,
   par son canal de messagerie autorisé. Aucun lien dans une PR, un log, un test,
   un screenshot ou un document public. Le lien est généré par Supabase Auth
   (`generateLink`, type invite) pour une livraison par messagerie personnalisée.
   Le fragment est retiré de l'historique par la page; le parent saisit son mot
   de passe. Le serveur vérifie le jeton avec Supabase et l'UUID avant de changer
   le mot de passe via le JWT utilisateur. Aucun secret administrateur au client.
6. Le parent confirme le lien et choisit son mot de passe lui-même. Il peut
   autoriser la tablette sur cette page ou dans Parents → Réglages. La sauvegarde
   reste facultative et s'active séparément pour chaque enfant dans Progrès.

En cas de refus du mot de passe, une session d'activation HttpOnly de dix minutes
permet une nouvelle saisie sans réutiliser le lien consommé. Elle n'autorise aucun
autre endpoint. La session parent n'est créée qu'après la mise à jour réussie.

Les liens expirés nécessitent une nouvelle invitation autorisée. Le parcours
automatique complet avec données d'enfants reste soumis aux conditions OpenAI,
aux consentements et au budget existants. Cette livraison ne les atteste pas.

## Vérifications

`npm run build` exécute les tests Node. `ops/test-learning-db.mjs` vérifie aussi
les droits réels, limites et révocations en PostgreSQL 16 local jetable ainsi que
six demandes concurrentes d'une même opération de provisionnement. Aucun fixture
sur la base familiale. Les tests HTTP simulent Supabase et n'envoient pas de mail.

Références : https://supabase.com/docs/reference/javascript/auth-admin-generatelink
et https://supabase.com/docs/reference/javascript/auth-verifyotp

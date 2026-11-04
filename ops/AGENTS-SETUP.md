# Agents et Actions Éduc École

## Deux circuits distincts

Le formulaire Parents → Devoirs et documents → Analyse du plan avec OpenAI
transmet la photo et une préférence facultative au serveur personnel, pour le
profil choisi. La préférence est limitée à 600 caractères, reste dans le message
utilisateur et ne peut modifier les règles système. Elle priorise les notions
visibles; ce formulaire ne fabrique pas encore des types de jeux arbitraires.
Le cache distingue les préférences et conserve le cache historique si elles sont
vides. La photo et la préférence brute ne sont pas sauvegardées par ce parcours;
les notions validées sont privées. Aucun contenu n'est envoyé à GitHub.

Le serveur utilise EDUC_OPENAI_API_KEY existant sur Vercel. Les protections
parent, budget, éligibilité et rétention restent nécessaires. Cette livraison
n'active aucun indicateur et ne prouve pas l'approbation ZDR.

Pour modifier le logiciel, deux profils sont définis dans `.github/agents` :

- `educ-developpement` : implémentation et PR avec exemples fictifs.
- `educ-verification` : revue et vérifications sans publication.

Ces profils configurent un agent GitHub compatible; ils ne lancent pas eux-mêmes
une session et ne configurent pas une clé OpenAI pour le moteur GitHub. L'accès
au moteur de programmation dépend du compte GitHub. Ne pas recopier la clé de
l'application pour contourner cette distinction. Le parent n'a pas encore un
bouton qui assigne automatiquement une demande privée à cet agent : cette liaison
reste à construire avec une mission technique expurgée et une validation explicite
avant tout transfert vers le dépôt public.

## Vérifications et évolution

`Vérifier Éduc École — deux profils` exécute les tests, le build et le lecteur
navigateur sur chaque PR, main, merge queue ou lancement manuel. Aucun filtre de
chemins ne doit laisser une modification de configuration sans vérification.

`Évolution Educ École` vérifie également chaque PR/main/merge queue, avec SQL
jetable et parcours navigateur. Son travail horaire/manuellement déclenché est
inchangé : GitHub OIDC limité au dépôt, main et au workflow autorisés, puis appel
au serveur privé. La clé OpenAI et les données scolaires restent sur le serveur.
Le résumé du run indique explicitement quand l'analyse automatique est désactivée.
Un run vert dans ce cas prouve une exécution sans traitement, pas une analyse IA.

La CI n'impose pas à elle seule la protection de main ni un blocage du déploiement
Vercel. La protection de branche était absente à la lecture du 4 novembre 2026.
Exiger `tests` et `verify` avant fusion dans les réglages du dépôt reste à vérifier
avec un accès administratif; ne jamais annoncer cette protection comme installée
sur la seule base des fichiers YAML. La publication et son SHA doivent toujours
être contrôlés séparément.

## Mise en service restante

1. Confirmer l'approbation fournisseur pour le projet effectivement utilisé et
   les endpoints autorisés, puis les tarifs et le budget serveur.
2. Tester les imports des deux profils avec le parent; tests CI fictifs seulement.
3. Vérifier l'accès au moteur GitHub, lancer une mission technique synthétique et
   confirmer la PR produite. Aucun agent autonome actif n'est revendiqué ici.
4. Construire le brouillon privé → validation parent → disponibilité enfant et
   la transmission expurgée des nouvelles fonctionnalités vers l'agent. Le
   parcours actuel installe les plans validés par le schéma, sans cette nouvelle
   étape éditoriale. Ne pas confondre ces deux validations.

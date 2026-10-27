> **Reprise et accès :** consulter [PROJECT-STATE](ops/PROJECT-STATE.md) et [ACCESS-RUNBOOK](ops/ACCESS-RUNBOOK.md). Les rubriques datées ci-dessous distinguent l’état récent et les livraisons historiques; ne pas confondre narration et conversation micro.

## Retour oral court — 22 octobre 2026

La narration préenregistrée et les extraits de nombres sont déjà livrés par PR26. Le nouvel exercice `/api/voice/check` est distinct de la conversation libre et de la simple réécoute locale. Il compare la transcription d’un nombre ou d’un mot intégré avec une cible autorisée, puis rend une des trois phrases fixes. Il ne mesure pas la qualité phonétique et n’augmente aucun niveau.

### État réel avant publication

Le parent a demandé l’usage accompagné; cette autorisation n’est pas à redemander pour préparer et publier le code. Elle ne prouve pas la configuration d’un compte fournisseur ou d’une base distante. Le projet Vercel personnel est identifié mais le connecteur retourne 403. Aucun accès au Supabase personnel, provisionnement des profils, schéma budgétaire actif ou approbation ZDR du projet OpenAI n’a été confirmé. Les anciens essais d’exploitation ne démontrent pas une activation. Aucun service professionnel ne sert de solution de remplacement.

Le code garde donc le service fermé tant que les conditions réelles ne sont pas satisfaites. Aucun enregistrement d’enfant n’a été transmis. Les tests fournisseur sont simulés; le navigateur a réellement capturé un signal synthétique avec AudioWorklet. La livraison Git/Vercel de l’interface ne doit pas être annoncée comme une activation du microphone IA.

### Contrat et périmètre

`POST /api/voice/check` accepte exclusivement `profileId`, `target`, `audio`, `adultPresent`, `adultConfirmedAt`. La cible est `{kind:'number',value}` ou `{kind:'word',activityId}`. La liste des mots et les bornes numériques sont définies dans `src/oral-check-targets.js` : p1 0–99; p2 0–1 999 selon son niveau serveur. Les phonèmes isolés, phrases, PDF et mots privés importés ne sont pas acceptés.

Connexion parent Supabase vérifiée, origine exacte, profil appartenant au parent et attestation adulte de moins de quinze minutes sont requis à chaque requête. Le navigateur renouvelle cette attestation après un changement de profil, de page ou une mise en arrière-plan. Une case cochée est une déclaration; l’application ne détecte pas la présence physique d’un adulte.

Capture huit secondes au plus côté client, WAV PCM mono 24 kHz. Le serveur vérifie indépendamment l’en-tête, les données et une durée au plus dix secondes; il accepte seulement 16/24/48 kHz et 16 bits mono. Une absence de signal exploitable donne un retour incertain avant réservation. Ce contrôle n’est ni une analyse de prononciation ni une reconnaissance de personne.

Le serveur appelle une seule fois `https://api.openai.com/v1/audio/transcriptions`, avec `model=gpt-transcribe`, `response_format=json` et `languages[]=fr`. Aucun mot attendu, prompt, prénom, contexte scolaire ou historique n’est transmis avec le WAV. Une réponse sans langue française unique, trop longue, inconnue ou ambiguë reste incertaine. Le texte brut n’est ni renvoyé au navigateur ni enregistré. La réponse est bornée à 8 Ko et l’appel à vingt secondes. Pas de retry fournisseur automatique.

Les retours enfant sont fermés : « Bravo! J’ai reconnu ta réponse. », « Écoutons le modèle, puis essaie encore. On prend notre temps. » ou « Je n’ai pas bien entendu. Tu peux réessayer avec l’adulte. ». Les textes intégrés sont préenregistrés au build; aucune requête chat ou synthèse payante n’est faite après chaque essai. Reconnaître une transcription ne démontre pas une prononciation parfaite. Une voix québécoise enfantine n’a pas fait l’objet d’un benchmark dans cette livraison.

### Configuration supplémentaire, après vérification effective

Les variables personnelles et six conditions existantes décrites plus bas restent obligatoires. `EDUC_VOICE_CONFIG` doit ajouter `oralCheckEnabled:true` et `oralCheckModel:'gpt-transcribe'` uniquement après les contrôles réels. `rates.sttMinuteMicros` doit être un entier au moins égal à 6 000. C’est une réserve interne prudente pour une minute entière, pas une facturation minimale officielle. Le tarif OpenAI consulté est 0,0045 USD/minute; vérifier le tarif et le modèle au moment de l’activation.

La conversion CA, les frais, la marge, les dates de validité, les coûts fixes et le registre durable du foyer sont requis. La réserve demeure débitée en cas d’interruption ou d’erreur ambiguë; six réservations par minute et plafond mensuel partagé existant. Aucun compteur en mémoire ne remplace PostgreSQL.

Pour des enfants de moins de treize ans, la documentation OpenAI demande l’activation de Zero Data Retention avant traitement de leurs données personnelles. Vérifier l’approbation et l’applicabilité au projet et à l’endpoint exacts; ne pas confondre absence de stockage dans l’app, `store:false`, consentement familial et rétention fournisseur. Aucun booléen de configuration ne doit être mis à vrai pour contourner cette vérification.

`/api/voice/status` ajoute `authConfigured`, `oralCheckAvailable` et `oralCheckReason` (`setup_required`, `parent_required`, `ready`); l’ancien `available` reste réservé à la conversation libre. Le statut de configuration ne teste pas à lui seul toutes les migrations ni une facture réelle. Après raccordement, exécuter un essai adulte consenti, contrôler la réservation durable et le nettoyage, puis examiner avec le parent la reconnaissance de la voix familiale. Aucun résultat simulé ne doit servir de preuve d’activation.

Références : [API de transcription](https://developers.openai.com/api/docs/guides/speech-to-text), [modèle et prix gpt-transcribe](https://developers.openai.com/api/docs/models/gpt-transcribe), [conditions d’usage avec des mineurs](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance), [rétention des données](https://developers.openai.com/api/docs/guides/your-data). Consultées le 22 octobre 2026. [Audit pédagogique et limites](ops/AUDIT-PEDAGOGIQUE-2026-10-22.md).

## État du 21 octobre 2026 — projet personnel en production

L’application est publiée sur https://educ-ecole.vercel.app, depuis `Lianag2018/educ-ecole`. Les sections de livraison du 20 octobre ci-dessous décrivent l’état historique et ne doivent pas être utilisées pour conclure que la lecture audio attend encore une activation.

- La narratrice préenregistrée est sélectionnée par défaut. Les fichiers OpenAI sont servis par le site; un clic de lecture ne déclenche aucun appel payant et ne transmet aucune voix d’enfant.
- `ops/generate-narration.mjs` utilise `EDUC_OPENAI_API_KEY` uniquement lors d’un build de production sur `main`. Les previews et les builds locaux ne font aucun appel payant. Les fichiers déjà publiés sont réutilisés.
- `/audio/status.json` donne l’état réel (`ready`, `partial` ou `unavailable`), le nombre de fichiers disponibles et un code d’erreur sans secret. `/audio/manifest.json` contient uniquement les textes pédagogiques intégrés et les noms de MP3 publics. Une génération interrompue conserve les fichiers réussis pour la reprise suivante.
- Le catalogue de 395 enregistrements couvre les exercices intégrés, les histoires et les nombres de 0 à 1 999. Les nombres sans enregistrement entier se lisent en petits groupes (mille, centaines, unités). Ne déclarer la couverture audio complète qu’après vérification du statut publié.
- La conversation libre au microphone est un service différent. Elle reste soumise à la configuration serveur, à l’authentification parent, au budget durable et à la vérification effective de la rétention fournisseur. La lecture préenregistrée fonctionne indépendamment. Ne pas modifier ces protections pour simuler une activation.
- Aucun service professionnel n’est à modifier. Les données locales des deux lectrices restent séparées; aucune synchronisation entre appareils ni analyse de prononciation n’est annoncée.

Vérifications réalisées : tests Node et build; MP3 de lapin, 307, 1 999 et d’une histoire valides; lecture complète dans le navigateur pour lapin et 1 000; passage automatique au mot suivant après une bonne réponse. L’écoute sur un iPad physique n’a pas été vérifiée.

---

# Conversation vocale serveur — livraison du 20 octobre 2026

Le transport livré est tour par tour : capture PCM mono WAV de 10 secondes maximum, validation indépendante en-tête/taille/durée serveur, réservation durable du maximum avant tout appel, transcription française, réponse contextualisée, synthèse et lecture. Arrêt/interruption annulent la requête et ferment le micro; une requête déjà facturable conserve son débit maximal. Le texte permet une question sans micro et reste disponible si la synthèse échoue. Les erreurs ne sont jamais remplacées par une fausse réponse IA.

Les histoires originales et exercices, le studio local et les nouveaux ops/Supabase importés sont conservés. La courte conversation reste en mémoire du navigateur (deux échanges), effacée à la sortie d’activité, au changement de profil et à la mise en arrière-plan. Pas de stockage serveur de voix ou transcription, de logs des corps, de traces OpenAI, de clé client, de token Realtime ou de WebRTC. L’historique et le contexte scolaire sont explicitement des données non fiables, jamais des messages système. Aucune évaluation automatique de prononciation.

## Activation actuellement bloquée

Aucune clé ni admissibilité du compte OpenAI n’a été vérifiée. Aucune migration distante, aucun déploiement distant ni configuration de secret n’a été effectué. Le workflow conservé livre une **preview statique**, qui ne peut pas activer la voix. Le module `api/[...path].mjs` est prévu pour un hébergement Vercel Node du projet école complet; le serveur Node local utilise le même runtime. Le build `dist` reste exclusivement public. Ne pas publier `ops` comme fichiers statiques. Ne pas utiliser l’application pro/Render.

Avant des données réelles : confirmer le consentement parent, les protections pour mineurs, l’approbation effective Zero Data Retention du projet OpenAI et l’admissibilité exacte des endpoints transcription, chat et speech. `store:false` seul n’est pas ZDR. L’absence de stockage applicatif ne démontre aucune absence de rétention fournisseur. Bloquer tant que la vérification n’est pas faite.

## Configuration exclusivement hébergeur

- `EDUC_ORIGIN` : origine HTTPS exacte sans slash final.
- `EDUC_SUPABASE_URL`, `EDUC_SUPABASE_ANON_KEY`, `EDUC_SUPABASE_SERVICE_KEY` : projet école dédié; jamais dans `src`, le build, les workflows ou un worker client.
- Intégration Vercel/Supabase : si **aucune** de ces trois variables `EDUC_SUPABASE_*` n'est définie, le serveur accepte l'ensemble `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`. Ancienne intégration : `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Un ensemble explicite ou moderne incomplet reste bloquant : aucune clé n'est empruntée à un autre ensemble/projet. Les clés opaques `sb_publishable_`/`sb_secret_` vont dans `apikey`; un JWT utilisateur vérifié reste nécessaire pour identifier le parent. Aucun secret n'est publié dans le navigateur.
- `EDUC_PARENT_ID` : UUID du compte parent Supabase Auth confirmé. Le parent se connecte par courriel/mot de passe dans l’espace parent. Cookie Secure/HttpOnly/SameSite Strict, durée une heure, origine vérifiée sur les endpoints. Supabase vérifie effectivement le JWT via `/auth/v1/user`; ni localStorage, ni un ID envoyé par le navigateur n’autorisent un appel.
- `EDUC_OPENAI_API_KEY` : clé du projet autorisé, côté serveur seulement.
- `EDUC_VOICE_CONFIG` : JSON privé avec `paidEnabled`, `parentConsent`, `zeroDataRetentionVerified`, `endpointRetentionVerified`, `childDataEligibilityReviewed`, `dedicatedHosting` tous vrais après vérification; `otherCostsMicros` entier CA strictement positif représentant **tous** les coûts fixes mensuels prévus; `rates` et `pricing` ci-dessous.

Appliquer séparément `ops/supabase/001-parent-backups.sql` et `002-voice-budget.sql` après revue sur le projet dédié. Provisionner deux lignes de `famille_voice_profiles` pour le vrai parent : slots p1/p2, niveaux « 1re année » et « 3e année », objectif minimal. Les noms d’enfants ne sont pas nécessaires. L’interface de contexte existante est locale; le tuteur prend le niveau, l’objectif et les éventuelles cartes scolaires **du référentiel serveur**. Aucune synchronisation cachée. Un profil non provisionné ou une activité scolaire absente du référentiel est refusé. Les rôles anon/authenticated n’ont aucun accès au budget ni aux profils serveur; seul le runtime après vérification parent utilise service_role.

## Plafond durable

`002-voice-budget.sql` réserve et débite atomiquement en PostgreSQL, verrou par foyer, mois calculé **America/Toronto**, montant partagé p1/p2, limite fixe **40 000 000 microdollars CA (40 CA)** avec coûts fixes inclus. Chaque échange conserve le maximum entier même en cas d’erreur, interruption, redémarrage ou réponse ambiguë. Aucun remboursement automatique, expiration de réservation, retry fournisseur ou compteur mémoire de production. Cela réduit le nombre d’échanges disponibles mais empêche une sous-facturation. Six réservations par minute et par foyer. Un conflit, une erreur base, un prix/FX absent ou expiré refusent l’appel avant OpenAI.

Modèles fixés : `whisper-1`, `gpt-4.1-mini-2025-04-14`, `tts-1`. Ces deux derniers sont signalés deprecated dans la documentation actuelle : vérifier disponibilité et calendrier de retrait avant activation. Ils sont retenus ici pour la sortie texte bornée sans budget de raisonnement implicite et la facturation TTS par caractère; aucun basculement automatique vers un modèle au coût inconnu. Si indisponibles, refus honnête et nouvelle revue nécessaire.

Tarifs officiels consultés le 20 octobre 2026 : Whisper 0,006 USD/minute; GPT-4.1 mini 0,40 USD/M tokens entrée et 1,60 USD/M sortie; TTS-1 15 USD/M caractères. Ces prix ne sont pas une configuration de production. `rates` exige des entiers USD microdollars au moins égaux à ces valeurs : `sttMinuteMicros:6000`, `inputMillionMicros:400000`, `outputMillionMicros:1600000`, `ttsMillionCharsMicros:15000000`.

La borne réserve une minute entière STT (audio accepté ≤10 s), 16 000 tokens d’entrée (JSON UTF-8 ≤13 900 octets + marge de protocole), 128 tokens de sortie maximum et 800 caractères TTS facturables pour un texte tronqué à 400 unités UTF-16. Maximum 0,024605 USD avec les tarifs ci-dessus, même pour un échange texte. La génération texte et la synthèse sont limitées indépendamment du client; aucune synthèse d’un texte arbitraire envoyé directement par le client.

`pricing` requiert `fxPpm` (taux CA/USD maximal choisi), `bufferPpm` (marge positive incluant taxes/frais variables), `feeMicros` (frais CA par échange, strictement positif), `pricingReviewedAt`, `validUntil` (échéance réelle future). Calcul BigInt arrondi supérieur : USD maximal × FX × (1+marge) + frais. Ces montants doivent être validés par le parent; aucun taux réel n’est inventé. `otherCostsMicros` comprend hébergement, base, éventuels abonnements et autres frais. Si ces montants ne peuvent pas être garantis, garder la voix fermée. Les autres usages de la même clé/projet doivent être interdits ou budgétés séparément : le registre ne contrôle que ce serveur.

## Vérification

`npm test` exécute réellement chaque test (mocks uniquement); `npm run build` produit le public. Le test de bout en bout mock couvre capture PCM → runtime authentifié → réservation RPC → trois endpoints OpenAI → lecture, sans aucun appel réel. Isolation, taille/durée, annulation tardive, erreurs fournisseur, synthèse indisponible et refus d’activation sont testés.

`npm run test:rls` puis `npm run test:voice-db`, uniquement avec `FAMILLE_TEST_DATABASE_URL` vers PostgreSQL local jetable `/famille_test`, vérifient les permissions et 20 processus concurrents. Le workflow les exécute avant les jobs avec secrets. La concurrence SQL n’a pas pu être exécutée dans le sandbox de cette livraison (sockets refusées). `npm run test:browser` a également été tenté : Chromium n’a pas pu démarrer dans ce sandbox. Aucun Safari/iPad réel n’est revendiqué. Les anciennes preuves importées appartiennent à la base et ne constituent pas une validation de cette modification.

Sources officielles : [transcription](https://developers.openai.com/api/docs/guides/speech-to-text), [Whisper/prix](https://developers.openai.com/api/docs/models/whisper-1), [GPT-4.1 mini/prix/snapshot](https://developers.openai.com/api/docs/models/gpt-4.1-mini), [TTS-1/prix](https://developers.openai.com/api/docs/models/tts-1), [speech](https://developers.openai.com/api/docs/guides/text-to-speech), [mineurs](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance), [rétention](https://developers.openai.com/api/docs/guides/your-data).

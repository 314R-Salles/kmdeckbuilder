# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Le projet

Kmdeckbuilder est une application Angular 20 (site public + outils communautaires) pour un jeu de cartes (Krosmaga). Elle permet de rechercher des cartes, construire/consulter des decks, suivre les streams/vidéos, et gérer du contenu admin (news, tags, illustrations). Le backend est une API Java externe non présente dans ce repo.

## Commandes

- `npm start` — sert l'app en dev (`ng serve -o`, http://localhost:4200)
- `npm run share` — sert l'app accessible depuis le réseau local (`--host 192.168.1.26`)
- `npm run build` — build de prod (`ng build`, sortie dans `dist/kmdeckbuilder`)
- `npm run watch` — build en continu, config development
- `npm test` — tests unitaires via Karma/Jasmine (aucun fichier `*.spec.ts` n'existe actuellement dans le repo)
- `npm run serve:ssr:kmdeckbuilder` — lance le serveur Express SSR buildé (`server.ts`), utilisé seulement si le build inclut la cible `server`

Note : le SSR (`server`, `prerender`, `ssr.entry` dans `angular.json`) est actuellement commenté dans `angular.json`, alors que `server.ts` et le script `serve:ssr:*` existent toujours. L'app tourne donc en pratique en CSR pur pour le moment — vérifier `angular.json` avant de supposer que le SSR est actif.

## Architecture

### Authentification (Auth0 + lien Twitch optionnel)

- L'authentification principale se fait via **Auth0** (`angular-oauth2-oidc`, flow OIDC "code"), configurée dans `AppInitializerService.initApp()` (`src/app/app-initializer.service.ts`) avec `issuer: 'https://login.krosmaga.tools/'` (domaine custom du tenant Auth0).
- `AuthService.login()` (`src/app/auth.service.ts`) déclenche `oauthService.initLoginFlow()`.
- Le **login Twitch est facultatif** et sert uniquement à associer l'id du compte Twitch au compte Auth0 déjà existant : `environment.TWITCH_AUTH_URL` redirige vers Twitch, le token revient dans le hash de l'URL (`#access_token=...`), `AppInitializerService.extractToken()` l'extrait puis `AuthenticatedApiService.linkAccount(token)` fait l'association côté backend. Ce n'est pas un mécanisme de connexion alternatif.
- L'utilisateur courant est stocké dans `StoreService.user` (un `ReplaySubject`), initialisé à `null` puis rempli via `AuthenticatedApiService.getCurrentUser()` si un token Auth0 valide existe.
- `AuthGuard` et `AdminGuard` (`src/app/auth.guards.ts`) lisent `StoreService.getUser()`. Bug connu documenté dans le code : au refresh d'une route protégée, le guard peut s'exécuter avant que l'utilisateur soit chargé et rediriger à tort vers `/home` (commentaire "AuthGuard foireux").

### Niveaux d'API (public / connecté / admin)

Trois services HTTP distincts, un par niveau d'accès de l'API backend, chacun préfixant les routes avec le segment correspondant :

- `ApiService` (`src/app/api/api.service.ts`) → `JAVA_API + '/public'` — pas d'auth requise (cartes, decks en lecture, streams, news...). Certains endpoints (`getDecks`, `getDeck`) ajoutent quand même le header `Authorization` s'il y a un token valide, pour personnaliser la réponse sans l'exiger.
- `AuthenticatedApiService` (`src/app/api/authenticated-api.service.ts`) → `JAVA_API + '/authenticated'` — nécessite un utilisateur connecté (profil, favoris, sauvegarde de deck, lien Twitch).
- `AdminApiService` (`src/app/api/admin-api.service.ts`) → `JAVA_API + '/admin'` — réservé aux admins (gestion news, illustrations, tags). `AdminGuard` protège les routes correspondantes côté front, mais l'autorisation réelle doit être vérifiée côté backend.

Chaque service pose le header `Authorization: Bearer <token>` via `oauth.getAccessToken()`. Il n'y a pas d'intercepteur HTTP central pour ça : c'est fait à la main dans chaque service (`getAuthHeaders()`), donc tout nouvel endpoint doit suivre le même pattern selon son niveau d'accès.

### État applicatif

`StoreService` (`src/app/store.service.ts`) est le state store client central (pas de NgRx) :
- `user` / `getUser()` — utilisateur courant (`ReplaySubject`)
- `language` / `getLanguage()` — langue courante, synchronisée avec `localStorage` (`getStorageLanguage`/`setStorageLanguage`) et avec `TranslateService`
- `cardNames` / `cardIllustrations` — caches côté client indexés par langue, rechargés à la volée quand la langue change (voir le `//FIXME` dans `setLanguage` : le chargement des tags par langue n'est pas géré au même endroit)

### i18n

`@ngx-translate/core` + `@ngx-translate/http-loader`, fichiers de traduction dans `src/assets/public/i18n/{br,en,es,fr,ru}.json`. Langue par défaut au démarrage : `FR` (fallback Angular : `en`). Le changement de langue recharge aussi les noms de cartes pour cette langue (`StoreService.setLanguage`).

### Routing et structure des features

Défini dans `src/app/app.routes.ts`. Les features lourdes (`tag-management`, `deckbuilder`) sont chargées en lazy (`loadComponent`), le reste est en eager loading. Organisation par feature sous `src/app/` :
- `decklists/{search,create,view,common}` — recherche, construction, visualisation de decks
- `draft` — mode draft
- `admin/tag-management` — gestion des tags (admin)
- `base/` — composants/utilitaires partagés (dropdowns, pagination, `AbstractDropdownComponent` pour mutualiser le CSS/comportement des dropdowns)
- `stream-list`, `header`, `home`, `user-profile`, `popins` — sections transverses

Convention de nommage : composants Angular standalone, classes **sans** suffixe `Component` (`Header`, `Home`, `Deckbuilder`, `SearchDeck`...) et fichiers sans suffixe `.component` (`header.ts`, `header.html`, `header.scss`). Respecter cette convention pour tout nouveau composant.

### Change detection et config app

`app.config.ts` utilise `provideZonelessChangeDetection()` (pas de Zone.js pour la détection de changements) — privilégier signaux / `toSignal()` / `OnPush` implicite plutôt que du code qui suppose du dirty-checking classique. `provideHttpClient(withFetch())` est utilisé pour les appels HTTP.

### Responsive

Le site est censé être responsive sur toutes les pages, mais il n'y a pas encore de système de breakpoints/mixins centralisé (pas de fichier `_breakpoints.scss` ni de mixins partagés) — les styles sont actuellement gérés par composant (`*.scss` colocalisé) et dans le global `src/styles.scss`. En ajoutant du responsive, vérifier s'il existe déjà un pattern équivalent dans un composant voisin avant d'introduire une nouvelle approche.

### Thème / assets

Material est utilisé avec le thème `rose-red` (`@angular/material/prebuilt-themes/rose-red.css`, densité 50 via `@include mat.theme`). Les assets de cartes/illustrations sont dans `src/assets/public/` avec des variantes par langue (`card/{BR,EN,ES,FR,RU}`) et des versions `webp` dédiées (`card_webp/...`) pour l'optimisation — penser à fournir les deux formats en cas d'ajout d'assets du même type.

### Environnements

`src/environments/environment.ts` (prod) et `environment.development.ts` (dev, remplacé automatiquement par `fileReplacements` en config `development`). Contiennent l'URL de l'API Java, l'audience Auth0, et les paramètres Twitch (`TWITCH_AUTH_URL`, `TWITCH_PARENT`, `REDIRECT_URI`). Ne jamais commettre de secrets dedans au-delà de ce qui y est déjà (client IDs publics OAuth).

## Utilisation de l'IA

Ce projet est utilisé comme support d'apprentissage : l'objectif n'est pas seulement d'obtenir du code qui fonctionne, mais de comprendre pourquoi il est écrit ainsi, pour qu'une personne sans IA puisse reproduire le même résultat.

- **Clean Code et design patterns** : toute proposition de code (nouvelle fonctionnalité, refactoring, correction de bug) doit s'appuyer explicitement sur les principes de Clean Code (nommage explicite, fonctions courtes à responsabilité unique, éviter la duplication, séparation des préoccupations, principes SOLID) et sur les design patterns usuels quand ils s'appliquent (Strategy, Factory, Observer, Decorator, Adapter, etc. — via leurs équivalents idiomatiques Angular/TypeScript : services injectables, RxJS, composants standalone, signaux). Ne pas appliquer un pattern pour le plaisir de la forme : justifier le choix par le problème concret qu'il résout ici.
- **Pas de commentaires superflus dans le code** : le code doit rester lisible par lui-même (nommage, structure). Un commentaire n'est ajouté que si une contrainte non évidente (bug externe, comportement d'API, choix contre-intuitif) ne peut pas être exprimée par le code seul
- **Pédagogie à chaque réponse** : à chaque nouvelle question de l'utilisateur, inclure dans la réponse (hors code) un ou deux paragraphes détaillés expliquant les choix de Clean Code et/ou de design pattern faits dans cette réponse — suffisamment détaillés pour qu'une personne sans assistance IA puisse comprendre le raisonnement et arriver au même résultat par elle-même.
- **Refactoring et montées de version : privilégier l'outillage avant l'IA** : avant de proposer soi-même des modifications de refactoring ou de migration (montée de version Angular, TypeScript, RxJS, etc.), chercher s'il existe un outil automatisé permettant d'obtenir le même résultat sans IA (ex. `ng update` et ses schematics, OpenRewrite, codemods officiels du framework, `eslint --fix`, migrations automatiques documentées). Signaler cet outil à l'utilisateur et encourager son usage en premier lieu ; ne proposer une modification manuelle assistée par IA que si aucun outil adapté n'existe ou si l'outil ne couvre pas entièrement le cas.

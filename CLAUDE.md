# CLAUDE.md

This file provides guidance for working in this repository.

## Project overview

Angular 20 zoneless single-page app (with SSR/prerender scaffolding present but currently disabled) for a deckbuilder tool for a card game. All components are standalone (no NgModules). UI is built on Angular Material, rich text editing uses Quill, and the app authenticates users via Auth0.

## Commands

- `npm start` — dev server (`ng serve -o`)
- `npm run build` — production build (`ng build`; production is the default configuration)
- `npm run watch` — development build in watch mode
- `npm test` — Karma/Jasmine test runner. **No `.spec.ts` files currently exist in the repo** — don't assume there is existing test coverage to run against.
- `npm run serve:ssr:kmdeckbuilder` — run the built SSR server (`node dist/kmdeckbuilder/server/server.mjs`). Note: SSR/prerender build targets are currently commented out in `angular.json`, so this isn't part of the standard build pipeline yet.

There is no lint script, no ESLint config, and no Prettier config in this repo. Don't invent one or assume `npm run lint` exists. The only enforced style comes from `.editorconfig`: 2-space indentation, single-quote strings in `.ts` files, final newline.

## Tech stack

- Angular 20.1, esbuild-based `@angular/build:application` builder, TypeScript 5.8
- Zoneless change detection (`provideZonelessChangeDetection()` in `src/app/app.config.ts`) — zone.js is only present for Karma tests, not in the app itself
- Angular Material + CDK for UI
- `angular-oauth2-oidc` for auth, with **Auth0** as the OIDC issuer — configured and kicked off in `src/app/app-initializer.service.ts` (`oauthService.configure({issuer: 'https://login.krosmaga.tools/', ...})` followed by `loadDiscoveryDocumentAndTryLogin()`)
- `@ngx-translate/core` + `@ngx-translate/http-loader` for i18n
- `ngx-quill` / `quill` for rich text editing
- `gsap` for animation
- Express for the SSR server entry point
- No NgRx/Redux/Akita — shared state is plain RxJS (`ReplaySubject`-backed services) plus Angular `signal()` for local component state

### Auth is not Twitch

Don't conflate the two: app authentication is Auth0 via `angular-oauth2-oidc`, wired up in `app-initializer.service.ts`. Twitch is unrelated — it's only used to link a user's Twitch account id (`extractToken()` reads an `access_token` out of the URL hash and calls `authenticatedApiService.linkAccount(token)`), and separately to embed the Twitch player for streams/VODs.

## Directory structure

Under `src/app/` (feature-folder layout, one folder per component with `.ts`/`.html`/`.scss`, standalone `imports: [...]`, no NgModules):

- Root: `app.config.ts` (providers), `app.routes.ts` (flat `Routes` array, standalone `loadComponent()` for lazy routes, `withComponentInputBinding()` so route params bind straight to component inputs), `app-initializer.service.ts` (startup: language, Auth0 config, session restore), `store.service.ts` (app-wide store: user, language, card names/illustrations, news), `auth.service.ts` + `auth.guards.ts`, `screen.ts`
- `api/` — `api.service.ts` (public endpoints), `authenticated-api.service.ts` / `admin-api.service.ts` (Bearer-token calls via `OAuthService`)
- `base/` — shared building blocks: `AbstractDropdownComponent` / `AbstractSwipeComponent` base classes, `constants.ts`, `models/`, `section/` (generic page-section wrapper used almost everywhere), `pagination/`, `language-dropdown/`
- `decklists/` — main domain: `common/` (shared models/synthesis), `create/` (deckbuilder), `search/`, `view/`
- `draft/` — draft-mode feature
- `admin/tag-management/`, `header/`, `home/`, `stream-list/`, `user-profile/`, `popins/` (modals)

## Environments

`src/environments/environment.ts` (prod) and `environment.development.ts` (dev), swapped via `fileReplacements` in `angular.json`. Keys:
- `JAVA_API` — backend API base URL
- `AUDIENCE`, `REDIRECT_URI` — used by the Auth0 OAuth config in `app-initializer.service.ts`
- `TWITCH_AUTH_URL` — separate Twitch implicit-flow OAuth URL, only used to obtain a Twitch access token for account linking (see above), not for app login
- `TWITCH_PARENT` — parent domain for the embedded Twitch player

## i18n

Translation JSON files live in `src/assets/public/i18n/{br,en,es,fr,ru}.json`, keyed by feature area (`login`, `deckbuilder`, `searchDeck`, `viewDeck`, etc). Language switching goes through `StoreService.setLanguage()` and is persisted in `localStorage`. Card names and illustrations are localized separately from UI strings — see `cardNames` in `store.service.ts` and the per-language asset folders under `src/assets/public/card/<LANG>/`.

## Conventions

- Standalone components only — do not introduce NgModules
- `tsconfig.json` has `strict: false` but several strict flags are individually enabled (`strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`) — keep these on, don't loosen them
- No path aliases are configured — use relative imports
- No test files exist yet. If asked to add tests, Karma/Jasmine is already configured (`tsconfig.spec.json`, `ng test`) — no new test framework setup is needed

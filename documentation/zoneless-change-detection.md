# État réactif avec `provideZonelessChangeDetection()`

Fichiers concernés : `src/app/app.config.ts` (activation) ;
`src/app/user-profile/user-profile.ts` (cas concret corrigé).

## Contexte

L'app active `provideZonelessChangeDetection()` dans `app.config.ts` (cf.
section "Change detection et config app" de `CLAUDE.md`) : il n'y a pas de
Zone.js pour intercepter les callbacks async (event DOM, `setTimeout`,
callback RxJS, réponse HTTP...) et déclencher automatiquement un nouveau
cycle de détection de changement.

Sans Zone.js, Angular ne redétecte les changements que sur des
déclencheurs **explicites** :
- l'écriture d'un `signal` lu dans un template (ou dans un `computed`/
  `effect` qui en dépend) ;
- l'émission du pipe `async` (il appelle `markForCheck()` en interne, donc
  `toSignal(...)` en profite aussi) ;
- l'exécution d'un event listener lié dans le template (`(click)`,
  `(submit)`...) : Angular planifie un cycle de CD juste après ;
- un appel manuel à `ChangeDetectorRef.markForCheck()`.

Tout le reste — en particulier muter un champ de classe brut (`boolean`,
`string`, objet...) depuis un callback **asynchrone** qui n'est pas lui-même
un de ces déclencheurs — ne notifie rien au framework. La donnée change bien
en mémoire, mais la vue ne se remet pas à jour tant qu'un déclencheur externe
ne force pas un cycle de CD ailleurs sur la page (ce qui rend le bug
intermittent et donc trompeur : ça "marche" parfois par coïncidence).

## Fonctionnement général

Règle à appliquer systématiquement dans ce projet : **tout état mutable lu
dans un template, dont la mise à jour provient d'une source asynchrone
externe au flux du template, doit être un `signal`** (ou exposé via
`toSignal`/le pipe `async`), jamais un simple champ de classe.

Sources asynchrones concernées, à surveiller en review :
- `.subscribe(...)` sur un `Observable` RxJS (HTTP, WebSocket...) — sauf si
  consommé via `toSignal()` ou le pipe `async` dans le template ;
- `setTimeout` / `setInterval` ;
- `Promise.then(...)` ;
- callbacks de librairies tierces non intégrées au scheduler d'Angular
  (SDK externe, `postMessage`, etc.).

Pattern de correction :
```ts
// ❌ champ brut : la vue ne se met pas à jour de façon fiable
takenUsername: boolean = false;
...
error: _ => this.takenUsername = true

// ✅ signal : l'écriture notifie le template qui le lit
takenUsername = signal(false);
...
error: _ => this.takenUsername.set(true)
```
Côté template, un signal se lit comme une fonction : `@if (takenUsername())`
au lieu de `@if (takenUsername)`.

## Où c'est utilisé actuellement

- **`user-profile.ts`** : `takenUsername` est un `signal<boolean>`, écrit
  via `.set(...)` dans les callbacks `next`/`error` de
  `authenticatedApiService.updateUser(...).subscribe(...)`, et lu comme
  `takenUsername()` dans `user-profile.html` pour afficher le message
  "pseudo déjà pris". Avant correction, c'était un champ `boolean` muté
  directement dans le callback `error`, donc pas garanti d'être reflété à
  l'écran après une soumission de formulaire ratée.
- Les autres états async du même composant (`connectedUserDecks`,
  `favorites`, `routeUser`, `routeUserdecks`, `connectedUser`) suivent déjà
  ce pattern via `toSignal(...)` sur des `Observable` — `takenUsername`
  était l'exception qui restait en champ brut car assigné dans un
  `.subscribe()` "manuel" plutôt que consommé par `toSignal`.

## Pièges déjà rencontrés

### Un champ brut muté dans un `.subscribe()` semble parfois fonctionner

Si un autre déclencheur de CD survient juste après (ex. l'utilisateur
clique ailleurs, ou un autre signal du même composant change au même
moment), la vue peut sembler à jour par coïncidence. Ça masque le bug en
dev/tests manuels rapides et le fait ressurgir de façon aléatoire en usage
réel — ne pas se fier à "ça a marché à l'instant" comme validation dans ce
contexte.

### `toSignal` n'est utile que si la source est un `Observable`

Pour un état écrit ponctuellement depuis un callback (pas une source
`Observable` continue), c'est `signal(...)` + `.set(...)`/`.update(...)`
qu'il faut utiliser, pas `toSignal`. `toSignal` s'applique quand on a déjà
un flux RxJS à adapter (cf. `connectedUserDecks`, `favorites` dans
`user-profile.ts`, ou le pattern documenté dans
`breakpoint-observer-pattern.md`).

## Limites connues / pistes non traitées

- Pas de règle ESLint dans ce repo pour détecter automatiquement un champ de
  classe brut muté dans un callback asynchrone (`subscribe`, `then`,
  `setTimeout`...) — la vérification reste manuelle en review de code.
- Pas d'audit systématique des composants existants pour repérer d'autres
  champs bruts du même genre ; à traiter au cas par cas quand un bug de
  rafraîchissement de vue est signalé.

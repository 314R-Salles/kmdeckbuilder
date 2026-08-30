# Détection responsive en TypeScript via `BreakpointObserver` (CDK)

Fichiers concernés : `src/app/base/pagination/pagination.ts`,
`src/app/decklists/view/view-deck/view-deck.ts` (usages actuels) ;
`src/app/header/header.scss` (définition historique du seuil "mobile").

## Contexte

Le site n'a pas de zoning classique (`provideZonelessChangeDetection()`, cf.
`CLAUDE.md`) : un simple `window.innerWidth` lu dans le `.ts` ne redéclenche
rien tout seul au resize, il n'y a pas de Zone.js pour intercepter l'event et
relancer la détection de changement. Dès qu'un comportement (pas juste du
style) doit changer selon la largeur d'écran — nombre de pages affichées dans
la pagination, taille imposée à un composant vidéo tiers, etc. — il faut donc
une source **réactive** de cette information, exploitable comme un signal.

`BreakpointObserver` (`@angular/cdk/layout`) fournit ça : il observe une
media query via `matchMedia` et n'émet que lorsque l'état de correspondance
change (pas à chaque pixel de resize), ce qui est directement branchable sur
`toSignal`.

## Fonctionnement général

1. Définir la media query dans une constante, avec le même seuil que
   `$mobile-breakpoint` dans `header.scss` (768px), pour que la notion de
   "mobile" reste cohérente entre le CSS pur et la logique TypeScript :
   ```ts
   const MOBILE_BREAKPOINT = '(max-width: 768px)';
   ```
2. Injecter `BreakpointObserver` :
   ```ts
   breakpointObserver = inject(BreakpointObserver);
   ```
3. Exposer l'état sous forme de signal :
   ```ts
   isMobile = toSignal(
     this.breakpointObserver.observe(MOBILE_BREAKPOINT).pipe(map(state => state.matches)),
     {initialValue: this.breakpointObserver.isMatched(MOBILE_BREAKPOINT)}
   )
   ```
   - `observe(...)` retourne un `Observable<BreakpointState>` qui n'émet
     qu'aux franchissements du seuil.
   - `initialValue` est calculé de façon **synchrone** via `isMatched(...)`
     (plutôt que laissé vide ou à `false`) pour que le signal ait la bonne
     valeur dès le tout premier rendu, avant même la première émission de
     l'Observable — sans ça, on aurait un flash "desktop" au chargement sur
     mobile le temps que l'Observable émette.
4. Dériver le comportement voulu via un `computed()` qui lit `isMobile()`,
   plutôt que de tester `isMobile()` directement un peu partout dans le
   composant.

## Où c'est utilisé actuellement

- **`pagination.ts`** : `isMobile()` pilote `edgeCount`/`radius` passés à
  `buildPagination` (moins de numéros de page affichés sur petit écran).
- **`view-deck.ts`** : `isMobile()` pilote `youtubePlayerWidth`/
  `youtubePlayerHeight`, passés en `@Input()` à `<youtube-player>`.

## Pièges déjà rencontrés

### Le CSS seul ne suffit pas quand le composant tiers gère sa taille en JS

Première tentative sur `view-deck` pour réduire le lecteur YouTube sous
768px : une media query SCSS forçant `width`/`height` en `!important` sur
l'hôte `youtube-player`. Ça ne fonctionnait pas, malgré le `!important`.

Raison : `youtube-player` (`@angular/youtube-player`) charge l'API JS
YouTube (`YT.Player`), qui crée elle-même son `<iframe>` et lui applique sa
propre taille via `player.setSize(width, height)` en JavaScript, à chaque
changement des inputs `width`/`height` du composant (`ngOnChanges` →
`_setSize()`). Ce sizing géré en JS écrase toute règle CSS externe, y
compris en `!important`.

Solution retenue : piloter la taille via les `@Input() width`/`height` du
composant lui-même, dérivés du signal `isMobile()` :
```ts
youtubePlayerWidth = computed(() => this.isMobile() ? 300 : undefined)
youtubePlayerHeight = computed(() => this.isMobile() ? 183 : undefined)
```
(`undefined` fait retomber le composant sur sa taille par défaut, 640x390 —
voir son setter : `width == null ? DEFAULT_PLAYER_WIDTH : width`.)

Règle générale à retenir : pour un composant tiers qui gère sa propre taille
(ou plus généralement son propre style) de façon impérative en JS plutôt que
par des classes CSS, une media query ne peut pas le contrôler — il faut
passer par ses `@Input()`, pilotés par un signal réactif comme
`BreakpointObserver`.

### Le seuil 768px est dupliqué, pas centralisé

Il n'existe pas (encore) de fichier de breakpoints partagé (cf. section
"Responsive" de `CLAUDE.md`). Le seuil 768px est donc répété : variable SCSS
`$mobile-breakpoint` (`header.scss`), constante `MOBILE_BREAKPOINT`
(`pagination.ts` et `view-deck.ts`), et des commentaires "aligné sur
`$mobile-breakpoint`" dans `language-dropdown.scss` / `view-list.scss`. Toute
évolution de ce seuil doit être répercutée manuellement partout — penser à
chercher `mobile-breakpoint`/`MOBILE_BREAKPOINT` avant de le changer.

## Limites connues / pistes non traitées

- Pas de service partagé (`ResponsiveService` ou équivalent) exposant un
  `isMobile()` unique pour toute l'app : chaque composant qui en a besoin
  réinjecte `BreakpointObserver` et redéfinit sa propre constante de seuil.
  Si un 4e composant a besoin de cette info, ça vaut le coup d'extraire un
  service (`injectable`, signal exposé) pour arrêter la duplication ci-dessus
  plutôt que de recopier le pattern une fois de plus.

# Restauration du scroll au retour sur `search-deck`

Fichiers concernés : `src/app/decklists/search/search-deck/search-deck.ts`.

## Contexte

`search-deck` liste des decks chargés via une requête HTTP asynchrone
(`apiService.getDecks(...)`). Quand on quitte la page (ouvrir un deck) puis
qu'on y revient (bouton précédent), Angular Router (`scrollPositionRestoration:
'enabled'` dans `app.config.ts`) sait qu'une position de scroll était
mémorisée pour cette entrée d'historique et émet un event `Scroll` avec
`event.position`. Deux problèmes rendaient la restauration inopérante :

1. **Ordre des events** : l'event `Scroll` peut arriver avant que la réponse
   HTTP des decks ne soit revenue. La page est alors trop courte (liste
   vide/précédente), donc scroller vers la position mémorisée n'a aucun sens
   à cet instant.
2. **Application à chaque recherche** : si la position mémorisée était gardée
   telle quelle et réappliquée à chaque appel de `search()` (changement de
   filtre, pagination...), l'utilisateur se retrouvait re-scrollé vers cette
   position à chaque nouvelle recherche, pas seulement au retour sur la page.

## Fonctionnement général

1. Garder la position en attente dans une **propriété de classe brute**, pas
   un signal :
   ```ts
   private pendingScrollPosition: [number, number] | null = null;
   ```
   Un signal lu par le même `effect()` qui écoute les filtres (cf. la section
   "Un seul point d'écoute pour tous les filtres" dans le constructeur)
   redéclencherait cet effect à chaque changement — y compris un `.set(null)`
   fait pour "nettoyer" après usage — ce qui relance une recherche complète
   avec reset de `currentPage`. Une propriété brute n'est observée par rien,
   donc la mettre à jour ne déclenche jamais cet effect.

2. Écouter les events `Scroll` du Router indépendamment de l'effect des
   filtres, et stocker la position dès qu'elle arrive :
   ```ts
   this.subscriptions.push(
     this.router.events.pipe(
       filter((event): event is Scroll => event instanceof Scroll),
       filter(event => !!event.position),
     ).subscribe(event => {
       this.pendingScrollPosition = event.position;
       this.tryRestoreScroll();
     })
   );
   ```

3. Tenter la restauration à deux points d'entrée indépendants — l'event
   `Scroll` (ci-dessus) et la fin de chaque `search()` — puisqu'on ne sait pas
   lequel des deux arrivera en dernier :
   ```ts
   this.apiService.getDecks(request).subscribe(searchResults => {
     this.decks.set(searchResults.content);
     this.tryRestoreScroll();
     ...
   })
   ```

4. Centraliser la condition et l'unicité de l'application dans une seule
   méthode. Elle ne scrolle que si une position est en attente **et** que les
   decks sont chargés, et remet `pendingScrollPosition` à `null` juste avant
   de scroller — ce champ sert donc à la fois de valeur à appliquer et de
   marqueur "déjà fait", sans variable booléenne séparée :
   ```ts
   private tryRestoreScroll() {
     if (!this.pendingScrollPosition || !this.decks()) {
       return;
     }
     const position = this.pendingScrollPosition;
     this.pendingScrollPosition = null;
     afterNextRender(() => {
       this.viewportScroller.scrollToPosition(position);
     }, {injector: this.injector});
   }
   ```

5. Différer l'appel réel à `scrollToPosition` avec `afterNextRender()` (voir
   piège ci-dessous), en passant l'`Injector` du composant (`inject(Injector)`)
   puisque `tryRestoreScroll()` n'est pas appelée depuis un contexte
   d'injection direct (callback RxJS).

## Où c'est utilisé actuellement

- **`search-deck.ts`** uniquement, pour restaurer le scroll de la liste de
  decks au retour depuis une page de détail (`view-deck`) ou tout autre
  navigation arrière vers `search-deck`.

## Pièges déjà rencontrés

### Un signal partagé avec un autre `effect()` redéclenche ce dernier

Avant correction, la position de scroll était exposée via
`toSignal(router.events.pipe(...))` et lue **dans le même `effect()`** que les
signaux de filtres (`selectedGods`, `sortFilter`...). Résultat : dès que le
Router émettait un event `Scroll` tardif (après le premier rendu), cet effect
se redéclenchait comme s'il s'agissait d'un changement de filtre, remettant
`currentPage` à `0` et relançant une recherche complète — écrasant la page
restaurée depuis `sessionStorage` par `reloadFilters()`. Un signal issu de
`toSignal()` est en plus **en lecture seule** : il n'existe aucune API pour le
"vider" après usage, contrairement à une propriété brute qu'on peut
simplement réassigner.

### `scrollToPosition` "s'exécute" mais ne bouge rien à l'écran

Même en appelant `viewportScroller.scrollToPosition([0, 800])` juste après
`this.decks.set(...)`, l'écran restait en haut malgré une valeur correcte en
debug. Cause : l'app tourne en `provideZonelessChangeDetection()` (cf.
`zoneless-change-detection.md`) — écrire un `signal` ne peint pas le DOM de
façon synchrone, le rendu est planifié pour plus tard. Au moment de l'appel,
le DOM affichait encore l'état précédent (page trop courte), donc le
navigateur clampait le scroll demandé à la hauteur alors disponible, proche de
zéro. Une fois les decks effectivement peints juste après, la page grandit
mais le scroll n'est pas réajusté rétroactivement.

Solution : envelopper l'appel dans `afterNextRender()`, l'API Angular conçue
pour exécuter du code **après** qu'Angular ait fini de peindre le DOM suite au
rendu en cours — donc une fois que la page a sa hauteur finale.

## Limites connues / pistes non traitées

- La restauration ne fonctionne qu'au niveau de la fenêtre
  (`ViewportScroller` scrolle `window`/`document`). Si un conteneur scrollable
  interne était introduit un jour dans cette page, ce mécanisme ne le
  couvrirait pas tel quel.
- Le double point d'entrée (`Scroll` event + fin de `search()`) suppose que
  `search()` est systématiquement appelée après l'arrivée de la page (via
  `ngOnInit`), ce qui est le cas actuellement mais reste une dépendance
  implicite entre les deux méthodes.

# Connaître l'URL précédente : `NavigationHistoryService`

Fichiers concernés : `src/app/navigation-history.service.ts`, `src/app/app.ts`,
`src/app/decklists/view/view-deck/view-deck.ts`.

## Contexte

`ViewDeck.navigateBack()` doit adapter son comportement selon la page de
provenance : si l'utilisateur arrive sur la vue d'un deck depuis le
formulaire de création (`/decks/create`) ou d'édition (`/decks/edit/...`) —
par exemple après avoir cliqué sur "Enregistrer" — le bouton "retour" ne doit
**pas** le renvoyer sur ce formulaire, mais sur `/decks/browse`.

Angular Router ne garde nativement la trace d'aucun historique de
navigation : `Location.back()` remonte dans l'historique du **navigateur**
(comme le bouton précédent du navigateur), mais rien n'expose "quelle était
la route précédente dans l'app". Il faut donc suivre soi-même les
`NavigationEnd` pour reconstituer cette information.

## Fonctionnement général

`NavigationHistoryService` (`providedIn: 'root'`, singleton) s'abonne à
`router.events`, filtre les `NavigationEnd`, et avant de mettre à jour l'URL
courante, bascule l'ancienne valeur dans un signal `previousUrl` :

```ts
@Injectable({providedIn: 'root'})
export class NavigationHistoryService {
  private router = inject(Router);
  private currentUrl = this.router.url;
  private _previousUrl = signal<string | null>(null);

  previousUrl = this._previousUrl.asReadonly();

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(),
    ).subscribe(event => {
      this._previousUrl.set(this.currentUrl);
      this.currentUrl = event.urlAfterRedirects;
    });
  }
}
```

`previousUrl()` vaut `null` tant qu'une seule navigation a eu lieu depuis le
chargement de l'app (rien à comparer) — cas correctement traité par
`navigateBack()` puisqu'il ne matche alors ni `/decks/create` ni
`/decks/edit`.

## `providedIn: 'root'` ne rend pas le service actif tout seul

Point à ne pas confondre : `providedIn: 'root'` enregistre la classe auprès
de l'injecteur racine (un singleton *disponible* partout), mais Angular
instancie les services **paresseusement** — le constructeur ne s'exécute que
lorsqu'un composant l'injecte pour la première fois. Sans intervention
supplémentaire, l'abonnement à `router.events` ne démarrerait qu'au moment où
`ViewDeck` (premier consommateur) serait créé, c'est-à-dire après une ou
plusieurs navigations déjà passées inaperçues.

Solution : injecter le service dans `App`, le tout premier composant créé au
bootstrap, uniquement pour forcer son instanciation immédiate (le service
n'est jamais utilisé directement depuis `App`) :

```ts
export class App {
  private seo = inject(SeoService);
  private navigationHistory = inject(NavigationHistoryService);
}
```

C'est exactement le même besoin — et le même pattern — que `SeoService`
(voir `documentation/seo.md`), déjà injecté dans `App` pour la même raison.
Alternative possible mais plus lourde ici : un `APP_INITIALIZER` explicite ;
l'injection dans le composant racine suffit puisque `App` vit pendant toute
la durée de vie de l'application (pas de risque de désinscription
prématurée liée à un cycle de vie plus court).

## Usage dans `ViewDeck.navigateBack()`

```ts
navigateBack(): void {
  const cameFromDeckForm = /^\/decks\/(create|edit)(\/|$|\?)/.test(this.navigationHistory.previousUrl() ?? '');
  const cameFromWithinApp = (this.location.getState() as { navigationId?: number })?.navigationId > 1;
  if (cameFromDeckForm || !cameFromWithinApp) {
    this.router.navigate(['/decks/browse']);
  } else {
    this.location.back();
  }
}
```

`cameFromDeckForm` court-circuite le remontage d'historique existant
(`Location.back()` / vérification `navigationId`) : peu importe qu'on soit
arrivé "depuis l'app" ou non, revenir sur le formulaire de création/édition
n'a jamais de sens depuis la vue d'un deck.

## Limites connues / pistes non traitées

- Le service ne garde qu'une **seule** valeur (l'URL immédiatement
  précédente), pas une pile complète : suffisant pour le besoin actuel, mais
  insuffisant si un jour il faut remonter plusieurs niveaux ou lister tout le
  parcours de navigation.
- Un rechargement complet de page (F5, lien direct, ouverture dans un nouvel
  onglet) réinitialise le service : `previousUrl()` reste `null` jusqu'à la
  prochaine navigation interne. C'est le comportement voulu ici (pas de
  formulaire de provenance à éviter dans ce cas), mais à garder en tête si le
  service sert un jour à autre chose.

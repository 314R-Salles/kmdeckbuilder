import {inject, Injectable, signal} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

// Le Router ne garde pas la trace des URLs visitées : ce service comble ce manque pour les vues
// qui doivent adapter leur navigation "retour" selon la page de provenance (ex: ViewDeck.navigateBack).
// Injecté dans App pour être instancié dès le démarrage et ne manquer aucune navigation.
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

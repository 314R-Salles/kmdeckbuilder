import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ApiService} from '../../api/api.service';
import {AuthenticatedApiService} from '../../api/authenticated-api.service';
import {StoreService} from '../../store.service';
import {Section} from '../../base/section/section';
import {DeckPreview} from '../../decklists/search/deck-preview/deck-preview';
import {TranslatePipe} from '@ngx-translate/core';
import {RouterLink} from '@angular/router';
import {combineLatest, debounceTime} from 'rxjs';
import {OrderBy, SearchBy} from '../../decklists/common/models/enums';

const LATEST_DECKS_PAGE_SIZE = 4;

@Component({
  selector: 'app-latest-decks',
  imports: [
    Section,
    DeckPreview,
    TranslatePipe,
    RouterLink
  ],
  templateUrl: './latest-decks.html',
  styleUrl: './latest-decks.scss'
})
export class LatestDecks implements OnInit, OnDestroy {

  apiService = inject(ApiService);
  authenticatedApiService = inject(AuthenticatedApiService);
  storeService = inject(StoreService);

  decks = signal<any[]>([]);
  isLoggedIn = signal(false);

  subscriptions = [];

  ngOnInit() {
    this.subscriptions.push(combineLatest([
      this.storeService.getUser(),
      this.storeService.getLanguage()
    ]).pipe(debounceTime(50))
      .subscribe(([user, language]) => {
        this.isLoggedIn.set(!!(user && user.lastLogin));
        this.loadLatestDecks(language);
      }))
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  loadLatestDecks(language: string) {
    const request = {
      language,
      searchBy: SearchBy.RECENT,
      orderBy: OrderBy.DESC,
      page: 0,
      pageSize: LATEST_DECKS_PAGE_SIZE,
    };
    this.apiService.getDecks(request).subscribe(searchResults => {
      this.decks.set(searchResults.content);
    })
  }

  // update à la main du liked/count pour pas faire un refresh complet de la recherche, même logique que search-deck.ts
  toggleFavorite(deck) {
    if (!this.isLoggedIn() || deck.owned) {
      return;
    }
    const request$ = deck.liked
      ? this.authenticatedApiService.removeFromFavorites(deck.deckId)
      : this.authenticatedApiService.addToFavorites(deck.deckId);

    request$.subscribe(() => {
      this.decks.update(values => {
        const toBeUpdated = values.find(d => d.deckId === deck.deckId);
        toBeUpdated.favoriteCount += toBeUpdated.liked ? -1 : 1;
        toBeUpdated.liked = !toBeUpdated.liked;
        return [...values];
      });
    })
  }

}

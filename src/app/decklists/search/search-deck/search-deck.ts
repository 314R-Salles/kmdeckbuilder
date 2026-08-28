import {Component, effect, inject, OnDestroy, OnInit, signal, untracked} from '@angular/core';
import {ApiService} from '../../../api/api.service';
import {AuthenticatedApiService} from '../../../api/authenticated-api.service';
import {StoreService} from '../../../store.service';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {combineLatest, debounceTime, distinctUntilChanged, Subject, switchMap} from 'rxjs';
import {Pagination} from '../../../base/pagination/pagination';
import {Section} from '../../../base/section/section';
import {RouterLink} from '@angular/router';
import {DeckPreview} from '../deck-preview/deck-preview';
import {toSignal} from "@angular/core/rxjs-interop";
import {TranslatePipe} from "@ngx-translate/core";
import {OrderBy, SearchBy} from "../../common/models/enums";
import {SearchDeckFilters} from '../search-deck-filters/search-deck-filters';

@Component({
  selector: 'app-search-deck',
  imports: [
    Pagination,
    ReactiveFormsModule,
    Section,
    RouterLink,
    DeckPreview,
    TranslatePipe,
    SearchDeckFilters
  ],
  templateUrl: './search-deck.html',
  styleUrl: './search-deck.scss'
})
export class SearchDeck implements OnInit, OnDestroy {
  apiService = inject(ApiService)
  authenticatedApiService = inject(AuthenticatedApiService)
  storeService = inject(StoreService)

  currentLanguage = toSignal(this.storeService.getLanguage())

  isLoggedIn

  currentPage = 0;
  pageSize = 20

  searchResults: {
    pageNumber: number,
    empty: boolean,
    first: boolean
    last: boolean,
    totalElements: number,
    totalPages: number
  }

  decks = signal<any>(null)
  favoritesOnly = signal(false)
  sortFilter = signal<SearchBy>(SearchBy.RECENT)
  sortOrder = signal<OrderBy>(OrderBy.DESC)
  selectedCards = signal<any>([])
  selectedUsers = signal<any>([])
  selectedNegativeUsers = signal<any>([])
  selectedGods = signal<any>([])
  selectedTags = signal<any>([])
  selectedNegativeTags = signal<any>([])

  allUsers = signal<any>([])

  filtersOpen = signal(false)

  allTags = toSignal(
    this.storeService.getLanguage().pipe(
      switchMap((language) => {
        return this.apiService.getTagsByLanguage(language)
      })))


  searchForm = new FormGroup({
    content: new FormControl(''),
  })

  subscriptions = []

  // point d'entrée commun pour déclencher une recherche, debounced plus bas
  private searchTrigger = new Subject<void>();

  constructor() {
    // Le backdrop mobile est en position:fixed sans zone scrollable propre : sans ce verrou,
    // un scroll (molette/tactile) au-dessus de lui remonte jusqu'au body et fait défiler les decks en dessous.
    effect(() => {
      document.body.classList.toggle('no-scroll', this.filtersOpen())
    });

    // Un seul point d'écoute pour tous les filtres : chaque setter n'a plus qu'à modifier son
    // signal, la recherche se relance automatiquement au lieu d'être appelée à la main partout.
    let isFirstRun = true;
    effect(() => {
      this.selectedGods();
      this.selectedCards();
      this.selectedTags();
      this.selectedNegativeTags();
      this.selectedUsers();
      this.selectedNegativeUsers();
      this.favoritesOnly();
      this.sortFilter();
      this.sortOrder();

      if (isFirstRun) {
        // les effects se déclenchent une première fois à l'init (trop tot)
        isFirstRun = false;
        return;
      }

      // untracked : search() lit d'autres signaux (currentLanguage...) qui ne doivent pas devenir
      // des dépendances de cet effet, sous peine de doubler les appels avec le combineLatest user/langue.
      untracked(() => {
        this.currentPage = 0;
        this.searchTrigger.next();
      });
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    document.body.classList.remove('no-scroll')
  }

  ngOnInit() {
    this.apiService.getDeckOwners().subscribe(owners => {
      this.allUsers.set(owners);
    })

    this.subscriptions.push(combineLatest([
      this.storeService.getUser(),
      this.storeService.getLanguage()
    ]).pipe(
      // peut eviter un appel sur  avec user null puis un appel sur user valorisé
      debounceTime(50))
      .subscribe(([user, _]) => {
        this.isLoggedIn = user?.lastLogin
        this.search();
      }))

    this.reloadFilters();

    this.subscriptions.push(
      this.searchForm.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(_ => this.searchTrigger.next())
    )

    this.subscriptions.push(
      this.searchTrigger.pipe(debounceTime(50)).subscribe(() => this.search())
    )
  }

  resetFilters() {
    this.selectedGods.set([])
    this.favoritesOnly.set(false);
    this.selectedCards.set([]);
    this.selectedTags.set([]);
    this.selectedNegativeTags.set([]);
    this.selectedUsers.set([]);
    this.selectedNegativeUsers.set([]);
    this.sortFilter.set(SearchBy.RECENT)
    this.sortOrder.set(OrderBy.DESC)
    this.searchForm.reset()
  }

  search() {
    this.saveFilters();

    const request = {
      gods: this.selectedGods().length ? this.selectedGods().map(g => g.id) : null,
      cards: this.selectedCards().length ? this.selectedCards().map(c => c.id) : null,
      tags: this.selectedTags().length ? this.selectedTags().map(c => c.id) : null,
      negativeTags: this.selectedNegativeTags().length ? this.selectedNegativeTags().map(c => c.id) : null,
      users: this.selectedUsers().length ? this.selectedUsers().map(u => u.username) : null,
      negativeUsers: this.selectedNegativeUsers().length ? this.selectedNegativeUsers().map(u => u.username) : null,
      content: this.searchForm.get('content').value,
      favoritesOnly: this.favoritesOnly(),
      language: this.currentLanguage(),
      searchBy: this.sortFilter(),
      orderBy: this.sortOrder(),
      page: this.currentPage,
      pageSize: this.pageSize,
    };

    this.apiService.getDecks(request).subscribe(searchResults => {
      this.decks.set(searchResults.content);
      this.searchResults = {
        pageNumber: searchResults.pageable.pageNumber,
        empty: searchResults.empty,
        first: searchResults.first,
        last: searchResults.last,
        totalElements: searchResults.totalElements,
        totalPages: searchResults.totalPages
      }
    })
  }


  selectCard(card) {
    this.selectedCards.update(values => {
      return [...values, card];
    });
  }

  removeCard(card) {
    this.selectedCards.update(values => {
      const index = values.findIndex(u => u.id === card.id)
      values.splice(index, 1)
      return [...values];
    });
  }

  selectUser(user) {
    this.selectedUsers.update(values => {
      return [...values, user];
    });
  }

  selectNegativeUser(user) {
    this.selectedNegativeUsers.update(values => {
      return [...values, user];
    });
  }


  removeUser(user) {
    this.selectedUsers.update(values => {
      const index = values.findIndex(u => u.username === user.username)
      values.splice(index, 1)
      return [...values];
    });
  }

  removeNegativeUser(user) {
    this.selectedNegativeUsers.update(values => {
      const index = values.findIndex(u => u.username === user.username)
      values.splice(index, 1)
      return [...values];
    });
  }

  selectTag(tag) {
    this.selectedTags.update(values => {
      return [...values, tag];
    });
  }

  selectNegativeTag(tag) {
    this.selectedNegativeTags.update(values => {
      return [...values, tag];
    });
  }

  removeTag(tag) {
    this.selectedTags.update(values => {
      const index = values.findIndex(u => u.id === tag.id)
      values.splice(index, 1)
      return [...values];
    });
  }

  removeNegativeTag(tag) {
    this.selectedNegativeTags.update(values => {
      const index = values.findIndex(u => u.id === tag.id)
      values.splice(index, 1)
      return [...values];
    });
  }

  addUserFilterFromResult(username: string) {
    if (!this.selectedUsers().map(u => u.username).includes(username)) {
      this.selectUser(this.allUsers().find(user => user.username === username))
    }
  }

  addTagFilterFromResult(tagName: string) {
    if (!this.selectedTags().map(t => t.title).includes(tagName)) {
      this.selectTag(this.allTags().find(tag => tag.title === tagName))
    }
  }


  selectGod(god) {
    this.selectedGods.update(values => {
      return [...values, god];
    });
  }

  removeGod(god) {
    this.selectedGods.update(values => {
      const index = values.findIndex(u => u.id === god.id)
      values.splice(index, 1)
      return [...values];
    });
  }

  toggleFilters() {
    this.filtersOpen.update(open => !open)
  }

  closeFilters() {
    this.filtersOpen.set(false)
  }

  toggleFavoriteFilter() {
    this.favoritesOnly.update(value => !value);
  }

  setFilter(filter: SearchBy) {
    if (this.sortFilter() === filter) {
      this.sortOrder.set(this.sortOrder() === OrderBy.DESC ? OrderBy.ASC : OrderBy.DESC);
    } else {
      this.sortFilter.set(filter);
      this.sortOrder.set(OrderBy.DESC);
    }
  }

  // update à la main  du liked/count pour pas faire un refresh complet de la recherche
  toggleFavorite(deck) {
    if (this.isLoggedIn && !deck.owned) {
      if (!deck.liked) {
        this.authenticatedApiService.addToFavorites(deck.deckId).subscribe(r => {
          this.decks.update(values => {
            const toBeUpdated = values.find(u => u.deckId === deck.deckId)
            toBeUpdated.favoriteCount += 1
            toBeUpdated.liked = true
            return [...values];
          });
        })
      } else {
        this.authenticatedApiService.removeFromFavorites(deck.deckId).subscribe(r => {
          this.decks.update(values => {
            const toBeUpdated = values.find(u => u.deckId === deck.deckId)
            toBeUpdated.favoriteCount -= 1
            toBeUpdated.liked = false
            return [...values];
          });
        })
      }
    }
  }

  pageUp() {
    if (this.currentPage < this.searchResults.totalPages - 1) {
      this.currentPage++
      this.search()
    }
  }

  pageDown() {
    if (this.currentPage > 0) {
      this.currentPage--
      this.search()
    }
  }

  pageSet(value) {
    this.currentPage = value - 1;
    this.search();
  }

  reloadFilters() {
    this.setSignalWithStorageValue(this.selectedGods, 'gods')
    this.setSignalWithStorageValue(this.selectedCards, 'cards')
    this.setSignalWithStorageValue(this.selectedTags, 'tags')
    this.setSignalWithStorageValue(this.selectedNegativeTags, 'negativeTags')
    this.setSignalWithStorageValue(this.selectedUsers, 'users')
    this.setSignalWithStorageValue(this.selectedNegativeUsers, 'negativeUsers')
    this.favoritesOnly.set(JSON.parse(sessionStorage.getItem('favoritesOnly')) || false)
    this.sortFilter.set((JSON.parse(sessionStorage.getItem('sortFilter')) as SearchBy) || SearchBy.RECENT)
    this.sortOrder.set((JSON.parse(sessionStorage.getItem('sortOrder')) as OrderBy) || OrderBy.DESC)
    this.currentPage = JSON.parse(sessionStorage.getItem('currentPage')) || 0
    this.pageSize = JSON.parse(sessionStorage.getItem('pageSize')) || 20
  }

  saveFilters() {
    sessionStorage.setItem('gods', JSON.stringify(this.selectedGods()))
    sessionStorage.setItem('cards', JSON.stringify(this.selectedCards()))
    sessionStorage.setItem('tags', JSON.stringify(this.selectedTags()))
    sessionStorage.setItem('negativeTags', JSON.stringify(this.selectedNegativeTags()))
    sessionStorage.setItem('users', JSON.stringify(this.selectedUsers()))
    sessionStorage.setItem('negativeUsers', JSON.stringify(this.selectedNegativeUsers()))
    sessionStorage.setItem('sortFilter', JSON.stringify(this.sortFilter()))
    sessionStorage.setItem('sortOrder', JSON.stringify(this.sortOrder()))
    sessionStorage.setItem('currentPage', JSON.stringify(this.currentPage))
    sessionStorage.setItem('pageSize', JSON.stringify(this.pageSize))
    sessionStorage.setItem('favoritesOnly', JSON.stringify(this.favoritesOnly()))
  }


  setSignalWithStorageValue(signal, stored) {
    const val = sessionStorage.getItem(stored);
    if (val && val.length) {
      signal.set(JSON.parse(val))
    }
  }

}

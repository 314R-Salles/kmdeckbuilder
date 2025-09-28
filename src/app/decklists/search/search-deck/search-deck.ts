import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ApiService} from '../../../api/api.service';
import {AuthenticatedApiService} from '../../../api/authenticated-api.service';
import {StoreService} from '../../../store.service';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {combineLatest, debounceTime, distinctUntilChanged, switchMap} from 'rxjs';
import {Pagination} from '../../../base/pagination/pagination';
import {Section} from '../../../base/section/section';
import {RouterLink} from '@angular/router';
import {TagDropdown} from '../../common/tag-dropdown/tag-dropdown';
import {MatIcon} from '@angular/material/icon';
import {GodDropdown} from '../god-dropdown/god-dropdown';
import {DatePipe, NgClass, NgStyle} from '@angular/common';
import {MatTooltip} from '@angular/material/tooltip';
import {OwnerDropdown} from '../owner-dropdown/owner-dropdown';
import {CardDropdown} from '../card-dropdown/card-dropdown';
import {HighlightDisplay} from "../highlight-display/highlight-display";
import {toSignal} from "@angular/core/rxjs-interop";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-search-deck',
  imports: [
    Pagination,
    ReactiveFormsModule,
    Section,
    RouterLink,
    TagDropdown,
    CardDropdown,
    MatIcon,
    GodDropdown,
    MatTooltip,
    NgClass,
    DatePipe,
    NgStyle,
    OwnerDropdown,
    CardDropdown,
    HighlightDisplay,
    TranslatePipe
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
  CARD_ILLUSTRATIONS

  decks = signal<any>(null)
  actionPointsCompareSup = true
  dustCompareSup = true
  favoritesOnly = false
  sortFilter = "RECENT"
  selectedCards = signal<any>([])
  selectedUsers = signal<any>([])
  selectedNegativeUsers = signal<any>([])
  selectedGods = signal<any>([])
  selectedTags = signal<any>([])
  selectedNegativeTags = signal<any>([])

  allUsers = signal<any>([])

  allTags = toSignal(
    this.storeService.getLanguage().pipe(
      switchMap((language) => {
        return this.apiService.getTagsByLanguage(language)
      })))


  searchForm = new FormGroup({
    content: new FormControl(''),
    actionPointsCost: new FormControl(''),
    dustCost: new FormControl('')
  })

  subscriptions = []

  constructor() {
    this.CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
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

    this.searchForm.valueChanges.pipe(
      debounceTime(50),
      distinctUntilChanged()
    ).subscribe(_ => this.search())
  }

  resetFilters() {
    this.selectedGods.set([])
    this.dustCompareSup = true;
    this.actionPointsCompareSup = true;
    this.favoritesOnly = false;
    this.selectedCards.set([]);
    this.selectedTags.set([]);
    this.selectedNegativeTags.set([]);
    this.selectedUsers.set([]);
    this.selectedNegativeUsers.set([]);
    this.sortFilter = "RECENT"
    this.searchForm.reset()
    this.search()
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
      actionPointCost: this.searchForm.get('actionPointsCost').value,
      actionCostGeq: this.actionPointsCompareSup,
      dustGeq: this.dustCompareSup,
      dustCost: this.searchForm.get('dustCost').value,
      content: this.searchForm.get('content').value,
      favoritesOnly: this.favoritesOnly,
      language: this.currentLanguage(),
      searchBy: this.sortFilter,
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
    this.resetPageAndSearch()
  }

  removeCard(card) {
    this.selectedCards.update(values => {
      const index = values.findIndex(u => u.id === card.id)
      values.splice(index, 1)
      return [...values];
    });
    this.resetPageAndSearch()
  }

  selectUser(user, negative) {
    if (!negative)
      this.selectedUsers.update(values => {
        return [...values, user];
      });
    else
      this.selectedNegativeUsers.update(values => {
        return [...values, user];
      });
    this.resetPageAndSearch()
  }


  removeUser(user) {
    this.selectedUsers.update(values => {
      const index = values.findIndex(u => u.username === user.username)
      values.splice(index, 1)
      return [...values];
    });
    this.resetPageAndSearch()
  }

  removeNegativeUser(user) {
    this.selectedNegativeUsers.update(values => {
      const index = values.findIndex(u => u.username === user.username)
      values.splice(index, 1)
      return [...values];
    });
    this.resetPageAndSearch()
  }

  selectTag(tag, negative) {
    if (!negative)
      this.selectedTags.update(values => {
        return [...values, tag];
      });
    else
      this.selectedNegativeTags.update(values => {
        return [...values, tag];
      });
    this.resetPageAndSearch()
  }

  removeTag(tag) {
    this.selectedTags.update(values => {
      const index = values.findIndex(u => u.id === tag.id)
      values.splice(index, 1)
      return [...values];
    });
    this.resetPageAndSearch()
  }

  removeNegativeTag(tag) {
    this.selectedNegativeTags.update(values => {
      const index = values.findIndex(u => u.id === tag.id)
      values.splice(index, 1)
      return [...values];
    });
    this.resetPageAndSearch()
  }

  addUserFilterFromResult(username: string, event) {
    if (!this.selectedUsers().map(u => u.username).includes(username)) {
      this.selectUser(this.allUsers().find(user => user.username === username), false)
    }
    event.stopPropagation();
    event.preventDefault()
  }

  addTagFilterFromResult(tagName: string, event) {
    if (!this.selectedTags().map(t => t.title).includes(tagName)) {
      this.selectTag(this.allTags().find(tag => tag.title === tagName), false)
    }
    event.stopPropagation();
    event.preventDefault()
  }


  selectGod(god) {
    this.selectedGods.update(values => {
      return [...values, god];
    });
    this.resetPageAndSearch()
  }

  removeGod(god) {
    this.selectedGods.update(values => {
      const index = values.findIndex(u => u.id === god.id)
      values.splice(index, 1)
      return [...values];
    });
    this.resetPageAndSearch()
  }

  toggleFavoriteFilter() {
    this.favoritesOnly = !this.favoritesOnly;
    this.resetPageAndSearch()
  }

  toggleSortFilter() {
    if (this.sortFilter == "RECENT")
      this.sortFilter = "FAVORITE";
    else
      this.sortFilter = "RECENT";

    this.resetPageAndSearch();
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
    if (this.currentPage > 0) { // validation en doublon puisque géré par le composant pagination
      this.currentPage--
      this.search()
    }
  }

  pageSet(value) {
    this.currentPage = value - 1;
    this.search();
  }


  resetPageAndSearch() {
    this.currentPage = 0;
    this.search()
  }

  reloadFilters() {
    this.setSignalWithStorageValue(this.selectedGods, 'gods')
    this.setSignalWithStorageValue(this.selectedCards, 'cards')
    this.setSignalWithStorageValue(this.selectedTags, 'tags')
    this.setSignalWithStorageValue(this.selectedNegativeTags, 'negativeTags')
    this.setSignalWithStorageValue(this.selectedUsers, 'users')
    this.setSignalWithStorageValue(this.selectedNegativeUsers, 'negativeUsers')
    this.favoritesOnly = JSON.parse(sessionStorage.getItem('favoritesOnly')) || false
    this.sortFilter = JSON.parse(sessionStorage.getItem('sortFilter')) || "RECENT"
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
    sessionStorage.setItem('sortFilter', JSON.stringify(this.sortFilter))
    sessionStorage.setItem('currentPage', JSON.stringify(this.currentPage))
    sessionStorage.setItem('pageSize', JSON.stringify(this.pageSize))
    sessionStorage.setItem('favoritesOnly', JSON.stringify(this.favoritesOnly))
  }


  setSignalWithStorageValue(signal, stored) {
    const val = sessionStorage.getItem(stored);
    if (val && val.length) {
      signal.set(JSON.parse(val))
    }
  }

}

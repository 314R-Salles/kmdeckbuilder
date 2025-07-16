import {Component, inject, OnInit, signal} from '@angular/core';
import {ApiService} from '../../../api/api.service';
import {AuthenticatedApiService} from '../../../api/authenticated-api.service';
import {StoreService} from '../../../store.service';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {debounceTime, distinctUntilChanged} from 'rxjs';
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
    HighlightDisplay
  ],
  templateUrl: './search-deck.html',
  styleUrl: './search-deck.scss'
})
export class SearchDeck implements OnInit {

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

  selectedCards = signal<any>([])
  selectedUsers = signal<any>([])
  selectedNegativeUsers = signal<any>([])
  selectedGods = signal<any>([])
  selectedTags = signal<any>([])
  selectedNegativeTags = signal<any>([])

  allUsers = signal<any>([])
  allTags = signal<any>([])

  searchForm = new FormGroup({
    content: new FormControl(''),
    actionPointsCost: new FormControl(''),
    dustCost: new FormControl('')
  })

  apiService = inject(ApiService)
  authenticatedApiService = inject(AuthenticatedApiService)
  storeService = inject(StoreService)

  constructor() {
    this.CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap();
  }

  ngOnInit() {

    this.apiService.getDeckOwners().subscribe(owners => {
      this.allUsers.set(owners);
    })

    this.apiService.getTagsByLanguage("FR").subscribe(tags => {
      this.allTags.set(tags);
    })

    this.storeService.getUser().pipe(
      // peut eviter un appel sur  avec user null puis un appel sur user valorisé
      debounceTime(50))
      .subscribe(e => {
        this.isLoggedIn = e?.lastLogin
        this.search();
      })


    this.searchForm.valueChanges.pipe(
      debounceTime(50),
      distinctUntilChanged()
    ).subscribe(_ => this.search())
  }

  toggleActionPointsCompare() {
    this.actionPointsCompareSup = !this.actionPointsCompareSup;
    this.search();
  }

  toggleDustCompare() {
    this.dustCompareSup = !this.dustCompareSup;
    this.search();
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
    this.searchForm.reset()
    this.search()
  }

  search() {
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
      language: "FR",
      searchBy: "RECENT", // check enum java
      page: this.currentPage,
      pageSize: this.pageSize,
    };

    // c'est pas initialisé
    let searchRequest;
    if (this.isLoggedIn) {
      searchRequest = this.authenticatedApiService.getDecks(request)
    } else {
      searchRequest = this.apiService.getDecks(request)
    }

    searchRequest.subscribe(searchResults => {
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
      this.selectedNegativeUsers.update(values => { return [...values, user]; });
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

  // update à la main  du liked/count pour pas faire un refresh complet de la recherche
  toggleFavorite(deck) {
    if (this.isLoggedIn) {
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
}

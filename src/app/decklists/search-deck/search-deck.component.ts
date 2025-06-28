import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../api/api.service";
import {FormControl, FormGroup} from "@angular/forms";
import {debounceTime, distinctUntilChanged} from "rxjs";
import {StoreService} from "../../store.service";
import {AuthenticatedApiService} from "../../api/authenticated-api.service";

@Component({
  selector: 'app-search-deck',
  templateUrl: './search-deck.component.html',
  styleUrl: './search-deck.component.scss'
})
export class SearchDeckComponent implements OnInit {

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

  decks = null
  CARD_ILLUSTRATIONS
  searchForm
  actionPointsCompareSup = true
  dustCompareSup = true
  favoritesOnly = false

  selectedCards = []
  selectedUsers = []
  selectedGods = []
  selectedTags = []

  allUsers = []
  allTags = []

  constructor(private apiService: ApiService,
              private authenticatedApiService: AuthenticatedApiService,
              private storeService: StoreService) {
  }

  ngOnInit() {

    this.apiService.getDeckOwners().subscribe(owners => {
      this.allUsers = owners;
    })

    this.apiService.getTagsByLanguage("FR").subscribe(tags => {
      this.allTags = tags;
    })

    this.searchForm = new FormGroup({
      content: new FormControl(''),
      actionPointsCost: new FormControl(''),
      dustCost: new FormControl('')
    })
    // this.search();

    this.storeService.getUser().subscribe(e => {
      this.isLoggedIn = e?.lastLogin
      this.search();
    })

    this.CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap();


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
    this.selectedGods = []
    this.dustCompareSup = true;
    this.actionPointsCompareSup = true;
    this.favoritesOnly = false;
    this.selectedCards = [];
    this.selectedTags = [];
    this.selectedUsers = [];
    this.searchForm.reset()
    this.search()
  }

  search() {
    const request = {
      gods: this.selectedGods.length ? this.selectedGods.map(g => g.id) : null,
      cards: this.selectedCards.length ? this.selectedCards.map(c => c.id) : null,
      tags: this.selectedTags.length ? this.selectedTags.map(c => c.id) : null,
      users: this.selectedUsers.length ? this.selectedUsers.map(u => u.username) : null,
      actionPointCost: this.searchForm.get('actionPointsCost').value,
      actionCostGeq: this.actionPointsCompareSup,
      dustGeq: this.dustCompareSup,
      dustCost: this.searchForm.get('dustCost').value,
      content: this.searchForm.get('content').value,
      favoritesOnly: this.favoritesOnly,
      language: "FR",
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
      this.decks = searchResults.content
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
    // conversion en id nécessaire pour le includes, les "cards" sont différents objets à chaque ouverture de la liste déroulante
    // en fait le check est plus nécessaire puisque les options déjà selectionnées sont plus cliquable à nouveau
    this.currentPage = 0;
    if (!this.selectedCards.map(c => c.id).includes(card.id)) {
      this.selectedCards = [...this.selectedCards, card]
      this.search()
    }
  }

  removeCard(card) {
    this.currentPage = 0;
    const index = this.selectedCards.findIndex(c => c.id === card.id)
    this.selectedCards.splice(index, 1)
    this.search()
  }

  selectUser(user) {
    this.currentPage = 0;
    if (!this.selectedUsers.map(u => u.username).includes(user.username)) {
      this.selectedUsers.push(user)
      this.search()
    }
  }


  selectTag(tag) {
    this.currentPage = 0;
    if (!this.selectedTags.map(t => t.title).includes(tag.title)) {
      this.selectedTags.push(tag)
      this.search()
    }
  }

  addUserFilterFromResult(username: string, event) {
    this.selectUser(this.allUsers.find(user => user.username === username))
    event.stopPropagation();
    event.preventDefault()
  }

  addTagFilterFromResult(tagName: string, event) {
    this.selectTag(this.allTags.find(tag => tag.title === tagName))
    event.stopPropagation();
    event.preventDefault()
  }


  removeUser(user) {
    this.currentPage = 0;
    const index = this.selectedUsers.findIndex(u => u.username === user.username)
    this.selectedUsers.splice(index, 1)
    this.search()
  }

  selectGod(god) {
    this.currentPage = 0;
    this.selectedGods.push(god)
    this.search()
  }

  removeGod(god) {
    this.currentPage = 0;
    const index = this.selectedGods.findIndex(u => u.id === god.id)
    this.selectedGods.splice(index, 1)
    this.search()
  }

  removeTag(tag) {
    this.currentPage = 0;
    const index = this.selectedTags.findIndex(u => u.id === tag.id)
    this.selectedTags.splice(index, 1)
    this.search()
  }

  toggleFavoriteFilter() {
    this.currentPage = 0;
    this.favoritesOnly = !this.favoritesOnly;
    this.search()
  }

  // update à la main  du liked/count pour pas faire un refresh complet de la recherche
  toggleFavorite(deck) {
    if (this.isLoggedIn) {
      if (!deck.liked) {
        this.authenticatedApiService.addToFavorites(deck.deckId).subscribe(r => {
          deck.favoriteCount += 1
          deck.liked = true
          // this.decks.find(deck => deck.deckId === deck.deckId).favoriteCount += 1
          // this.decks.find(deck => deck.deckId === deck.deckId).liked = true
        })
      } else {
        this.authenticatedApiService.removeFromFavorites(deck.deckId).subscribe(r => {
          deck.favoriteCount -= 1
          deck.liked = false
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
}

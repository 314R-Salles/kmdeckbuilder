import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../api/api.service";
import {God} from "../models/enums";
import {FormControl, FormGroup} from "@angular/forms";
import {debounceTime, distinctUntilChanged} from "rxjs";

@Component({
  selector: 'app-search-deck',
  templateUrl: './search-deck.component.html',
  styleUrl: './search-deck.component.scss'
})
export class SearchDeckComponent implements OnInit {

  searchResults: {
    empty: boolean,
    first: boolean
    last: boolean,
    totalElements: number,
    totalPages: number
  }
  decks = []

  searchForm
  actionPointsCompareSup = true
  dustCompareSup = true

  selectedCards = []
  selectedUsers = []
  selectedGods = []

  constructor(private apiService: ApiService) {
  }

  ngOnInit() {
    this.searchForm = new FormGroup({
      content: new FormControl(''),
      actionPointsCost: new FormControl(''),
      dustCost: new FormControl('')
    })
    this.search();


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
    this.selectedCards = [];
    this.selectedUsers = [];
    this.searchForm.reset()
    this.search()
  }

  search() {
    const request = {
      gods: this.selectedGods.length ? this.selectedGods.map(g => g.id) : null,
      cards: this.selectedCards.length ? this.selectedCards.map(c => c.id) : null,
      users: this.selectedUsers.length ? this.selectedUsers.map(u => u.username) : null,
      actionPointCost: this.searchForm.get('actionPointsCost').value,
      actionCostGeq: this.actionPointsCompareSup,
      dustGeq: this.dustCompareSup,
      dustCost: this.searchForm.get('dustCost').value,
      content: this.searchForm.get('content').value,
    };
    this.apiService.getDecks(request).subscribe(searchResults => {
      this.decks = searchResults.content
      this.searchResults = {
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
    if (!this.selectedCards.map(c => c.id).includes(card.id)) {
      this.selectedCards.push(card)
      this.search()
    }
  }

  removeCard(card) {
    const index = this.selectedCards.findIndex(c => c.id === card.id)
    this.selectedCards.splice(index, 1)
    this.search()
  }

  selectUser(user) {
    // en fait le check est plus nécessaire puisque les options déjà selectionnées sont plus cliquable à nouveau
    if (!this.selectedUsers.map(u => u.username).includes(user.username)) {
      this.selectedUsers.push(user)
      this.search()
    }
  }

  removeUser(user) {
    const index = this.selectedUsers.findIndex(u => u.username === user.username)
    this.selectedUsers.splice(index, 1)
    this.search()
  }

  selectGod(god) {
    this.selectedGods.push(god)
    this.search()
  }

  removeGod(god) {
    const index = this.selectedGods.findIndex(u => u.id === god.id)
    this.selectedGods.splice(index, 1)
    this.search()
  }

}

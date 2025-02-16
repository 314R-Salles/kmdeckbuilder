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

  gods = []
  searchResults: {
    empty: boolean,
    first: boolean
    last: boolean,
    totalElements: number,
    totalPages: number
  }
  decks = []
  God = God

  searchForm
  actionPointsCompareSup = true
  dustCompareSup = true

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

  toggleGod(god) {
    let index = this.gods.indexOf(god)
    if (index != -1) {
      this.gods.splice(index, 1)
    } else {
      this.gods.push(god);
    }
    this.search()
  }

  resetFilters() {
    this.gods = []
    this.dustCompareSup = true;
    this.actionPointsCompareSup = true;
    this.searchForm.reset()
    this.search()
  }

  search() {
    const request = {
      gods: this.gods.length ? this.gods : null,
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

}

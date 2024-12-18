import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../api/api.service";
import {God} from "../models/enums";

@Component({
  selector: 'app-search-deck',
  templateUrl: './search-deck.component.html',
  styleUrl: './search-deck.component.scss'
})
export class SearchDeckComponent implements OnInit {

  gods = []
  decks = []
  God = God

  constructor(private apiService: ApiService) {
  }

  ngOnInit() {
    this.search()
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
    this.search()
  }

  search() {
    this.apiService.getDecks({gods: this.gods.length ? this.gods : null}).subscribe(r => this.decks = r)
  }

}

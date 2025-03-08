import {Component, EventEmitter, HostListener, Input, OnChanges, Output} from '@angular/core';
import {ApiService} from "../../../api/api.service";

@Component({
  selector: 'app-card-dropdown',
  templateUrl: './card-dropdown.component.html',
  styleUrl: './card-dropdown.component.scss'
})
export class CardDropdownComponent implements OnChanges {

  @Input() selectedGods
  @Input() selectedCards
  @Output() onSelectCard = new EventEmitter<any>();

  // Deuxieme mode, les cartes sont en input, pas de recherche via api
  @Input() cardOptions = []
  fromInput = false
  // necessaire si plusieurs fois le meme composant dans la meme page
  @Input() id: number


  constructor(private apiService: ApiService) {
  }

  cardName =''
  searchedCards = []
  displayDropdown = false

  ngOnChanges(): void {
    this.fromInput = !!this.cardOptions.length
  }

  openDropdown() {
    if (this.fromInput) {
      this.displayDropdown = true;
      this.searchedCards = this.cardOptions.filter(result => !this.selectedCards.map(c => c.id).includes(result.id));
    }
  }

  searchCards() {
    this.displayDropdown = false;
    this.searchedCards = [];
    // 2 à cause de Az
    if (this.cardName && this.cardName.length >= 2) {
      if (!this.fromInput) {
        this.apiService.getCardsByName({
          gods: this.selectedGods.length ? [...this.selectedGods.map(g => g.id), 0] : [],
          name: this.cardName,
          pageNumber: 0,
          pageSize: 100
        }).subscribe(searchResults => {
          this.displayDropdown = true;
          // retirer des résultats les cartes déjà sélectionnées
          this.searchedCards = searchResults.content.filter(result => !this.selectedCards.map(c => c.id).includes(result.id));
          // this.searchedCards = searchResults
        })
      } else {
        this.displayDropdown = true;
        this.searchedCards = this.cardOptions.filter(result => !this.selectedCards.map(c => c.id).includes(result.id));
        this.searchedCards = this.searchedCards.filter(result => result.name.toLowerCase().includes(this.cardName.toLowerCase()));
      }
    }
  }

  selectCard(card) {
    if (!this.fromInput) {
      this.searchedCards = this.searchedCards.filter(result => card.id !== result.id);
    } else {
      this.searchedCards = this.cardOptions.filter(result => !this.selectedCards.map(c => c.id).includes(result.id));
      this.searchedCards = this.searchedCards.filter(result => result.name.toLowerCase().includes(this.cardName.toLowerCase()));
    }
    this.onSelectCard.emit(card);
  }

  clickedInside

  @HostListener('click', ['$event'])
  clickInside(event) {
    // event.stopPropagation();
    this.clickedInside = true
  }

  @HostListener('document:click')
  clickout() {
    if (!this.clickedInside) {
      this.cardName = null
      this.displayDropdown = false;
    }
    this.clickedInside = false
  }

}

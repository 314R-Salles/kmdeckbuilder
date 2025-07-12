import {Component, computed, HostListener, inject, input, output, signal} from '@angular/core';
import {StoreService} from '../../../store.service';
import {FormsModule} from '@angular/forms';
import {NgClass, NgStyle} from '@angular/common';

@Component({
  selector: 'app-card-dropdown-from-list',
  imports: [
    FormsModule,
    NgStyle,
    NgClass
  ],
  templateUrl: './card-dropdown-from-list.html',
  styleUrl: './card-dropdown-from-list.scss'
})
export class CardDropdownFromList {

  CARD_ILLUSTRATIONS
  displayDropdown = false

  cardOptions = input<any[]>([]);
  selectedCards = input<any[]>([]);
  onSelectCard = output<any>();

  cardSearch = signal<string>('');

  displayedCards = computed(() => {
    let r = this.cardOptions().filter(result => !this.selectedCards().map(c => c.id).includes(result.id));
    return r.filter(result => !this.cardSearch() || result.name.toLowerCase().includes(this.cardSearch().toLowerCase()));
  })

  storeService = inject(StoreService)

  constructor() {
    this.CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap();
  }

  dropdownClick() {
    this.displayDropdown = !this.displayDropdown
  }

  selectCard(card) {
    this.onSelectCard.emit(card);
  }

  clickedInside

  @HostListener('click', ['$event'])
  clickInside(event) {
    this.clickedInside = true
  }

  @HostListener('document:click')
  clickout() {
    if (!this.clickedInside) {
      this.cardSearch.set(null);
      this.displayDropdown = false;
    }
    this.clickedInside = false
  }

}

import {Component, computed, inject, input, output} from '@angular/core';
import {StoreService} from '../../../store.service';
import {FormsModule} from '@angular/forms';
import {NgClass, NgStyle} from '@angular/common';
import {AbstractDropdownComponent} from "../../../base/AbstractDropdownComponent";

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
export class CardDropdownFromList extends AbstractDropdownComponent {

  storeService = inject(StoreService)

  CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap();

  cardOptions = input<any[]>([]);
  selectedCards = input<any[]>([]);
  onSelectCard = output<any>();

  displayedCards = computed(() => {
    let r = this.cardOptions().filter(result => !this.selectedCards().map(c => c.id).includes(result.id));
    return r.filter(result => !this.search() || result.name.toLowerCase().includes(this.search().toLowerCase()));
  })

  selectCard(card) {
    this.onSelectCard.emit(card);
  }

}

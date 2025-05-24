import {Component, EventEmitter, Input, Output} from '@angular/core';
import {StoreService} from "../../store.service";

@Component({
  selector: 'app-selected-list',
  templateUrl: './selected-list.component.html',
  styleUrl: './selected-list.component.scss'
})
export class SelectedListComponent {

  updatedSynthese: any[]

  @Input() max
  @Input() syntheseCost

  @Input() set synthese(value: { [key: string]: { count: number, rarity: any, godType: any, name: string } }) {
    if (value) {
      this.updatedSynthese = Object.values(value)

      let godCards = this.updatedSynthese.filter(a => a.godType !== 'NEUTRE')
      let neutralCards = this.updatedSynthese.filter(a => a.godType === 'NEUTRE')

      godCards.sort((a, b) => a.costAP - b.costAP);
      neutralCards.sort((a, b) => a.costAP - b.costAP);

      this.updatedSynthese = [];
      this.updatedSynthese.push(...godCards)
      this.updatedSynthese.push(...neutralCards)
    }
  }

  @Output() removeCard = new EventEmitter<string>();

  CARD_ILLUSTRATIONS
  constructor(private storeService: StoreService) {
    this.CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap();
  }

  remove(key: string) {
    this.removeCard.emit(key)
  }

}



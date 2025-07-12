import {Component, computed, inject, input, output} from '@angular/core';
import {StoreService} from '../../../store.service';
import {NgClass} from '@angular/common';
import {Synthesis} from '../../common/synthesis/synthesis';

@Component({
  selector: 'app-selected-list',
  imports: [
    NgClass,
    Synthesis
  ],
  templateUrl: './selected-list.html',
  styleUrl: './selected-list.scss'
})
export class SelectedList {

  max = input<number>();
  syntheseCost = input<any>();
  synthese = input<{ [key: string]: {id: number, count: number, rarity: any, godType: any, costAP: number, name: string } }>();

  updatedSynthese = computed(() => {
    if (this.synthese()) {
      let updatedSynthese = Object.values(this.synthese())

      let godCards = updatedSynthese.filter(a => a.godType !== 'NEUTRE')
      let neutralCards = updatedSynthese.filter(a => a.godType === 'NEUTRE')

      godCards.sort(this.customSort);
      neutralCards.sort(this.customSort);

      updatedSynthese = [];
      updatedSynthese.push(...godCards)
      updatedSynthese.push(...neutralCards)

      return updatedSynthese;
    } else return [];
  });

  removeCard = output<number>();

  CARD_ILLUSTRATIONS

  storeService = inject(StoreService)

  constructor() {
    this.CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap();
  }

  customSort(cardA, cardB) {
    if (cardA.costAP != cardB.costAP) return cardA.costAP - cardB.costAP
    else return cardA.name.localeCompare(cardB.name)
  }

  remove(key: number) {
    this.removeCard.emit(key)
  }

}

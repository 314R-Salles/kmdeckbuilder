import {Component, computed, inject, input} from '@angular/core';
import {StoreService} from '../../../store.service';
import {CardType, CREA, SORT} from '../../common/models/enums';
import {NgClass, NgStyle, NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-view-list',
  imports: [
    NgTemplateOutlet,
    NgClass,
    NgStyle
  ],
  templateUrl: './view-list.html',
  styleUrl: './view-list.scss'
})
export class ViewList {

  cards = input<any[]>([]);

  sortedSynthesis = computed(() => {
    let synthese = {NEUTRE: [], GOD_CREA: [], GOD_SPELL: [], KROSFI: []}
    this.cards().reduce((acc, card) => {
      if (["INFINITE"].includes(card.rarity)) {
        acc['KROSFI'].push(card)
      } else if (card.godType === "NEUTRE") {
        acc['NEUTRE'].push(card)
      } else {
        if (card.cardType === CardType[CREA]) {
          acc['GOD_CREA'].push(card)
        }
        if (card.cardType === CardType[SORT]) {
          acc['GOD_SPELL'].push(card)
        }
      }
      return acc;
    }, synthese)

    synthese['KROSFI'].sort(this.customSort);
    synthese['NEUTRE'].sort(this.customSort);
    synthese['GOD_CREA'].sort(this.customSort);
    synthese['GOD_SPELL'].sort(this.customSort);
    return synthese;
  })

  CARD_ILLUSTRATIONS

  storeService = inject(StoreService)
  constructor() {
    this.CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap();
  }

  //FIXME déclaration commune dans le projet
  customSort(cardA, cardB) {
    if (cardA.costAP != cardB.costAP) return cardA.costAP - cardB.costAP
    else return cardA.name.localeCompare(cardB.name)
  }

}

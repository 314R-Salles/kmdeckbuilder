import {Component, computed, inject, input} from '@angular/core';
import {StoreService} from '../../../store.service';
import {CardType, CREA, SORT} from '../../common/models/enums';
import {NgClass, NgStyle, NgTemplateOutlet} from '@angular/common';
import {customSort} from "../../../base/models/utils";

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

  cards = input<any[]>();
  data = input<any>();

  sortedSynthesis = computed(() => {
    let synthese = {NEUTRE: [], GOD_CREA: [], GOD_SPELL: [], KROSFI: []}
    if (this.cards() != null) {
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

      synthese['KROSFI'].sort(customSort);
      synthese['NEUTRE'].sort(customSort);
      synthese['GOD_CREA'].sort(customSort);
      synthese['GOD_SPELL'].sort(customSort);
    }
    return synthese;
  })

  CARD_ILLUSTRATIONS

  storeService = inject(StoreService)

  constructor() {
    this.CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap();
  }

}

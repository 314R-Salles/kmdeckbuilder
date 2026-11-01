import {Component, computed, inject, input} from '@angular/core';
import {StoreService} from '../../../store.service';
import {CardType, SORT} from '../../common/models/enums';
import {NgClass, NgStyle, NgTemplateOutlet} from '@angular/common';
import {customSort} from "../../../common/utils";
import {toSignal} from "@angular/core/rxjs-interop";

type CardCategory = 'NEUTRE' | 'GOD_CREA' | 'GOD_SPELL' | 'KROSFI';
const CARD_CATEGORIES: CardCategory[] = ['NEUTRE', 'GOD_CREA', 'GOD_SPELL', 'KROSFI'];

function getCardCategory(card: any): CardCategory {
  if (card.rarity === 'INFINITE') {
    return 'KROSFI';
  }
  if (card.godType === 'NEUTRE') {
    return 'NEUTRE';
  }
  return card.cardType === CardType[SORT] ? 'GOD_SPELL' : 'GOD_CREA';
}

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
  storeService = inject(StoreService);
  currentLanguage = toSignal(this.storeService.getLanguage())

  cards = input<any[]>();

  sortedSynthesis = computed(() => {
    const synthese: Record<CardCategory, any[]> = {NEUTRE: [], GOD_CREA: [], GOD_SPELL: [], KROSFI: []};
    const cards = this.cards();
    if (cards == null) {
      return synthese;
    }

    for (const card of cards) {
      synthese[getCardCategory(card)].push(card);
    }
    for (const category of CARD_CATEGORIES) {
      synthese[category].sort(customSort);
    }
    return synthese;
  })

  CARD_ILLUSTRATIONS

  constructor() {
    this.CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap();
  }

}

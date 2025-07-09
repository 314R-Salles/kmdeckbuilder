import {Component, Input, OnChanges} from '@angular/core';
import {CardType, CREA, SORT} from "../models/enums";
import {StoreService} from "../../store.service";

@Component({
    selector: 'app-view-list',
    templateUrl: './view-list.component.html',
    styleUrl: './view-list.component.scss',
    standalone: false
})
export class ViewListComponent implements OnChanges {

  @Input() cards;
  synthese
  CARD_ILLUSTRATIONS

  constructor(private storeService: StoreService) {
    this.CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap();
  }

  ngOnChanges(): void {
    this.synthese = {NEUTRE: [], GOD_CREA: [], GOD_SPELL: [], KROSFI: []}
    this.cards.reduce((synthese, card) => {
      if (["INFINITE"].includes(card.rarity)) {
        synthese['KROSFI'].push(card)
      } else if (card.godType === "NEUTRE") {
        synthese['NEUTRE'].push(card)
      } else {
        if (card.cardType === CardType[CREA]) {
          synthese['GOD_CREA'].push(card)
        }
        if (card.cardType === CardType[SORT]) {
          synthese['GOD_SPELL'].push(card)
        }
      }
      return synthese;
    }, this.synthese)

    this.synthese['KROSFI'].sort(this.customSort);
    this.synthese['NEUTRE'].sort(this.customSort);
    this.synthese['GOD_CREA'].sort(this.customSort);
    this.synthese['GOD_SPELL'].sort(this.customSort);

    let max = Math.max(this.synthese['NEUTRE'].length, this.synthese['GOD_CREA'].length, this.synthese['GOD_SPELL'].length, this.synthese['KROSFI'].length)

  }

  customSort(cardA, cardB) {
    if (cardA.costAP != cardB.costAP) return cardA.costAP - cardB.costAP
    else return cardA.name.localeCompare(cardB.name)
  }

}

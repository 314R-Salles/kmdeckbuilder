import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CardRarity, CardType, CREA, SORT} from "../models/enums";

@Component({
  selector: 'app-view-list',
  templateUrl: './view-list.component.html',
  styleUrl: './view-list.component.scss'
})
export class ViewListComponent implements OnChanges {

  @Input() cards;
  synthese

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

  }
}

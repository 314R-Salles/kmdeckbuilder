import {Component, Input, OnChanges} from '@angular/core';
import {CardType, CREA, SORT} from "../models/enums";

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

    this.synthese['KROSFI'].sort((a, b) => a.costAP - b.costAP);
    this.synthese['NEUTRE'].sort((a, b) => a.costAP - b.costAP);
    this.synthese['GOD_CREA'].sort((a, b) => a.costAP - b.costAP);
    this.synthese['GOD_SPELL'].sort((a, b) => a.costAP - b.costAP);

    let max = Math.max(this.synthese['NEUTRE'].length, this.synthese['GOD_CREA'].length, this.synthese['GOD_SPELL'].length, this.synthese['KROSFI'].length)

  }
}

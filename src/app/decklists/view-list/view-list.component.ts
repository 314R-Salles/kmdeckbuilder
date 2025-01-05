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

  // plus utilisé donc à delete TODO FIXME
  stackGod
  stackLasts
  stackFirsts
  stackAllLasts

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
    let max = Math.max(this.synthese['NEUTRE'].length, this.synthese['GOD_CREA'].length, this.synthese['GOD_SPELL'].length, this.synthese['KROSFI'].length)
    let index = [this.synthese['NEUTRE'].length,
      this.synthese['GOD_CREA'].length, this.synthese['GOD_SPELL'].length, this.synthese['KROSFI'].length].indexOf(max)
    if (index === 0) {
     this.stackGod =  this.canStack(this.synthese['GOD_CREA'].length, this.synthese['GOD_SPELL'].length, max)
     this.stackLasts =  this.canStack(this.synthese['GOD_SPELL'].length, this.synthese['KROSFI'].length, max)
     this.stackAllLasts =  this.canStackAll(
       this.synthese['GOD_CREA'].length,
       this.synthese['GOD_SPELL'].length,
       this.synthese['KROSFI'].length,
       max)
    }
    if (index === 1) {
      this.stackLasts =  this.canStack(this.synthese['GOD_SPELL'].length, this.synthese['KROSFI'].length, max)
    }
    if (index === 2) {
      this.stackFirsts =  this.canStack(this.synthese['NEUTRE'].length, this.synthese['GOD_CREA'].length, max)
    }
    if (index === 3) {
      this.stackFirsts =  this.canStack(this.synthese['NEUTRE'].length, this.synthese['GOD_CREA'].length, max)
      this.stackGod =  this.canStack(this.synthese['GOD_CREA'].length, this.synthese['GOD_SPELL'].length, max)
    }
  }


/// Non,   si j'ai 5 créas différentes, 6 créas dieux, et 10 sorts, je dois quand meme stack les 2 colonnes de créas.
// donc potentiellement, juste if index = ?, stack bidule = true
  canStack(legth1, length2, max) {
    return legth1 + length2 + 1 <= max;
  }

  canStackAll(legth1, length2, length3, max) {
    return legth1 + length2 + length3 + 2 <= max;
  }
}

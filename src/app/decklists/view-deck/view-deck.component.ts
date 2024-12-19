import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from "../../api/api.service";
import {CardRarity, CardType, COMMUNE, CREA, INFINITE, KROSMIQUE, PEU_COMMUNE, RARE, SORT} from "../models/enums";


@Component({
  selector: 'app-view-deck',
  templateUrl: './view-deck.component.html',
  styleUrl: './view-deck.component.scss'
})
export class ViewDeckComponent implements OnInit {
  data;
  synthese
  syntheseRarete
  syntheseCost
  max

  // l'input id est fourni par la route
  @Input() id: number

  constructor(private apiService: ApiService) {
  }

  ngOnInit() {
    this.apiService.getDeck(this.id, "FR").subscribe(r => {
      this.data = r;
      this.updateState()
    })
  }


  updateState() {
    this.synthese = {};
    this.syntheseRarete = {[COMMUNE]: 0, [PEU_COMMUNE]: 0, [RARE]: 0, [KROSMIQUE]: 0, [INFINITE]: 0}
    this.data.cards.reduce((synthese, card) => {
      synthese[card.id] = {...card};
      this.syntheseRarete[CardRarity[card.rarity]] = this.syntheseRarete[CardRarity[card.rarity]] + card.count
      return synthese;
    }, this.synthese)
    this.syntheseCost = {
      0: {[CREA]: 0, [SORT]: 0},
      1: {[CREA]: 0, [SORT]: 0},
      2: {[CREA]: 0, [SORT]: 0},
      3: {[CREA]: 0, [SORT]: 0},
      4: {[CREA]: 0, [SORT]: 0},
      5: {[CREA]: 0, [SORT]: 0},
      6: {[CREA]: 0, [SORT]: 0},
      7: {[CREA]: 0, [SORT]: 0}
    };

    this.data.cards.reduce((synthese, card) => {
      if (card.costAP >= 7) {
        synthese[7][CardType[card.cardType]] = synthese[7][CardType[card.cardType]] + 1
      } else {
        synthese[card.costAP][CardType[card.cardType]] = synthese[card.costAP][CardType[card.cardType]] + 1
      }
      return synthese;
    }, this.syntheseCost)

    this.max = Math.max(...Object.values(this.syntheseCost).map(v => v[CREA] + v[SORT]));
  }

}

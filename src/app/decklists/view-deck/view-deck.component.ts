import {Component, Input, OnChanges} from '@angular/core';
import {ApiService} from "../../api/api.service";
import {CardRarity, CardType, COMMUNE, CREA, INFINITE, KROSMIQUE, PEU_COMMUNE, RARE, SORT} from "../models/enums";
import {DomSanitizer} from "@angular/platform-browser";
import {StoreService} from "../../store.service";
import {switchMap} from "rxjs";


@Component({
  selector: 'app-view-deck',
  templateUrl: './view-deck.component.html',
  styleUrl: './view-deck.component.scss'
})
export class ViewDeckComponent implements OnChanges {
  data: any;
  synthese
  syntheseRarete
  syntheseCost
  max

  displayDropdown = false


  canEdit = false
  canClone = false

  // l'input id est fourni par la route
  @Input() id: string
  @Input() version: number

  constructor(private apiService: ApiService, private domSanitize: DomSanitizer, private storeService: StoreService) {
  }

  ngOnChanges() {
    this.apiService.getDeck(this.id, this.version, "FR").pipe(
      switchMap(r => {
        this.data = {...r, description: this.domSanitize.bypassSecurityTrustHtml(r.description.replaceAll("<p></p>", "<p><br></p>"))};
        this.updateState();

        return this.storeService.getUser()
      })).subscribe(user => {
        this.canEdit = user?.username === this.data.owner
        this.canClone = this.canEdit || user
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
        synthese[7][CardType[card.cardType]] = synthese[7][CardType[card.cardType]] + card.count
      } else {
        synthese[card.costAP][CardType[card.cardType]] = synthese[card.costAP][CardType[card.cardType]] + card.count
      }
      return synthese;
    }, this.syntheseCost)

    this.max = Math.max(...Object.values(this.syntheseCost).map(v => v[CREA] + v[SORT]));
  }

}

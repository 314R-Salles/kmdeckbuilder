import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Card} from '../models/card.model';
import {ApiService} from "../../api/api.service";
import {debounceTime, distinctUntilChanged} from "rxjs";
import {CardType, CREA, God, SORT} from "../models/enums";
import {AuthenticatedApiService} from "../../api/authenticated-api.service";
import {MatDialog} from "@angular/material/dialog";
import {DeckCreatedPopinComponent} from "../../popins/deck-created-popin/deck-created-popin.component";


@Component({
  selector: 'app-deckbuilder',
  templateUrl: './deckbuilder.component.html',
  styleUrl: './deckbuilder.component.scss'
})
export class DeckbuilderComponent implements OnInit {

  constructor(private apiService: ApiService,
              private authenticatedApiService: AuthenticatedApiService,
              private dialog: MatDialog) {
  }


  protected readonly God = God;

  max
  displayedCards: Card[] = [];
  searchResults: {
    empty: boolean,
    first: boolean
    last: boolean,
    totalElements: number,
    totalPages: number
  }

  selectedCards: Card[] = [];
  synthese: {
    [key: string]: {
      count: number,
      rarity: number,
      godType: any,
      costAP: any,
      id: any,
      name: string,
      hightlight?: number
    }
  }
  syntheseRarete: { COMMUNE: 0, PEU_COMMUNE: 0, RARE: 0, KROSMIQUE: 0, INFINITE: 0 }
  god; // le dieu est une donnée fixée, pas dans le formulaire (pour swap neutre / dieu faut garder l'info)
  language: number; // language est comme le dieu, fixé par le site, pas un choix du formulaire
  form: FormGroup;


  ngOnInit(): void {
    this.form = new FormGroup({
      // en place à l'écran
      godCards: new FormControl(true),
      neutralCards: new FormControl(true),
      isSpell: new FormControl(true),
      isMinion: new FormControl(true),
      apValue: new FormControl(null),
      rarity: new FormControl({key: '-1', label: 'Toutes les raretés', color: 'color-all', bgColor: 'bg-color-all'},),
      content: new FormControl(''),
      language: new FormControl('FR'),
      // pagination
      pageNumber: new FormControl('0'),
      pageSize: new FormControl('21'),
      // Pour plus tard
      atValue: new FormControl(''),
      mpValue: new FormControl(''),
      hpValue: new FormControl(''),
      extension: new FormControl(''),
    });

    this.form.valueChanges.pipe(
      // quand on décoche sort et créa, ça recoche une valeur, mais ça fait 2 appels qui finissent pas dans l'ordre.
      // debounce (ptet en prod faudra monter) gomme le double appel. (ou alors corriger la source du probleme)
      debounceTime(50),
      distinctUntilChanged()
    ).subscribe(_ => this.getFilteredCards())
  }

  selectGod(index) {
    this.god = index;
    this.selectedCards = []
    this.updateState()
    this.getFilteredCards()
  }

  // Envisager de passer de 2 champs minion/spell à un champ TYPE qui vaut Minion/Spell directement
  getFilteredCards() {
    let type: CardType;
    if (this.isMinion && this.isSpell) {
      type = null;
    } else {
      if (this.isMinion) type = CardType.CREA;
      if (this.isSpell) type = CardType.SORT;
    }
    // Pour gérer les options X+ on définit un Min Max
    // Exemple si selection 7+, alors min 7 et max null pour dire pas de max
    const apMin = this.apValue;
    const apMax = this.apValue === 7 ? null : this.apValue;

    // si 1-, min = 0, max = 1
    const atMin = this.atValue === 1 ? 0 : this.atValue;
    const atMax = this.atValue === 6 ? null : this.atValue;

    const hpMin = this.hpValue === 1 ? 0 : this.hpValue;
    const hpMax = this.hpValue === 6 ? null : this.hpValue;

    const mpMin = this.mpValue === 1 ? 0 : this.mpValue;
    const mpMax = this.mpValue === 4 ? null : this.mpValue;

    let gods = []
    if (this.godCards) {
      gods.push(this.god)
    }
    if (this.neutralCards) {
      gods.push('NEUTRE')
    }


    this.displayedCards = []
    this.apiService.getCards({
      type: type,
      hpGreaterThan: hpMin,
      hpLessThan: hpMax,
      apGreaterThan: apMin,
      apLessThan: apMax,
      mpGreaterThan: mpMin,
      mpLessThan: mpMax,
      atGreaterThan: atMin,
      atLessThan: atMax,
      gods: gods,
      rarity: this.rarity != -1 ? this.rarity : null,
      language: null,
      family: null,
      content: this.content ? this.content : null,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize

    }).subscribe(searchResults => {
      this.displayedCards = searchResults.content
      this.searchResults = {
        empty: searchResults.empty,
        first: searchResults.first,
        last: searchResults.last,
        totalElements: searchResults.totalElements,
        totalPages: searchResults.totalPages
      }
    })
  }


  saveDeck() {
    let form = {
      cards: Object.values(this.synthese).map(card => {
        return {count: card.count, costAP: card.costAP, rarity: card.rarity, id: card.id, hightlight: card.hightlight}
      }),
      name: "nom du deck 1",
      god: this.god,
    }

    this.authenticatedApiService.saveDeck(form).subscribe(deckId => {
      console.log(deckId)
      const dialogRef = this.dialog.open(DeckCreatedPopinComponent, {
        width: '400px',
        height: '300px',
      });
      // @ts-ignore
      // dialogRef.afterClosed().subscribe(_ =>
      //   this.router.navigateByUrl(this.router.url.substring(0, this.router.url.indexOf("?")))
      // )
    })
  }

  pageUp() {
    if (!this.searchResults.last)
      this.form.get('pageNumber').setValue(+this.pageNumber + 1);
  }

  pageDown() {
    if (!this.searchResults.first) {
      this.form.get('pageNumber').setValue(+this.pageNumber - 1);
    }
  }

  pageSizeList = [
    {value: 8, viewValue: '8'},
    {value: 24, viewValue: '24'},
  ];


  // selectCardWrapper(card, event) {
  //   if (event.target.classList.contains("shaking")) {
  //     event.target.classList.remove("shaking");
  //     event.target.addEventListener("animationend", () => {
  //       this.selectCard(card, event);
  //     }, false);
  //   } else {
  //     this.selectCard(card, event);
  //   }
  //
  // }


  param;


  // handleEnd  c'est pas une "fonction"
  // c'est une arrowFunction
  // parce que sinon quand tu l'écris en fonction, le mot clé "this" dedans fait plus référence au reste du composant angular
  // mais fait référence au contexte au moment où tu l'as appelé, cad l'image
  // Bah connard si le this  en utilisant une function,c 'est l'image
  // pourquoi j'ai besoin de stocker en "param"
  // heu?

  selectCard(card, event) {
    this.param = event.target;
    this.param.addEventListener("animationend", this.handleEnd)
    // this.param.removeEventListener("animationend",  () => {
    //   this.selectCard(card, event);
    // }, false);
    // this.param.removeEventListener("animationend", () => {}, false);
    if (this.isDisabled(card)) {
      this.param.classList.add('shaking')
    } else {
      this.selectedCards.push(card);
      this.updateState();
    }
  }

  handleEnd = () => {
    this.param.classList.remove("shaking");
    this.param.removeEventListener("animationend", this.handleEnd)
  }


  isDisabled(card) {
    return this.lockedSisterInfinites.includes(card.infiniteName)
      || this.synthese && this.synthese[card.id]?.count == this.limitationNbrExemplaires[card.rarity]
      || this.syntheseRarete && this.syntheseRarete[card.rarity] == this.limitationRarete[card.rarity]
  }


  removeCard(cardId) {
    this.selectedCards.splice(this.selectedCards.findIndex(card => card.id === cardId), 1);
    this.updateState();
  }


  updateState() {
    this.regroupCards()
    this.computeCostSynthesis()
  }


  // https://stackoverflow.com/questions/44243060/use-enum-as-restricted-key-type
  // + const {CREA, SORT} = CardType;  Object destructuring pour écriture plus légère
  syntheseCost: { [key: number]: { [key in CardType]: number } } = {
    0: {[CREA]: 0, [SORT]: 0},
    1: {[CREA]: 0, [SORT]: 0},
    2: {[CREA]: 0, [SORT]: 0},
    3: {[CREA]: 0, [SORT]: 0},
    4: {[CREA]: 0, [SORT]: 0},
    5: {[CREA]: 0, [SORT]: 0},
    6: {[CREA]: 0, [SORT]: 0},
    7: {[CREA]: 0, [SORT]: 0}
  };

  computeCostSynthesis() {
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

    this.selectedCards.reduce((synthese, card) => {
      if (card.costAP >= 7) {
        synthese[7][CardType[card.cardType]] = synthese[7][CardType[card.cardType]] + 1
      } else {
        synthese[card.costAP][CardType[card.cardType]] = synthese[card.costAP][CardType[card.cardType]] + 1
      }
      return synthese;
    }, this.syntheseCost)

    this.max = Math.max(...Object.values(this.syntheseCost).map(v => v[CREA] + v[SORT]));

  }


  regroupCards() {
    // synthese est un objet vide dans lequel on va ajouter des clés (id de carte) et des valeurs (carte + count)
    this.synthese = {};
    this.lockedSisterInfinites = []
    this.syntheseRarete = {COMMUNE: 0, PEU_COMMUNE: 0, RARE: 0, KROSMIQUE: 0, INFINITE: 0}
    return this.selectedCards.reduce((synthese, card) => {
      if (card.infiniteName) {
        this.lockedSisterInfinites.push(card.infiniteName)
      }
      this.syntheseRarete[card.rarity] = this.syntheseRarete[card.rarity] + 1
      synthese[card.id] = synthese[card.id] ? {...synthese[card.id], count: synthese[card.id].count + 1} : {
        ...card,
        count: 1
      };
      return synthese;
    }, this.synthese)
  }


  // pour limiter le nombre d'exemplaire max d'une carte.
  // 3 pour tout le monde sauf les krosmiques / infinites à 1

  limitationNbrExemplaires = {
    COMMUNE: 3,
    PEU_COMMUNE: 3,
    RARE: 3,
    KROSMIQUE: 1,
    INFINITE: 1
  }

  // pour limiter les krosmiques à 7 et infintes à 5
  limitationRarete = {
    COMMUNE: -1,
    PEU_COMMUNE: -1,
    RARE: -1,
    KROSMIQUE: 7,
    INFINITE: 5
  }

  // pour bloquer les infinites du meme nom
  lockedSisterInfinites = []

  get isSpell() {
    return this.form.get('isSpell').value;
  }

  get isMinion() {
    return this.form.get('isMinion').value;
  }

  get apValue() {
    return this.form.get('apValue').value;
  }

  get atValue() {
    return this.form.get('atValue').value;
  }

  get hpValue() {
    return this.form.get('hpValue').value;
  }

  get mpValue() {
    return this.form.get('mpValue').value;
  }

  get content() {
    return this.form.get('content').value;
  }

  get godCards() {
    return this.form.get('godCards').value;
  }

  get neutralCards() {
    return this.form.get('neutralCards').value;
  }

  get rarity() {
    return this.form.get('rarity').value.key;
  }

  get pageNumber() {
    return this.form.get('pageNumber').value;
  }

  get pageSize() {
    return this.form.get('pageSize').value;
  }


  currentTab = 0;

  nextPrev(n) {
    this.currentTab += n
  }

}

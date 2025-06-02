import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Card} from '../models/card.model';
import {ApiService} from "../../api/api.service";
import {debounceTime, distinctUntilChanged} from "rxjs";
import {CardType, CREA, DEFAULT_CARD, God, SORT} from "../models/enums";
import {AuthenticatedApiService} from "../../api/authenticated-api.service";
import {MatDialog} from "@angular/material/dialog";
import {DeckCreatedPopinComponent} from "../../popins/deck-created-popin/deck-created-popin.component";
import {ActivatedRoute, Router} from "@angular/router";
import {StoreService} from "../../store.service";


@Component({
  selector: 'app-deckbuilder',
  templateUrl: './deckbuilder.component.html',
  styleUrl: './deckbuilder.component.scss'
})
export class DeckbuilderComponent implements OnInit, AfterViewInit {

  constructor(private apiService: ApiService,
              private authenticatedApiService: AuthenticatedApiService,
              private router: Router,
              private storeService: StoreService,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
  }

  // l'input id est fourni par la route en cas d'edit
  @Input() id: string
  @Input() version: number

  isUpdate = false
  isClone = false

  God = God;
  CARD_ILLUSTRATIONS
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
  synthesisAsList
  synthese: {
    [key: string]: {
      count: number,
      rarity: number,
      godType: any,
      costAP: any,
      cardFilePath: any,
      miniFilePath: any,
      id: any,
      name: string,
      highlight?: number
    }
  }
  syntheseRarete = { COMMUNE: 0, PEU_COMMUNE: 0, RARE: 0, KROSMIQUE: 0, INFINITE: 0 }
  god; // le dieu est une donnée fixée, pas dans le formulaire (pour swap neutre / dieu faut garder l'info)
  language: number; // language est comme le dieu, fixé par le site, pas un choix du formulaire
  deckForm: FormGroup;
  form: FormGroup;
  currentTab = 0;


  // pour bloquer les infinites du meme nom
  lockedSisterInfinites = []


  illustrationsNumber = 3
  selectedIndex = 0
  illustrations = [
    DEFAULT_CARD,
    DEFAULT_CARD,
    DEFAULT_CARD,
  ];

  selectedTags = []


  ngAfterViewInit() {
    this.initFromParams()
  }

  ngOnInit(): void {
    this.CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap()

    this.deckForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [])
    })

    this.form = new FormGroup({
      godCards: new FormControl(true),
      neutralCards: new FormControl(true),
      isSpell: new FormControl(true),
      isMinion: new FormControl(true),
      apValue: new FormControl(null),
      rarity: new FormControl({key: '-1', label: 'Toutes les raretés', color: 'color-all', bgColor: 'bg-color-all'},),
      content: new FormControl(''),
      language: new FormControl('FR'),
      // pagination
      pageNumber: new FormControl(0),
      pageSize: new FormControl(21),
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
      distinctUntilChanged(),
    ).subscribe(_ => this.getFilteredCards());
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
      language: "FR",
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
      deckId: this.id,
      cards: Object.values(this.synthese).map(card => {
        return {count: card.count, costAP: card.costAP, rarity: card.rarity, id: card.id, highlight: card.highlight}
      }),
      name: this.deckForm.get('name').value,
      description: this.deckForm.get('description').value,
      god: this.god,
      tags: this.selectedTags.map(tag => tag.id)
    }

    this.authenticatedApiService.saveDeck(form).subscribe(response => {
      const dialogRef = this.dialog.open(DeckCreatedPopinComponent, {
        // width: '400px',
        // height: '250px',
        panelClass: 'endModalCss',
        data: {deckId: response.deckId, isUpdate: this.isUpdate}
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate(['/decks/view', response.deckId, response.version])
        } else {
          this.router.navigate(['/home'])
        }

      });
    })
  }


  initFromParams() {
    this.route.queryParamMap.subscribe(params => {
      if (params.get("from")) {
        this.apiService.getDeck(params.get("from"), params.get("v"), "FR").subscribe(deck => {
          this.isClone = true // dans la réponse du deck => évite une erreur console
          this.initStateFromService(deck)
        })
      }
    })

    if (this.id) {
      this.apiService.getDeck(this.id, this.version, "FR").subscribe(deck => {
        this.isUpdate = true
        this.initStateFromService(deck)
      })
    }
  }

  initStateFromService(deck) {
    this.god = God[deck.god]
    this.currentTab = 1

    // faut ajouter chaque carte en autant d'exemplaires que son 'count'
    deck.cards.forEach(card => {
      for (let i = 0; i < card.count; i++) {
        this.selectedCards.push(card)
      }
    })

    deck.highlights.forEach(h => {
      this.selectedCards.find(c => c.id === h.cardId).highlight = h.highlightOrder
      this.illustrations[h.highlightOrder] = this.selectedCards.find(c => c.id === h.cardId);

    })

    this.illustrationsNumber = deck.highlights.length

    this.deckForm.get('name').setValue(deck.name)
    this.deckForm.get('description').setValue(deck.description);

    this.updateState()
    this.getFilteredCards()
  }


  pageUp() {
    if (!this.searchResults.last) {
      this.form.get('pageNumber').setValue(+this.pageNumber + 1);
    }
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

    // il faut prévoir que la carte retirée ne peut plus servir pour le highlight

    this.updateState();
  }


  updateState() {
    this.regroupCards()
    this.computeCostSynthesis()
  }

  smallScreenChange() {
    this.form.get('godCards').setValue(true)
    this.form.get('neutralCards').setValue(true)
    this.form.get('isSpell').setValue(true)
    this.form.get('isMinion').setValue(true)
    this.form.get('apValue').setValue(null)
    this.form.get('rarity').setValue({
      key: '-1',
      label: 'Toutes les raretés',
      color: 'color-all',
      bgColor: 'bg-color-all'
    })
    this.form.get('pageNumber').setValue(0)
    this.form.get('pageSize').setValue(10)
    this.form.get('atValue').setValue('')
    this.form.get('mpValue').setValue('')
    this.form.get('hpValue').setValue('')

    // content: new FormControl(''),
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
    this.selectedCards.reduce((synthese, card) => {
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

    this.synthesisAsList = Object.values(this.synthese).map(card => {
      return {
        name: card.name,
        id: card.id,
        rarity: card.rarity,
        godType: card.godType,
        miniFilePath: card.miniFilePath,
        cardFilePath: card.cardFilePath,
        highlight: card.highlight
      }
    })

  }


  // Méthodes pour la dernière section

  countDefaultCards(): number {
    return this.illustrations.filter(x => x === DEFAULT_CARD).length
  }

  illustDown() {
    if (this.illustrationsNumber > 0) {
      this.illustrations[this.illustrationsNumber - 1] = DEFAULT_CARD
      this.illustrationsNumber--
    }
    if (this.selectedIndex >= this.illustrationsNumber) {
      this.selectedIndex = this.illustrationsNumber - 1;
    }

  }

  illustUp() {
    if (this.illustrationsNumber < 3) {
      this.illustrationsNumber++
    }
    if (this.selectedIndex === -1) {
      this.selectedIndex = 0;
    }
  }

  selectIndex(index) {
    this.selectedIndex = index;
  }

  setCardAtIndex(card, index) {
    this.illustrations[index] = card;
    this.illustrations = [...this.illustrations]; // on affecte un nouveau tableau à la variable pour que le onChanges de cardDropdown se déclenche

    // on reset la carte précédente
    this.selectedCards.find(c => c.highlight === index) ? this.selectedCards.find(c => c.highlight === index).highlight = null : ''

    this.selectedCards.find(c => c.id === card.id).highlight = index
    this.updateState()
  }

  selectTag(tag) {
    this.selectedTags.push(tag);
  }

  removeTag(tag) {
    const index = this.selectedTags.findIndex(u => u.id === tag.id)
    this.selectedTags.splice(index, 1)
  }


  nextPrev(n) {
    this.currentTab += n
  }


  sidenavOpened = false

  openNav() {
    this.sidenavOpened = true
    // document.getElementById("mySidenav").style.width = "250px";
  }

  closeNav() {
    this.sidenavOpened = false
    // document.getElementById("mySidenav").style.width = "0";
  }

  // @HostListener('window:resize', ['$event'])
  // onResize(event) {
  // }


  ////////////////////////////////////////
  /**            CONSTANTS              */
    ////////////////////////////////////////

    // pour limiter le nombre d'exemplaires max d'une carte.
    // 3 pour tout le monde sauf les krosmiques / infinites à 1

  limitationNbrExemplaires = {
    COMMUNE: 3,
    PEU_COMMUNE: 3,
    RARE: 3,
    KROSMIQUE: 1,
    INFINITE: 1
  }

  // pour limiter les krosmiques à 7 et infinites à 5
  limitationRarete = {
    COMMUNE: -1,
    PEU_COMMUNE: -1,
    RARE: -1,
    KROSMIQUE: 7,
    INFINITE: 5
  }

  quillConfiguration = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      // [{list: 'ordered'}, {list: 'bullet'}],
      [{
        header: [1, 2, 3,
          // 4, 5, 6,
          false]
      }],
      [{color: []}, {background: []}],
      // ['link'],
      ['clean'],
    ],
  }


  ////////////////////////////////////////
  /**            GETTERS                */
  ////////////////////////////////////////


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
}

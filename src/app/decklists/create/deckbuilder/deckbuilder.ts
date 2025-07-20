import {AfterViewInit, Component, inject, input, OnInit, signal} from '@angular/core';
import {DeckCreatedPopin} from '../../../popins/deck-created-popin/deck-created-popin';
import {CardType, CREA, DEFAULT_CARD, God, SORT} from '../../common/models/enums';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {Card} from '../../common/models/card.model';
import {ApiService} from '../../../api/api.service';
import {AuthenticatedApiService} from '../../../api/authenticated-api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {StoreService} from '../../../store.service';
import {MatDialog} from '@angular/material/dialog';
import {Section} from '../../../base/section/section';
import {NgClass, NgStyle, NgTemplateOutlet} from '@angular/common';
import {FilterForm} from '../filter-form/filter-form';
import {CardDropdownFromList} from '../card-dropdown-from-list/card-dropdown-from-list';
import {TagDropdown} from '../../common/tag-dropdown/tag-dropdown';
import {SelectedList} from '../selected-list/selected-list';
import {QuillEditorComponent} from 'ngx-quill';
import {Pagination} from '../../../base/pagination/pagination';
import {VideoValidator} from "../../../base/models/utils";
import {MatError} from "@angular/material/input";

@Component({
  selector: 'app-deckbuilder',
  imports: [
    Section,
    NgClass,
    NgStyle,
    ReactiveFormsModule,
    FilterForm,
    TagDropdown,
    SelectedList,
    QuillEditorComponent,
    NgTemplateOutlet,
    CardDropdownFromList,
    Pagination,
    MatError,
  ],
  templateUrl: './deckbuilder.html',
  styleUrl: './deckbuilder.scss'
})
export class Deckbuilder implements OnInit, AfterViewInit {
  apiService = inject(ApiService);
  authenticatedApiService = inject(AuthenticatedApiService);
  router = inject(Router);
  storeService = inject(StoreService);
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);

  disableSaveButton = false

  // l'input id est fourni par la route en cas d'edit
  id = input<string>()
  version = input<number>();
  isUpdate = false
  isClone = false

  God = God;
  CARD_ILLUSTRATIONS
  max: number
  displayedCards = signal<Card[]>([]);
  searchResults: {
    pageNumber: number,
    empty: boolean,
    first: boolean
    last: boolean,
    totalElements: number,
    totalPages: number
  }

  selectedCards: Card[] = [];
  synthesisAsList = []
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
  currentApCost = 0;
  syntheseRarete = {COMMUNE: 0, PEU_COMMUNE: 0, RARE: 0, KROSMIQUE: 0, INFINITE: 0}
  god: number; // le dieu est une donnée fixée, pas dans le formulaire (pour swap neutre / dieu faut garder l'info)
  language: number; // language est comme le dieu, fixé par le site, pas un choix du formulaire

  videoLinkData = {type: null}

  deckForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    videoLink: new FormControl('', {
      asyncValidators: [VideoValidator.createValidator(this.apiService, this.videoLinkData)]
    }),
    description: new FormControl('', [])
  })

  form = new FormGroup({
    godCards: new FormControl(true),
    neutralCards: new FormControl(true),
    isSpell: new FormControl(true),
    isMinion: new FormControl(true),
    apValue: new FormControl(null),
    rarity: new FormControl({key: -1, label: 'Toutes les raretés', color: 'color-all', bgColor: 'bg-color-all'},),
    content: new FormControl(''),
    language: new FormControl('FR'),
    // pagination
    pageNumber: new FormControl(0),
    pageSize: new FormControl(21),
    // Pour plus tard
    atValue: new FormControl(null),
    mpValue: new FormControl(null),
    hpValue: new FormControl(null),
    extension: new FormControl(''),
  });

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

  selectedTags = signal<any>([])
  allTags = signal<any>([])


  constructor() {
    this.CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap()
  }

  ngAfterViewInit() {
    this.initFromParams()
  }

  ngOnInit(): void {
    this.apiService.getTagsByLanguage("FR").subscribe(tags => {
      this.allTags.set(tags);
    })

    this.form.valueChanges.pipe(
      // Annule les doubles appels quand une modif du formulaire en déclenche une autre.
      // Exemple : décocher sort et créa recoche une valeur, les filtres forcent la page 0
      debounceTime(50),
      distinctUntilChanged(),
    ).subscribe(_ => this.getFilteredCards());
  }

  selectGod(index: number) {
    this.god = index;
    this.selectedCards = []
    this.updateState()
    this.getFilteredCards()
  }

  // Envisager de passer de 2 champs minion/spell à un champ TYPE qui vaut Minion/Spell directement
  getFilteredCards() {
    let type: CardType | null = null;
    if (this.isMinion && !this.isSpell) type = CardType.CREA;
    if (this.isSpell && !this.isMinion) type = CardType.SORT;

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
      name: this.content ? this.content : null,
      description: this.content ? this.content : null,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize

    }).subscribe(searchResults => {
      this.displayedCards.set(searchResults.content)
      this.searchResults = {
        pageNumber: searchResults.pageable.pageNumber,
        empty: searchResults.empty,
        first: searchResults.first,
        last: searchResults.last,
        totalElements: searchResults.totalElements,
        totalPages: searchResults.totalPages
      }
    })

  }

  saveDeck() {
    this.disableSaveButton = true;
    let form = {
      deckId: this.id(),
      cards: Object.values(this.synthese).map(card => {
        return {count: card.count, costAP: card.costAP, rarity: card.rarity, id: card.id, highlight: card.highlight}
      }),
      name: this.deckForm.get('name').value,
      videoLink: this.videoLinkControl.value,
      description: this.deckForm.get('description').value.replace(/&nbsp;/g, ' ').replaceAll(/(?=\s)[^\r\n\t]/g, ' '),
      god: this.god,
      tags: this.selectedTags().map(tag => tag.id)
    }

    this.authenticatedApiService.saveDeck(form).subscribe(response => {
      const dialogRef = this.dialog.open(DeckCreatedPopin, {
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
        this.apiService.getDeck({id: params.get("from"), version: +params.get("v"), language: 'FR'}).subscribe(deck => {
          this.isClone = true // dans la réponse du deck => évite une erreur console
          this.initStateFromService(deck)
        })
      }
    })

    if (this.id()) {
      this.apiService.getDeck({id: this.id(), version: this.version(), language: "FR"}).subscribe(deck => {
        this.storeService.getUser().subscribe(user => {
          if (deck.owner != user.username) {
            this.router.navigate(['/home']);
          } else {
            this.isUpdate = true
            this.initStateFromService(deck)
          }
        })
      })
    }
  }

  initStateFromService(deck) {
    this.god = +God[deck.god]
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

    this.selectedTags.set(deck.tags)

    this.illustrationsNumber = deck.highlights.length

    this.deckForm.get('name').setValue(deck.name)
    this.deckForm.get('description').setValue(deck.description);
    this.deckForm.get('videoLink').setValue(deck.videoLink);

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

  pageSet(value) {
    this.form.get('pageNumber').setValue(+value - 1);
  }

  param;

  selectCard(card, event) {
    this.param = event.target;
    this.param.addEventListener("animationend", this.handleEnd)
    if (this.isDisabled(card)) {
      this.param.classList.add('shaking')
    } else {
      this.param.classList.add('pulsing')
      this.selectedCards.push(card);
      this.updateState();
    }
  }

  handleEnd = () => {
    this.param.classList.remove("shaking");
    this.param.classList.remove('pulsing')
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

    if (!this.synthese[cardId]) {
      const highlightId = this.illustrations.findIndex(card => card.id === cardId)
      if (highlightId != -1) {
        this.illustrations[highlightId] = DEFAULT_CARD
      }
    }
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
      key: -1,
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

    this.currentApCost = 0;
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
      this.currentApCost += card.costAP;
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
      if (this.synthese[this.illustrations[this.illustrationsNumber - 1].id]) {
        this.synthese[this.illustrations[this.illustrationsNumber - 1].id].highlight = null;
      }
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
    this.selectedTags.update(values => {
      return [...values, tag];
    });
  }

  removeTag(tag) {
    this.selectedTags.update(values => {
      const index = values.findIndex(u => u.id === tag.id)
      values.splice(index, 1)
      return [...values];
    });
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

  get atValue(): number {
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

  get rarity(): number {
    return this.form.get('rarity').value.key;
  }

  get pageNumber() {
    return this.form.get('pageNumber').value;
  }

  get pageSize() {
    return this.form.get('pageSize').value;
  }

  get videoLinkControl() {
    return this.deckForm.get('videoLink');
  }
}

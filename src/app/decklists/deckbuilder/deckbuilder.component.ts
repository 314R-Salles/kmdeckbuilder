import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Card} from '../card.model';

@Component({
  selector: 'app-deckbuilder',
  templateUrl: './deckbuilder.component.html',
  styleUrl: './deckbuilder.component.scss'
})
export class DeckbuilderComponent implements OnInit {
  displayedCards: Card[] = [];
  selectedCards: Card[] = [];
  synthese: { [key: string]: {count: number, rarity: number, god: any, name: string } }
  syntheseRarete: { 0: number, 1: number, 2: number, 3: number, 4: number }
  god = 5; // le dieu est une donnée fixée, pas dans le formulaire (pour swap neutre / dieu faut garder l'info)
  language: number; // language est comme le dieu, fixé par le site, pas un choix du formulaire
  form: FormGroup;


  testCards = [

    {
      id: 1,
      god: 0,
      name: 'julith jurgen',
      atk: 1,
      cost: 1,
      health: 1,
      mp: 1,
      isSpell: false,
      rarity: 4,
      idInfinite: 999,
      imageLink: '/assets/julith_jurgen_niveau_1.png'
    },
    {
      id: 2,
      god: 0,
      name: 'julith jurgen',
      atk: 2,
      cost: 2,
      health: 2,
      mp: 2,
      isSpell: false,
      rarity: 4,
      idInfinite: 999,
      imageLink: '/assets/julith_jurgen_niveau_2.png'
    },
    {
      id: 3,
      god: 0,
      name: 'julith jurgen',
      atk: 3,
      cost: 3,
      health: 3,
      mp: 3,
      isSpell: false,
      rarity: 4,
      idInfinite: 999,
      imageLink: '/assets/julith_jurgen_niveau_3.png'
    },
    {
      id: 4,
      god: 0,
      name: 'gros bouf',
      atk: 3,
      cost: 3,
      health: 3,
      mp: 3,
      isSpell: false,
      rarity: 2,
      imageLink: '/assets/bouftou_royal.png'
    },
    {
      id: 5,
      god: 3,
      name: 'betty_boubz',
      atk: 3,
      cost: 3,
      health: 3,
      mp: 3,
      isSpell: false,
      rarity: 1,
      imageLink: '/assets/betty_boubz.png'
    },
    {
      id: 6,
      god: 4,
      name: 'archille',
      atk: 3,
      cost: 3,
      health: 3,
      mp: 3,
      isSpell: false,
      rarity: 2,
      imageLink: '/assets/archille.png'
    },
    {
      id: 7,
      god: 5,
      name: 'arbre_a_chachas',
      atk: 3,
      cost: 3,
      health: 3,
      mp: 3,
      isSpell: false,
      rarity: 2,
      imageLink: '/assets/arbre_a_chachas.png'
    },
    {
      id: 8,
      god: 0,
      name: 'pas julith  ',
      atk: 1,
      cost: 1,
      health: 1,
      mp: 1,
      isSpell: false,
      rarity: 4,
      imageLink: '/assets/julith_jurgen_niveau_1.png'
    },
  ]


  ngOnInit(): void {
    this.form = new FormGroup({
      // en place à l'écran
      godCards: new FormControl(true),
      neutralCards: new FormControl(true),
      isSpell: new FormControl(true),
      isMinion: new FormControl(true),
      apValue: new FormControl(null),
      rarity: new FormControl({key: -1, value: 'All', bgColor: 'bg-color-all', color: 'color-all'}),
      content: new FormControl(''),
      language: new FormControl('FR'),
      // pagination
      pageNumber: new FormControl('0'),
      pageSize: new FormControl('8'),
      // Pour plus tard
      atValue: new FormControl(''),
      mpValue: new FormControl(''),
      hpValue: new FormControl(''),
      extension: new FormControl(''),
    });

    this.form.valueChanges.subscribe(_ => this.getFilteredCards())
  }

  // Envisager de passer de 2 champs minion/spell à un champ TYPE qui vaut Minion/Spell directement
  getFilteredCards() {
    let type: string;
    if (this.isMinion && this.isSpell) {
      type = null;
    } else {
      if (this.isMinion) type = 'Minion';
      if (this.isSpell) type = 'Spell';
    }
    // Pour gérer les options X+ on définit un Min Max
    // Exemple si selection 7+, alors min 7 et max null pour dire pas de max
    const apMin = this.apValue;
    const apMax = this.apValue === 7 ? null : this.apValue;

    const atMin = this.atValue;
    const atMax = this.atValue === 7 ? null : this.atValue;

    const hpMin = this.hpValue;
    const hpMax = this.hpValue === 7 ? null : this.hpValue;

    const mpMin = this.mpValue;
    const mpMax = this.mpValue === 5 ? null : this.mpValue;

    // c'est pas la responsabilité du front d'ajouter des % LIKE
    // const content = (this.content === '' || this.content === undefined) ? null : '%' + this.content + '%';

    const form = {
      type: type,
      hpGreaterThan: hpMin,
      hpLessThan: hpMax,
      apGreaterThan: apMin,
      apLessThan: apMax,
      mpGreaterThan: mpMin,
      mpLessThan: mpMax,
      atGreaterThan: atMin,
      atLessThan: atMax,
      god: this.godCards ? this.god : null, // si cartes dieux, passer dieu, sinon vide
      neutral: this.neutralCards,
      rarity: (this.rarity === -1) ? null : this.rarity,
      extension: null,
      language: 'FR',
      content: this.content,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    }


    // this.apiService.searchCards()
  }


  pageUp() { // ce if doit etre dans le html pour disable le champ.
    if (this.displayedCards.length > this.pageSize * (this.pageNumber + 1))
      this.form.get('pageNumber').setValue(this.pageNumber + 1);
    // this.getFilteredCards(); // devrait se rafraichir via le subscribe valueChange
  }

  pageDown() {
    if (this.pageNumber > 0) {
      this.form.get('pageNumber').setValue(this.pageNumber - 1);
    }
  }

  pageSizeList = [
    {value: 8, viewValue: '8'},
    {value: 24, viewValue: '24'},
  ];


  selectCard(card) {
    this.selectedCards.push(card);
    this.updateState();
  }

  removeCard(cardId) {
    this.selectedCards.splice(this.selectedCards.findIndex(card => card.id === cardId),1);
    this.updateState();
  }


  updateState() {
    this.regroupCards()
  }


  regroupCards() {
    // synthese est un objet vide dans lequel on va ajouter des clés (id de carte) et des valeurs (carte + count)
    this.synthese = {};
    this.lockedSisterInfinites = []
    this.syntheseRarete = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0}
    return this.selectedCards.reduce((synthese, card) => {
      if (card.idInfinite) {
        this.lockedSisterInfinites.push(card.idInfinite)
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
    0: 3,
    1: 3,
    2: 3,
    3: 1,
    4: 1
  }

  // pour limiter les krosmiques à 7 et infintes à 5
  limitationRarete = {
    0: -1,
    1: -1,
    2: -1,
    3: 7,
    4: 5
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
}

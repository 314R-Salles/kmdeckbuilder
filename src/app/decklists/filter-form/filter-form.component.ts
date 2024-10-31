import {Component, OnInit} from '@angular/core';
import {Card} from "../card.model";
import {ApiService} from "../../api/api.service";
import {CardFilterForm} from "../card.filter.form";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-filter-form',
  templateUrl: './filter-form.component.html',
  styleUrls: ['./filter-form.component.scss']
})
export class FilterFormComponent implements OnInit {

  displayedCards: Card[];
  god = -1;
  pageNumber = 0;
  pageContent = 10;
  atValue = null;
  mpValue = null;
  hpValue = null;
  language: number;
  rarity = -1;
  extension: number;
  content: string;


  typeChange(type: string) {
    switch (type) {
      case 'sort':
        this.form.get('isSpell')?.setValue(!this.form.get('isSpell')!.value);
        if (!this.form.get('isSpell')?.value && !this.form.get('isMinion')?.value) {
          this.form.get('isMinion')?.setValue(true)
        }
        break;
      case 'crea':
        this.form.get('isMinion')?.setValue(!this.form.get('isMinion')!.value);
        if (!this.form.get('isSpell')?.value && !this.form.get('isMinion')?.value) {
          this.form.get('isSpell')?.setValue(true)
        }
        break;
    }


  }

  apSelect(ap: number) {
    if (this.form.get('apValue')?.value == ap) {
      this.form.get('apValue')?.setValue(null);
    } else {
      this.form.get('apValue')?.setValue(ap);

    }
  }

  raritySelect(rarity: { key: any; value: any }) {
    this.form.get('rarity')?.setValue(rarity);
  }


  godList = [
    {value: -1, viewValue: 'All'},
    {value: 0, viewValue: 'Neutral'},
    {value: 1, viewValue: 'Iop'},
    {value: 2, viewValue: 'Cra'},
    {value: 3, viewValue: 'Eniripsa'},
    {value: 4, viewValue: 'Ecaflip'},
    {value: 5, viewValue: 'Enutrof'},
    {value: 6, viewValue: 'Sram'},
    {value: 7, viewValue: 'Xelor'},
    {value: 8, viewValue: 'Sacrieur'},
    {value: 9, viewValue: 'Feca'},
    {value: 10, viewValue: 'Sadida'},
  ];

  rarityList = [
    {key: -1, value: 'All', bgColor: 'bg-color-all', color: 'color-all'},
    {key: 0, value: 'Common', bgColor: 'bg-color-common', color: 'color-common'},
    {key: 1, value: 'Uncommon', bgColor: 'bg-color-uncommon', color: 'color-uncommon'},
    {key: 2, value: 'Rare', bgColor: 'bg-color-rare', color: 'color-rare'},
    {key: 3, value: 'Krosmique', bgColor: 'bg-color-krosmique', color: 'color-krosmique'},
    {key: 4, value: 'Infinite', bgColor: 'bg-color-infinite', color: 'color-infinite'},
  ];

  pageContentList = [
    {value: 5, viewValue: '5'},
    {value: 10, viewValue: '10'},
  ];

  form: FormGroup;

  constructor(private apiService: ApiService) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      isSpell: new FormControl(true),
      isMinion: new FormControl(true),
      god: new FormControl(''),
      pageNumber: new FormControl(''),
      pageContent: new FormControl(''),
      apValue: new FormControl(null),
      atValue: new FormControl(''),
      mpValue: new FormControl(''),
      hpValue: new FormControl(''),
      language: new FormControl(''),
      rarity: new FormControl( {key: -1, value: 'All', bgColor: 'bg-color-all', color: 'color-all'}),
      extension: new FormControl(''),
      content: new FormControl(''),
    });
    this.getFilteredCards();
  }

  get isSpell() {
    return this.form.get('isSpell')!.value;
  }

  get isMinion() {
    return this.form.get('isMinion')!.value;
  }

  get apValue() {
    return this.form.get('apValue')!.value;
  }


  getFilteredCards() {
    let isSpellFilter: boolean | null;
    if (this.isMinion || this.isSpell) {
      if (this.isMinion && this.isSpell) {
        // Créa et sorts donc pas de filtre
        isSpellFilter = null;
      } else {
        isSpellFilter = this.isSpell;
      }
      // si selection 7+, alors min 7 et max null pour dire pas de max
      const apMin = this.apValue;
      const apMax = this.apValue === 7 ? null : this.apValue;

      const atMin = this.atValue;
      const atMax = this.atValue === 7 ? null : this.atValue;

      const hpMin = this.hpValue;
      const hpMax = this.hpValue === 7 ? null : this.hpValue;

      const mpMin = this.mpValue;
      const mpMax = this.mpValue === 5 ? null : this.mpValue;

      const content = (this.content === '' || this.content === undefined) ? null : '%' + this.content + '%';

      const form = new CardFilterForm(isSpellFilter,
        hpMin,
        hpMax,
        apMin,
        apMax,
        mpMin,
        mpMax,
        atMin,
        atMax,
        (this.god === -1) ? null : this.god,
        (this.rarity === -1) ? null : this.rarity,
        null,
        0,
        content,
        this.pageNumber,
        this.pageContent);
      // this.apiService.loadCards(form).subscribe(
      //   data => this.displayedCards = data
      // );
    } else {
      this.displayedCards = [];
    }
  }


  resetGod() {
    if (this.rarity === 4) {
      this.god = -1;
    }
  }

  resetRarity() {
    if (this.rarity === 4) {
      this.rarity = -1;
    }
  }

  pageUp() {
    this.pageNumber++;
    this.getFilteredCards();
  }

  pageDown() {
    if (this.pageNumber > 0) {
      this.pageNumber--;
      this.getFilteredCards();
    }
  }

  resetPage() {
    this.pageNumber = 0;
  }

}

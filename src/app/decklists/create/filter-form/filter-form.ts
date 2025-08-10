import {Component, input, OnInit} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {God} from '../../common/models/enums';
import {NgClass} from '@angular/common';
import {MatTooltip} from '@angular/material/tooltip';
import {PaDropdown} from "../pa-dropdown/pa-dropdown";
import {RarityDropdown} from "../rarity-dropdown/rarity-dropdown";

@Component({
  selector: 'app-filter-form',
  imports: [
    ReactiveFormsModule,
    NgClass,
    MatTooltip,
    PaDropdown,
    RarityDropdown,
  ],
  templateUrl: './filter-form.html',
  styleUrl: './filter-form.scss'
})
export class FilterForm  implements OnInit   {
  form = input.required<FormGroup>();
  god = input.required<number>();

  ngOnInit() {
    this.form().get('content').valueChanges.subscribe(_ => {this.resetPage()})
  }

  God = God;

  displayDropdownRarity = false
  displayDropdownPA = false
  // Changer des fitlres en entete doit remettre la pagination à 0
  resetPage() {
    this.form().get('pageNumber').setValue(0);
  }

  factionChange(type: string) {
    this.resetPage()
    switch (type) {
      case 'dieu':
        this.form().get('godCards').setValue(!this.form().get('godCards').value);
        if (!this.form().get('godCards').value && !this.form().get('neutralCards').value) {
          this.form().get('neutralCards').setValue(true)
        }
        break;
      case 'neutre':
        this.form().get('neutralCards').setValue(!this.form().get('neutralCards').value);
        if (!this.form().get('godCards').value && !this.form().get('neutralCards').value) {
          this.form().get('godCards').setValue(true)
        }
        break;
    }
  }

  typeChange(type: string) {
    this.resetPage()
    switch (type) {
      case 'sort':
        this.form().get('isSpell').setValue(!this.form().get('isSpell').value);
        if (!this.form().get('isSpell').value && !this.form().get('isMinion').value) {
          this.form().get('isMinion').setValue(true)
        }
        break;
      case 'crea':
        this.form().get('isMinion').setValue(!this.form().get('isMinion').value);
        if (!this.form().get('isSpell').value && !this.form().get('isMinion').value) {
          this.form().get('isSpell').setValue(true)
        }
        break;
    }

  }

  setFilterValue(filter: string, value: any) {
    this.resetPage()
    if (this.form().get(filter)?.value == value) {
      this.form().get(filter)?.setValue(null);
    } else {
      this.form().get(filter)?.setValue(value);
    }
  }

  raritySelect(rarity: any) {
    this.resetPage()
    this.form().get('rarity').setValue(rarity);
    this.displayDropdownRarity = false;
    this.displayDropdownPA = false;
  }

  costs = [
    {value: 0, label: '0'},
    {value: 1, label: '1'},
    {value: 2, label: '2'},
    {value: 3, label: '3'},
    {value: 4, label: '4'},
    {value: 5, label: '5'},
    {value: 6, label: '6'},
    {value: 7, label: '7+'},
  ];

  constructor() {
  }

  get isSpell() {
    return this.form().get('isSpell').value;
  }

  get isMinion() {
    return this.form().get('isMinion').value;
  }

  get apValue() {
    console.log(this.form().get('apValue').value)
    return this.form().get('apValue').value;
  }

  /// zzz?
  tooltipType = {
    fr_minion_hide: 'Masquer les invocations',
    fr_minion_show: 'Afficher les invocations',
    fr_spell_hide: 'Masquer les sorts',
    fr_spell_show: 'Afficher les sorts',
    en_minion_hide: 'Hide Minions',
    en_minion_show: 'Show Minions',
    en_spell_hide: 'Hide spells',
    en_spell_show: 'Show spells',
    br_minion_hide: 'Ocultar invocações',
    br_minion_show: 'Exibir invocações',
    br_spell_hide: 'Ocultar feitiços',
    br_spell_show: 'Exibir feitiços',
    es_minion_hide: 'Ocultar las invocaciones',
    es_minion_show: 'Mostrar las invocaciones',
    es_spell_hide: 'Ocultar los hechizos',
    es_spell_show: 'Mostrar los hechizos',
    ru_minion_hide: 'Скрыть существ',
    ru_minion_show: 'Показать существ',
    ru_spell_hide: 'Скрыть заклинания',
    ru_spell_show: 'Показать заклинания',
  }

  rarities = {
    fr: [
      {key: '-1', label: 'Toutes les raretés', color: '', bgColor: ''},
      {key: '0', label: 'Commune', color: 'color-common', bgColor: 'bg-color-common'},
      {key: '1', label: 'Peu Commune', color: 'color-uncommon', bgColor: 'bg-color-uncommon'},
      {key: '2', label: 'Rare', color: 'color-rare', bgColor: 'bg-color-rare'},
      {key: '3', label: 'Krosmique', color: 'color-krosmique', bgColor: 'bg-color-krosmique'},
      {key: '4', label: 'Infinite', color: 'color-infinite', bgColor: 'bg-color-infinite'},
    ],
    en: {
      '0': {label: 'Common', color: 'color-common', bgColor: 'bg-color-common'},
      '2': {label: 'Rare', color: 'color-rare', bgColor: 'bg-color-rare'},
      '4': {label: 'Infinite', color: 'color-infinite', bgColor: 'bg-color-infinite'},
      '3': {label: 'Krosmic', color: 'color-krosmique', bgColor: 'bg-color-krosmique'},
      '1': {label: 'Uncommon', color: 'color-uncommon', bgColor: 'bg-color-uncommon'},
      '-1': {label: 'All rarities', color: '', bgColor: ''},
    },
    br: {
      '0': {label: 'Comum', color: 'color-common', bgColor: 'bg-color-common'},
      '2': {label: 'Rara', color: 'color-rare', bgColor: 'bg-color-rare'},
      '4': {label: 'Infinita', color: 'color-infinite', bgColor: 'bg-color-infinite'},
      '3': {label: 'Krósmica', color: 'color-krosmique', bgColor: 'bg-color-krosmique'},
      '1': {label: 'Incomum', color: 'color-uncommon', bgColor: 'bg-color-uncommon'},
      '-1': {label: 'Todas as raridades', color: '', bgColor: ''},
    },
    es: {
      '0': {label: 'Común', color: 'color-common', bgColor: 'bg-color-common'},
      '2': {label: 'Rara', color: 'color-rare', bgColor: 'bg-color-rare'},
      '4': {label: 'Infinita', color: 'color-infinite', bgColor: 'bg-color-infinite'},
      '3': {label: 'Krósmica', color: 'color-krosmique', bgColor: 'bg-color-krosmique'},
      '1': {label: 'Poco común', color: 'color-uncommon', bgColor: 'bg-color-uncommon'},
      '-1': {label: 'Todos los tipos de carta', color: '', bgColor: ''}
    },
    ru: {
      '0': {label: 'Обычная', color: 'color-common', bgColor: 'bg-color-common'},
      '2': {label: 'Редкая', color: 'color-rare', bgColor: 'bg-color-rare'},
      '4': {label: 'Запредельная', color: 'color-infinite', bgColor: 'bg-color-infinite'},
      '3': {label: 'Кросмическая', color: 'color-krosmique', bgColor: 'bg-color-krosmique'},
      '1': {label: 'Необычная', color: 'color-uncommon', bgColor: 'bg-color-uncommon'},
      '-1': {label: 'Любая редкость', color: '', bgColor: ''},
    }

  }

}

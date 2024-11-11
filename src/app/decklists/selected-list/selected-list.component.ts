import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-selected-list',
  templateUrl: './selected-list.component.html',
  styleUrl: './selected-list.component.scss'
})
export class SelectedListComponent {

  // updatedSynthese: { [key: string]: { count: number, rarity: any, god: any, name: string } }
  updatedSynthese: any[]

  // l'input est fourni par la route
  @Input() set synthese(value: { [key: string]: { count: number, rarity: any, god: any, name: string } }) {
    if (value) {
      for (const key in value) {
        value[key].god = this.godList.find(a => a.value === value[key].god).name;
        value[key].rarity = this.rarityList.find(a => a.key === value[key].rarity).value;
      }
      this.updatedSynthese = Object.values(value)

      let godCards = this.updatedSynthese.filter(a => a.god !== 'neutre')
      let neutralCards = this.updatedSynthese.filter(a => a.god === 'neutre')

      godCards.sort((a, b) => a.cost - b.cost);
      neutralCards.sort((a, b) => a.cost - b.cost);

      this.updatedSynthese = [];
      this.updatedSynthese.push(...godCards)
      this.updatedSynthese.push(...neutralCards)

    }
  }

  @Output() removeCard = new EventEmitter<string>();

  remove(key: string) {
    this.removeCard.emit(key)
  }

  godList = [
    {value: 0, name: 'neutre'},
    {value: 1, name: 'iop'},
    {value: 2, name: 'cra'},
    {value: 3, name: 'eniripsa'},
    {value: 4, name: 'ecaflip'},
    {value: 5, name: 'enutrof'},
    {value: 6, name: 'sram'},
    {value: 7, name: 'xelor'},
    {value: 8, name: 'sacrieur'},
    {value: 9, name: 'feca'},
    {value: 10, name: 'sadida'},
  ];


  rarityList = [
    {key: 0, value: 'common'},
    {key: 1, value: 'uncommon'},
    {key: 2, value: 'rare'},
    {key: 3, value: 'krosmique'},
    {key: 4, value: 'infinite'},
  ];


}



import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-selected-list',
  templateUrl: './selected-list.component.html',
  styleUrl: './selected-list.component.scss'
})
export class SelectedListComponent {

  updatedSynthese: any[]

  @Input() max
  @Input() syntheseCost


  // l'input est fourni par la route
  @Input() set synthese(value: { [key: string]: { count: number, rarity: any, godType: any, name: string } }) {
    if (value) {
      for (const key in value) {
        // value[key].godType = this.godList.find(a => a.value === value[key].godType).name;
        // value[key].rarity = this.rarityList.find(a => a.key === value[key].rarity).value;
      }
      this.updatedSynthese = Object.values(value)

      let godCards = this.updatedSynthese.filter(a => a.godType !== 'NEUTRE')
      let neutralCards = this.updatedSynthese.filter(a => a.godType === 'NEUTRE')

      godCards.sort((a, b) => a.costAP - b.costAP);
      neutralCards.sort((a, b) => a.costAP - b.costAP);

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
    {value: 0, name: 'NEUTRE'},
    {value: 1, name: 'IOP'},
    {value: 2, name: 'CRA'},
    {value: 3, name: 'ENIRIPSA'},
    {value: 4, name: 'ECAFLIP'},
    {value: 5, name: 'ENUTROF'},
    {value: 6, name: 'SRAM'},
    {value: 7, name: 'XELOR'},
    {value: 8, name: 'SACRIEUR'},
    {value: 9, name: 'FECA'},
    {value: 10, name: 'SADIDA'},
  ];


  rarityList = [
    {key: 0, value: 'COMMUNE'},
    {key: 1, value: 'PEU_COMMUNE'},
    {key: 2, value: 'RARE'},
    {key: 3, value: 'KROSMIQUE'},
    {key: 4, value: 'INFINITE'},
  ];


}



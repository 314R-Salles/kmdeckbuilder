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

}



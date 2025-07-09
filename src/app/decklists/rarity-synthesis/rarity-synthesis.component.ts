import {Component, Input} from '@angular/core';
import {CardRarity, CardType, COMMUNE, INFINITE, KROSMIQUE, PEU_COMMUNE, RARE} from "../models/enums";


@Component({
    selector: 'app-rarity-synthesis',
    templateUrl: './rarity-synthesis.component.html',
    styleUrl: './rarity-synthesis.component.scss',
    standalone: false
})
export class RaritySynthesisComponent {

  @Input() raritySynthesis

  rarities = {
    fr: [
      {key: COMMUNE, label: 'Commune', color: 'color-common', bgColor: 'bg-color-common'},
      {key: PEU_COMMUNE, label: 'Peu Commune', color: 'color-uncommon', bgColor: 'bg-color-uncommon'},
      {key: RARE, label: 'Rare', color: 'color-rare', bgColor: 'bg-color-rare'},
      {key: KROSMIQUE, label: 'Krosmique', color: 'color-krosmique', bgColor: 'bg-color-krosmique'},
      {key: INFINITE, label: 'Infinite', color: 'color-infinite', bgColor: 'bg-color-infinite'},
    ]
  }
}

import {Component, input} from '@angular/core';
import {COMMUNE, INFINITE, KROSMIQUE, PEU_COMMUNE, RARE, SORT, CREA} from '../../common/models/enums';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-rarity-synthesis',
  imports: [
    NgClass
  ],
  templateUrl: './rarity-synthesis.html',
  styleUrl: './rarity-synthesis.scss'
})
export class RaritySynthesis {

 raritySynthesis = input<any>();

  rarities = {
    fr: [
      {key: COMMUNE, label: 'Commune', color: 'color-common', bgColor: 'bg-common'},
      {key: PEU_COMMUNE, label: 'Peu Commune', color: 'color-uncommon', bgColor: 'bg-uncommon'},
      {key: RARE, label: 'Rare', color: 'color-rare', bgColor: 'bg-rare'},
      {key: KROSMIQUE, label: 'Krosmique', color: 'color-krosmique', bgColor: 'bg-krosmique'},
      {key: INFINITE, label: 'Infinite', color: 'color-infinite', bgColor: 'bg-infinite'},
    ]
  }

  cardType = [{ key: CREA }, { key: SORT }]
}

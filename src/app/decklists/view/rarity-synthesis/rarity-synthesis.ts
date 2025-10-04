import {Component, input} from '@angular/core';
import {COMMUNE, INFINITE, KROSMIQUE, PEU_COMMUNE, RARE, SORT, CREA} from '../../common/models/enums';
import {NgClass} from '@angular/common';
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-rarity-synthesis',
  imports: [
    NgClass,
    TranslatePipe
  ],
  templateUrl: './rarity-synthesis.html',
  styleUrl: './rarity-synthesis.scss'
})
export class RaritySynthesis {

  raritySynthesis = input<any>();

  rarities = [
    {key: COMMUNE, label: 'rarities.common', color: 'color-common', bgColor: 'bg-common'},
    {key: PEU_COMMUNE, label: 'rarities.uncommon', color: 'color-uncommon', bgColor: 'bg-uncommon'},
    {key: RARE, label: 'rarities.rare', color: 'color-rare', bgColor: 'bg-rare'},
    {key: KROSMIQUE, label: 'rarities.krosmique', color: 'color-krosmique', bgColor: 'bg-krosmique'},
    {key: INFINITE, label: 'rarities.infinite', color: 'color-infinite', bgColor: 'bg-infinite'},
  ]


  cardType = [{key: CREA}, {key: SORT}]
}

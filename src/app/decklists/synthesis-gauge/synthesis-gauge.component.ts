import {Component, Input} from '@angular/core';
import {CardType, CREA, SORT} from "../models/enums";


@Component({
  selector: 'app-synthesis-gauge',
  templateUrl: './synthesis-gauge.component.html',
  styleUrl: './synthesis-gauge.component.scss'
})
export class SynthesisGaugeComponent {
  CREA = CREA
  SORT = SORT
  @Input() max
  @Input() value: { [CREA]: number, [SORT]: number }
  @Input() key: string

  protected readonly Math = Math;

  computeSpellHeight(item) {
    return item[SORT] ? Math.min(item[CREA] ? 75 : 100, Math.max(item[SORT] / this.max * 100, 25)) : 0
  }

  computeMinionHeight(item) {
    return item[CREA] ? Math.min(item[SORT] ? 75 : 100, Math.max(item[CREA] / this.max * 100, 25)) : 0
  }
}

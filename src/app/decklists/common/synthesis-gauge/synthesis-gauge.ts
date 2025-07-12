import {Component, computed, input} from '@angular/core';
import {CREA, SORT} from '../models/enums';
import {NgStyle} from '@angular/common';

@Component({
  selector: 'app-synthesis-gauge',
  imports: [
    NgStyle
  ],
  templateUrl: './synthesis-gauge.html',
  styleUrl: './synthesis-gauge.scss'
})
export class SynthesisGauge {
  CREA = CREA
  SORT = SORT

  max = input<number>();
  value = input<{ [CREA]: number, [SORT]: number }>();
  key = input<string>();

  spellHeight = computed(() => {
    return this.value()[SORT] ? Math.min(this.value()[CREA] ? 75 : 100, Math.max(this.value()[SORT] / this.max() * 100, 25)) : 0
  })

  minionHeight = computed(() => {
    return this.value()[CREA] ? Math.min(this.value()[SORT] ? 75 : 100, Math.max(this.value()[CREA] / this.max() * 100, 25)) : 0
  })

}

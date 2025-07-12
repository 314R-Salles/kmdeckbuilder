import {Component, input} from '@angular/core';
import {SynthesisGauge} from '../synthesis-gauge/synthesis-gauge';

@Component({
  selector: 'app-synthesis',
  imports: [
    SynthesisGauge
  ],
  templateUrl: './synthesis.html',
  styleUrl: './synthesis.scss'
})
export class Synthesis {
  max = input<number>();
  syntheseCost = input<any>();

}

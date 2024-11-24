import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-synthesis',
  templateUrl: './synthesis.component.html',
  styleUrl: './synthesis.component.scss'
})
export class SynthesisComponent {

  @Input() max
  @Input() syntheseCost

}

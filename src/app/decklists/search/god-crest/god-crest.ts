import {Component, input} from '@angular/core';

@Component({
  selector: 'app-god-crest',
  imports: [],
  templateUrl: './god-crest.html',
  styleUrl: './god-crest.scss'
})
export class GodCrest {
  god = input<string>();
  costAP = input.required<number>();

  allowResize = input<boolean>(true);
}

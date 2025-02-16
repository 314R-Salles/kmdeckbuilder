import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-deck-created-popin',
  templateUrl: './deck-created-popin.component.html',
  styleUrl: './deck-created-popin.component.scss'
})
export class DeckCreatedPopinComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {deckId: string}) { }


}

import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose} from '@angular/material/dialog';
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-deck-created-popin',
  imports: [
    MatDialogClose,
    TranslatePipe
  ],
  templateUrl: './deck-created-popin.html',
  styleUrl: './deck-created-popin.scss'
})
export class DeckCreatedPopin {

  data: { deckId: string, isUpdate: boolean } = inject(MAT_DIALOG_DATA);

}

import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose} from '@angular/material/dialog';
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-deck-deletion-popin',
  imports: [
    MatDialogClose,
    TranslatePipe
  ],
  templateUrl: './deck-deletion-popin.html',
  styleUrl: './deck-deletion-popin.scss'
})
export class DeckDeletionPopin {

  data: {} = inject(MAT_DIALOG_DATA);

}

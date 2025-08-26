import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose} from '@angular/material/dialog';

@Component({
  selector: 'app-deck-deletion-popin',
  imports: [
    MatDialogClose
  ],
  templateUrl: './deck-deletion-popin.html',
  styleUrl: './deck-deletion-popin.scss'
})
export class DeckDeletionPopin {

  data: {} = inject(MAT_DIALOG_DATA);

}

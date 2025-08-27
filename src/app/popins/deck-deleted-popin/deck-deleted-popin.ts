import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose} from '@angular/material/dialog';

@Component({
  selector: 'app-deck-deleted-popin',
  imports: [
    MatDialogClose
  ],
  templateUrl: './deck-deleted-popin.html',
  styleUrl: './deck-deleted-popin.scss'
})
export class DeckDeletedPopin {

  data: {} = inject(MAT_DIALOG_DATA);

}

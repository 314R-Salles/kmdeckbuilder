import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose} from '@angular/material/dialog';
import {Section} from '../../base/section/section';

@Component({
  selector: 'app-deck-deleted-popin',
  imports: [
    Section,
    MatDialogClose
  ],
  templateUrl: './deck-deleted-popin.html',
  styleUrl: './deck-deleted-popin.scss'
})
export class DeckDeletedPopin {

  data: {} = inject(MAT_DIALOG_DATA);

}

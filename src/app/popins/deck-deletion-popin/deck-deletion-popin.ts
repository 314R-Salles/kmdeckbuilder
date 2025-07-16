import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose} from '@angular/material/dialog';
import {Section} from '../../base/section/section';

@Component({
  selector: 'app-deck-deletion-popin',
  imports: [
    Section,
    MatDialogClose
  ],
  templateUrl: './deck-deletion-popin.html',
  styleUrl: './deck-deletion-popin.scss'
})
export class DeckDeletionPopin {

  data: {} = inject(MAT_DIALOG_DATA);

}

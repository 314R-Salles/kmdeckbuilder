import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose} from '@angular/material/dialog';
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-deck-deleted-popin',
  imports: [
    MatDialogClose,
    TranslatePipe
  ],
  templateUrl: './deck-deleted-popin.html',
  styleUrl: './deck-deleted-popin.scss'
})
export class DeckDeletedPopin {

  data: {} = inject(MAT_DIALOG_DATA);

}

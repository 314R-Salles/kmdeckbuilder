import {Component, computed, inject, input} from '@angular/core';
import {StoreService} from '../../../store.service';
import {NgTemplateOutlet} from "@angular/common";
import {toSignal} from "@angular/core/rxjs-interop";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'app-highlight-display',
  imports: [
    NgTemplateOutlet,
    MatTooltip
  ],
  templateUrl: './highlight-display.html',
  styleUrl: './highlight-display.scss'
})
export class HighlightDisplay {

  storeService = inject(StoreService);

  currentLanguage = toSignal(this.storeService.getLanguage())
  illustrations = input<{ highlightOrder: number; cardId: number }[]>();
  illustrationsNumber = computed(() => this.illustrations()?.length)
  CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap()
  cardNames = computed(() => this.storeService.getCardNamesAsMap(this.currentLanguage()))

}

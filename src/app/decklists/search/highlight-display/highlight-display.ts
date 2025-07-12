import {Component, computed, input} from '@angular/core';
import {StoreService} from '../../../store.service';
import {NgTemplateOutlet} from "@angular/common";

@Component({
  selector: 'app-highlight-display',
  imports: [
    NgTemplateOutlet
  ],
  templateUrl: './highlight-display.html',
  styleUrl: './highlight-display.scss'
})
export class HighlightDisplay {

  illustrations = input<{ highlightOrder: number; cardId: number }[]>();
  illustrationsNumber = computed(() => this.illustrations()?.length)
  CARD_ILLUSTRATIONS

  constructor(private storeService: StoreService) {
    this.CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap()
  }

}

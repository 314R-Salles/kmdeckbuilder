import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {StoreService} from "../../../store.service";

@Component({
    selector: 'app-highlight-display',
    templateUrl: './highlight-display.component.html',
    styleUrl: './highlight-display.component.scss',
    standalone: false
})
export class HighlightDisplayComponent implements OnChanges {

  @Input() illustrations: {highlightOrder: number; cardId: number}[] = []
  illustrationsNumber
  CARD_ILLUSTRATIONS

  constructor(private storeService: StoreService) {
    this.CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.illustrationsNumber = this.illustrations.length
  }


}

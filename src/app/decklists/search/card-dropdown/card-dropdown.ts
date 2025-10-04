import {Component, computed, inject, input, output} from '@angular/core';
import {ApiService} from '../../../api/api.service';
import {StoreService} from '../../../store.service';
import {FormsModule} from '@angular/forms';
import {NgClass, NgStyle} from '@angular/common';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {map, of, switchMap} from 'rxjs';
import {TranslatePipe} from "@ngx-translate/core";
import {AbstractDropdownComponent} from "../../../base/AbstractDropdownComponent";

@Component({
  selector: 'app-card-dropdown',
  imports: [
    FormsModule,
    NgStyle,
    NgClass,
    TranslatePipe
  ],
  templateUrl: './card-dropdown.html',
  styleUrl: './card-dropdown.scss'
})
export class CardDropdown extends AbstractDropdownComponent {

  apiService = inject(ApiService)
  storeService = inject(StoreService)

  CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap()
  currentLanguage = toSignal(this.storeService.getLanguage())

  selectedGods = input<any[]>([]);
  selectedCards = input<any[]>([]);
  onSelectCard = output<any>();

  availableCards = toSignal(
    toObservable<string>(this.search).pipe(
      switchMap((search) => {
        if (search && search.length > 1) {
          this.displayDropdown = true
          return this.apiService.getCardsByName({
            gods: this.selectedGods().length ? [...this.selectedGods().map(g => g.id), 0] : [],
            name: search,
            language: this.currentLanguage(),
            pageNumber: 0,
            pageSize: 100
          })
        } else {
          this.displayDropdown = false
          return of({content: []})
        }
      }),
      map(searchResults => {
        return searchResults.content;
      })))

  displayedCards = computed(() =>
    this.availableCards().filter(result => !this.selectedCards().map(c => c.id).includes(result.id))
  )

  selectCard(card) {
    this.onSelectCard.emit(card);

    if (this.displayedCards().length == 1) {
      this.search.set(null);
      this.displayDropdown = false
    }
  }

}

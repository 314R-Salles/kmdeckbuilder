import {Component, computed, HostListener, inject, input, output, signal} from '@angular/core';
import {ApiService} from '../../../api/api.service';
import {StoreService} from '../../../store.service';
import {FormsModule} from '@angular/forms';
import {NgClass, NgStyle} from '@angular/common';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {map, of, switchMap} from 'rxjs';

@Component({
  selector: 'app-card-dropdown',
  imports: [
    FormsModule,
    NgStyle,
    NgClass
  ],
  templateUrl: './card-dropdown.html',
  styleUrl: './card-dropdown.scss'
})
export class CardDropdown {

  CARD_ILLUSTRATIONS
  displayDropdown = false

  apiService = inject(ApiService)
  storeService = inject(StoreService)

  currentLanguage = toSignal(this.storeService.getLanguage())

  selectedGods = input<any[]>([]);
  selectedCards = input<any[]>([]);
  onSelectCard = output<any>();

  cardSearch = signal<string>('');


  availableCards = toSignal(
    toObservable<string>(this.cardSearch).pipe(
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

  constructor() {
    this.CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap();
  }

  dropdownClick() {
    this.displayDropdown = !this.displayDropdown
  }

  selectCard(card) {
    this.onSelectCard.emit(card);

    if (this.displayedCards().length == 1) {
          this.cardSearch.set(null);
          this.displayDropdown = false
        }
  }

  clickedInside

  @HostListener('click', ['$event'])
  clickInside(event) {
    this.clickedInside = true
  }

  @HostListener('document:click')
  clickout() {
    if (!this.clickedInside) {
      this.cardSearch.set(null);
      this.displayDropdown = false;
    }
    this.clickedInside = false
  }

}

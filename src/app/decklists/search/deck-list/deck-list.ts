import {Component, input, output} from '@angular/core';
import {Pagination} from '../../../base/pagination/pagination';
import {DeckListItem} from '../deck-list-item/deck-list-item';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-deck-list',
  imports: [Pagination, DeckListItem, TranslatePipe],
  templateUrl: './deck-list.html',
  styleUrl: './deck-list.scss'
})
export class DeckList {
  decks = input<any[]>();
  searchResults = input<any>();
  isLoggedIn = input<boolean>();

  pageUp = output<void>();
  pageDown = output<void>();
  pageSet = output<number>();
  toggleFavorite = output<any>();
  addUserFilter = output<string>();
  addTagFilter = output<string>();
}

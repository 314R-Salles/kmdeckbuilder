import {Component, computed, inject, input, output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {NgClass, NgStyle} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {GodDropdown} from '../god-dropdown/god-dropdown';
import {TagDropdown} from '../../common/tag-dropdown/tag-dropdown';
import {CardDropdown} from '../card-dropdown/card-dropdown';
import {OwnerDropdown} from '../owner-dropdown/owner-dropdown';
import {OrderBy, SearchBy} from '../../common/models/enums';
import {StoreService} from '../../../store.service';

@Component({
  selector: 'app-search-deck-filters',
  imports: [
    MatIcon,
    MatTooltip,
    NgClass,
    NgStyle,
    TranslatePipe,
    GodDropdown,
    TagDropdown,
    CardDropdown,
    OwnerDropdown
  ],
  templateUrl: './search-deck-filters.html',
  styleUrl: './search-deck-filters.scss'
})
export class SearchDeckFilters {
  storeService = inject(StoreService);

  filtersOpen = input(false);
  isLoggedIn = input(false);
  favoritesOnly = input(false);
  sortFilter = input<SearchBy>(SearchBy.RECENT);
  sortOrder = input<OrderBy>(OrderBy.DESC);

  selectedGods = input<any[]>([]);
  selectedTags = input<any[]>([]);
  selectedNegativeTags = input<any[]>([]);
  allTags = input<any[]>([]);
  selectedCards = input<any[]>([]);
  selectedUsers = input<any[]>([]);
  selectedNegativeUsers = input<any[]>([]);
  allUsers = input<any[]>([]);

  CARD_ILLUSTRATIONS = this.storeService.getCardIllustrationsAsMap();

  activeFilterCount = computed(() =>
    this.selectedCards().length +
    this.selectedUsers().length +
    this.selectedNegativeUsers().length +
    this.selectedGods().length +
    this.selectedTags().length +
    this.selectedNegativeTags().length
  )

  closeFilters = output<void>();
  toggleFilters = output<void>();
  resetFilters = output<void>();
  toggleFavoriteFilter = output<void>();
  setFilter = output<SearchBy>();

  selectGod = output<any>();
  removeGod = output<any>();

  selectTag = output<any>();
  selectNegativeTag = output<any>();
  removeTag = output<any>();
  removeNegativeTag = output<any>();

  selectCard = output<any>();
  removeCard = output<any>();

  selectUser = output<any>();
  selectNegativeUser = output<any>();
  removeUser = output<any>();
  removeNegativeUser = output<any>();

  protected readonly SearchBy = SearchBy;
  protected readonly OrderBy = OrderBy;
}

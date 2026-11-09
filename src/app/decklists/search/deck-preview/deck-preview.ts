import {Component, computed, inject, input, output} from '@angular/core';
import {RouterLink} from '@angular/router';
import {DatePipe, NgClass, NgStyle} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {HighlightDisplay} from '../highlight-display/highlight-display';
import {GodCrest} from '../../common/god-crest/god-crest';
import {StoreService} from '../../../store.service';
import {Deck, DeckTag} from '../../../common/models/deck.model';
import {LikeButton} from "../../common/like-button/like-button";
import {TooltipIfTruncated} from '../../../common/directives/tooltip-if-truncated';
import {RightClick} from "../../../common/directives/right-click";

@Component({
  selector: 'app-deck-preview',
  imports: [
    RouterLink,
    NgClass,
    NgStyle,
    MatIcon,
    MatTooltip,
    DatePipe,
    HighlightDisplay,
    GodCrest,
    TranslatePipe,
    LikeButton,
    TooltipIfTruncated,
    RightClick
  ],
  templateUrl: './deck-preview.html',
  styleUrl: './deck-preview.scss'
})
export class DeckPreview {
  private storeService = inject(StoreService);
  private currentLanguage = toSignal(this.storeService.getLanguage());
  // seule la langue FR a une locale de date dédiée ; toutes les autres langues restent en EN
  dateLocale = computed(() => this.currentLanguage() === 'FR' ? 'fr' : 'en-US');

  deck = input.required<Deck>();
  isLoggedIn = input<boolean>();
  // désactivé sur les aperçus hors page de recherche (ex: accueil), qui n'ont pas de filtres à alimenter
  filtersEnabled = input<boolean>(true);

  toggleFavorite = output<void>();
  addUserFilter = output<string>();
  addNegativeUserFilter = output<string>();
  addTagFilter = output<string>();
  addNegativeTagFilter = output<string>();

  onAuthorClick(event: Event) {
    if (!this.filtersEnabled()) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    this.addUserFilter.emit(this.deck().owner);
  }

  onAuthorRightClick(event: Event) {
    if (!this.filtersEnabled()) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    this.addNegativeUserFilter.emit(this.deck().owner);
  }


  onTagClick(tag: DeckTag, event: Event) {
    if (!this.filtersEnabled()) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    this.addTagFilter.emit(tag.title);
  }

  onTagRightClick(tag: DeckTag, event: Event) {
    if (!this.filtersEnabled()) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    this.addNegativeTagFilter.emit(tag.title);
  }
}

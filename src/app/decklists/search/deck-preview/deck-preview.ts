import {Component, input, output} from '@angular/core';
import {RouterLink} from '@angular/router';
import {DatePipe, NgClass, NgStyle} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {HighlightDisplay} from '../highlight-display/highlight-display';
import {GodCrest} from '../god-crest/god-crest';

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
    TranslatePipe
  ],
  templateUrl: './deck-preview.html',
  styleUrl: './deck-preview.scss'
})
export class DeckPreview {
  deck = input.required<any>();
  isLoggedIn = input<boolean>();

  toggleFavorite = output<void>();
  addUserFilter = output<string>();
  addTagFilter = output<string>();

  onFavoriteClick(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.toggleFavorite.emit();
  }

  onAuthorClick(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.addUserFilter.emit(this.deck().owner);
  }

  onTagClick(tag: any, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.addTagFilter.emit(tag.title);
  }
}

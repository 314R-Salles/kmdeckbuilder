import {Component, computed, input, output} from '@angular/core';
import {RouterLink} from '@angular/router';
import {DatePipe, NgClass, NgStyle} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {HighlightDisplay} from '../highlight-display/highlight-display';
import {TranslatePipe} from '@ngx-translate/core';
import {isValidTwitchURL, isValidYouTubeURL} from '../../../base/models/utils';

@Component({
  selector: 'app-deck-list-item',
  imports: [RouterLink, NgClass, NgStyle, DatePipe, MatIcon, MatTooltip, HighlightDisplay, TranslatePipe],
  templateUrl: './deck-list-item.html',
  styleUrl: './deck-list-item.scss'
})
export class DeckListItem {
  deck = input<any>();
  isLoggedIn = input<boolean>();

  toggleFavorite = output<any>();
  addUserFilter = output<string>();
  addTagFilter = output<string>();

  videoLink = computed(() => this.deck().videoLink)

  videoLinkType = computed<'youtube' | 'twitch' | null>(() => {
    const videoLink = this.deck()?.videoLink;
    if (!videoLink) return null;
    if (isValidYouTubeURL(videoLink).type === 'youtube') return 'youtube';
    if (isValidTwitchURL(videoLink).type === 'twitch') return 'twitch';
    return null;
  });

  onToggleFavorite(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.toggleFavorite.emit(this.deck());
  }

  onAddUserFilter(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.addUserFilter.emit(this.deck().owner);
  }

  onAddTagFilter(tagTitle: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.addTagFilter.emit(tagTitle);
  }
}

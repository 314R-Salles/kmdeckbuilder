import {Component, input, output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {NgClass, NgStyle} from "@angular/common";

@Component({
  selector: 'app-like-button',
  imports: [
    MatIcon,
    NgStyle,
    NgClass
  ],
  templateUrl: './like-button.html',
  styleUrl: './like-button.scss',
})
export class LikeButton {
  isLoggedIn = input<boolean>(false);
  owned = input<boolean>(false);
  liked = input<boolean>(false);
  favoriteCount = input<number>(0);

  toggleFavorite = output<void>()

  onClick(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.toggleFavorite.emit();
  }
}

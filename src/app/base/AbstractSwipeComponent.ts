import {Directive, HostListener} from "@angular/core";


@Directive()
export abstract class AbstractSwipeComponent {

  startX = 0;
  startY = 0;

  abstract swipeRight(): any

  abstract swipeLeft(): any

  @HostListener('document:touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    const touch = event.changedTouches[0];
    this.startX = touch.screenX;
    this.startY = touch.screenY;
  }

  @HostListener('document:touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    const touch = event.changedTouches[0];
    const diffX = touch.screenX - this.startX;
    const diffY = touch.screenY - this.startY;

    // Ignore if vertical movement is stronger → allow scroll
    if (Math.abs(diffY) > Math.abs(diffX)) return;

    // Horizontal swipe threshold
    const threshold = 50;

    if (diffX > threshold) {
      this.swipeLeft();
    } else if (diffX < -threshold) {
      this.swipeRight();
    }
  }


}

import {Directive, output} from '@angular/core';

@Directive({
  selector: '[rightClick]',
  host: {'(contextmenu)': 'handleContextMenu($event)'}
})
export class RightClick {
  readonly rightClick = output<MouseEvent>();

  handleContextMenu(event: MouseEvent): void {
    event.preventDefault();
    this.rightClick.emit(event);
  }
}

import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {

  @Input() pageNumber
  @Input() totalPages

  @Output() pageUp = new EventEmitter<any>();
  @Output() pageDown = new EventEmitter<any>();

  up() {
    this.pageUp.emit()
  }

  down() {
    this.pageDown.emit()
  }


}

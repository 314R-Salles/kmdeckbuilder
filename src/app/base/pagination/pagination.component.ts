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
  @Output() pageSet = new EventEmitter<any>();

  up() {
    this.pageUp.emit()
  }

  down() {
    this.pageDown.emit()
  }

  set(value) {
    this.pageSet.emit(value);
    this.pageNumber = value;
  }

  createPagination() {
    // Want a length 11 array which contains value looking like this :
    var pagination = [];

    // Cas : pas assez de pages pour couper, 1 2 3 4 5 6 7 8 9 10 11
    if (this.totalPages <= 11) {
      for (let i = 1; i <= this.totalPages; i++)
        pagination.push(i);
    }
    // Cas : début (pagenumber < 6) = 1 2 3 4 5 6 7 8 9 ... TOTALPAGES
    else if (this.pageNumber < 7) {
      for (let i = 1; i <= 9; i++)
        pagination.push(i);

      pagination.push("...");
      pagination.push(this.totalPages);
    }
    // Cas : fin = 1 ... TOTALPAGES-9 TOTALPAGES-8 ... TOTALPAGES
    else if (this.pageNumber > this.totalPages - 6) {
      pagination.push(1);
      pagination.push("...");

      for (let i = this.totalPages - 8; i <= this.totalPages; i++)
        pagination.push(i);
    }
    // Cas : milieu = 1 ...3 4 5 PAGENUMBER 7 8 9... TOTALPAGES
    else {
      pagination.push(1);
      pagination.push("...");
      for (let i = this.pageNumber-3; i<= this.pageNumber+3; i++)
        pagination.push(i);
      pagination.push("...");
      pagination.push(this.totalPages);
    }
    return pagination;

  }
}

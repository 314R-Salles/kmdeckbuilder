import {Component, computed, inject, input, output} from '@angular/core';
import {NgClass, NgStyle} from '@angular/common';
import {BreakpointObserver} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';

// même seuil que $mobile-breakpoint dans header.scss, pour rester cohérent avec la définition "mobile" du reste de l'app
const MOBILE_BREAKPOINT = '(max-width: 768px)';

// on met un numéro de page négatif là où on va afficher "..." à l'écran (pour créer un array de numbers plutot qu'un array mixte (number/string))
// edgeCount : taille du bloc de numéros consécutifs affiché en début/fin de liste ; radius : demi-largeur de la fenêtre autour de la page courante
function buildPagination(pageNumber: number, totalPages: number, edgeCount: number, radius: number): number[] {
  const pagination: number[] = [];

  // Cas : pas assez de pages pour tronquer, 1 2 3 ... totalPages
  if (totalPages <= edgeCount + 2) {
    for (let i = 1; i <= totalPages; i++)
      pagination.push(i);
  }
  // Cas : début = 1 2 ... edgeCount ... TOTALPAGES
  else if (pageNumber < edgeCount - radius + 1) {
    for (let i = 1; i <= edgeCount; i++)
      pagination.push(i);

    pagination.push(-1);
    pagination.push(totalPages);
  }
  // Cas : fin = 1 ... TOTALPAGES-edgeCount+1 ... TOTALPAGES
  else if (pageNumber > totalPages - (edgeCount - radius)) {
    pagination.push(1);
    pagination.push(-1);

    for (let i = totalPages - (edgeCount - 1); i <= totalPages; i++)
      pagination.push(i);
  }
  // Cas : milieu = 1 ... PAGENUMBER-radius ... PAGENUMBER ... PAGENUMBER+radius ... TOTALPAGES
  else {
    pagination.push(1);
    pagination.push(-1);
    for (let i = pageNumber - radius; i <= pageNumber + radius; i++)
      pagination.push(i);
    pagination.push(-2);
    pagination.push(totalPages);
  }
  return pagination;
}

@Component({
  selector: 'app-pagination',
  imports: [
    NgStyle,
    NgClass
  ],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss'
})
export class Pagination {

  breakpointObserver = inject(BreakpointObserver);

  pageNumber = input<number>();
  totalPages = input<number>(0);

  pageUp = output<void>();
  pageDown = output<void>();
  pageSet = output<number>();

  isMobile = toSignal(
    this.breakpointObserver.observe(MOBILE_BREAKPOINT).pipe(map(state => state.matches)),
    {initialValue: this.breakpointObserver.isMatched(MOBILE_BREAKPOINT)}
  )

  up() {
    if (this.pageNumber() < this.totalPages())
      this.pageUp.emit()
  }

  down() {
    if (this.pageNumber() > 0)
      this.pageDown.emit()
  }

  set(page) {
    if (page > 0) {
      this.pageSet.emit(page);
    }
  }

  pagination = computed(() => {
    return this.isMobile()
      ? buildPagination(this.pageNumber(), this.totalPages(), 3, 1)
      : buildPagination(this.pageNumber(), this.totalPages(), 9, 3);
  })

}

import {Component, computed, HostListener, input, output, signal} from '@angular/core';
import {GOD_ARRAY} from '../../common/models/enums';
import {FormsModule} from '@angular/forms';
import {NgStyle} from '@angular/common';

@Component({
  selector: 'app-god-dropdown',
  imports: [
    FormsModule,
    NgStyle
  ],
  templateUrl: './god-dropdown.html',
  styleUrl: './god-dropdown.scss'
})
export class GodDropdown {

  selectedGods = input<any[]>([]);
  onSelectGod = output<any>();
  godSearch = signal<string>('');

  displayedGods = computed(() => {
    let r = this.allGods.filter(result => !this.selectedGods().map(c => c.name).includes(result.name));
    return r.filter(god => !this.godSearch() || god.name.toLowerCase().indexOf(this.godSearch().toLowerCase()) != -1);
  })

  allGods = GOD_ARRAY.filter(g => g.name != 'NEUTRE')
  displayDropdown = false

  dropdownClick() {
    this.displayDropdown = !this.displayDropdown
  }

  selectGod(god) {
    this.displayDropdown = false // passer false ici, permet de garder le dropdown ouvert puisque dropdownClick se déclenche dans la foulée
    this.onSelectGod.emit(god);
  }

  clickedInside

  @HostListener('click', ['$event'])
  clickInside(event) {
    // event.stopPropagation();
    this.clickedInside = true
  }

  @HostListener('document:click')
  clickout() {
    if (!this.clickedInside) {
      this.godSearch.set('');
      this.displayDropdown = false;
    }
    this.clickedInside = false
  }

}

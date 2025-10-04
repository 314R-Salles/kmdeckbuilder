import {Component, computed, input, output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgStyle} from '@angular/common';
import {TranslatePipe} from "@ngx-translate/core";
import {AbstractDropdownComponent} from "../../../base/AbstractDropdownComponent";

@Component({
  selector: 'app-god-dropdown',
  imports: [
    FormsModule,
    NgStyle,
    TranslatePipe
  ],
  templateUrl: './god-dropdown.html',
  styleUrl: './god-dropdown.scss'
})
export class GodDropdown extends AbstractDropdownComponent {

  selectedGods = input<any[]>([]);
  onSelectGod = output<any>();

  displayedGods = computed(() => {
    let r = this.allGods.filter(result => !this.selectedGods().map(c => c.name).includes(result.name));
    return r.filter(god => !this.search() || god.name.toLowerCase().indexOf(this.search().toLowerCase()) != -1);
  })

  allGods = [
    {id: 1, image: 'IOP', name: 'gods.iop'},
    {id: 2, image: 'CRA', name: 'gods.cra'},
    {id: 3, image: 'ENIRIPSA', name: 'gods.eniripsa'},
    {id: 4, image: 'ECAFLIP', name: 'gods.ecaflip'},
    {id: 5, image: 'ENUTROF', name: 'gods.enutrof'},
    {id: 6, image: 'SRAM', name: 'gods.sram'},
    {id: 7, image: 'XELOR', name: 'gods.xelor'},
    {id: 8, image: 'SACRIEUR', name: 'gods.sacrieur'},
    {id: 9, image: 'FECA', name: 'gods.feca'},
    {id: 10,image: 'SADIDA',  name: 'gods.sadida'},
  ]

  selectGod(god) {
    this.onSelectGod.emit(god);

    if (this.displayedGods().length == 1) {
      this.search.set(null);
      this.displayDropdown = false
    }
  }

}

import {Component, Input, OnInit} from '@angular/core';
import {Card} from "../card.model";
import {ApiService} from "../../api/api.service";
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'app-filter-form',
  templateUrl: './filter-form.component.html',
  styleUrls: ['./filter-form.component.scss']
})
export class FilterFormComponent implements OnInit {

  @Input() form: FormGroup
  @Input() god : number

  filterSectionActive = false

  factionChange(type: string) {
    switch (type) {
      case 'dieu':
        this.form.get('godCards').setValue(!this.form.get('godCards').value);
        if (!this.form.get('godCards').value && !this.form.get('neutralCards').value) {
          this.form.get('neutralCards').setValue(true)
        }
        break;
      case 'neutre':
        this.form.get('neutralCards').setValue(!this.form.get('neutralCards').value);
        if (!this.form.get('godCards').value && !this.form.get('neutralCards').value) {
          this.form.get('godCards').setValue(true)
        }
        break;
    }
  }

  typeChange(type: string) {
    switch (type) {
      case 'sort':
        this.form.get('isSpell').setValue(!this.form.get('isSpell').value);
        if (!this.form.get('isSpell').value && !this.form.get('isMinion').value) {
          this.form.get('isMinion').setValue(true)
        }
        break;
      case 'crea':
        this.form.get('isMinion').setValue(!this.form.get('isMinion').value);
        if (!this.form.get('isSpell').value && !this.form.get('isMinion').value) {
          this.form.get('isSpell').setValue(true)
        }
        break;
    }

  }

  apSelect(ap: number) {
    if (this.form.get('apValue')?.value == ap) {
      this.form.get('apValue')?.setValue(null);
    } else {
      this.form.get('apValue')?.setValue(ap);
    }
  }

  raritySelect(rarity: { key: any; value: any }) {
    this.form.get('rarity')?.setValue(rarity);
  }

  godList = [
    {value: -1, viewValue: 'All'},
    {value: 0, viewValue: 'Neutral'},
    {value: 1, viewValue: 'Iop'},
    {value: 2, viewValue: 'Cra'},
    {value: 3, viewValue: 'Eniripsa'},
    {value: 4, viewValue: 'Ecaflip'},
    {value: 5, viewValue: 'Enutrof'},
    {value: 6, viewValue: 'Sram'},
    {value: 7, viewValue: 'Xelor'},
    {value: 8, viewValue: 'Sacrieur'},
    {value: 9, viewValue: 'Feca'},
    {value: 10, viewValue: 'Sadida'},
  ];

  rarityList = [
    {key: -1, value: 'All', bgColor: 'bg-color-all', color: 'color-all'},
    {key: 0, value: 'Common', bgColor: 'bg-color-common', color: 'color-common'},
    {key: 1, value: 'Uncommon', bgColor: 'bg-color-uncommon', color: 'color-uncommon'},
    {key: 2, value: 'Rare', bgColor: 'bg-color-rare', color: 'color-rare'},
    {key: 3, value: 'Krosmique', bgColor: 'bg-color-krosmique', color: 'color-krosmique'},
    {key: 4, value: 'Infinite', bgColor: 'bg-color-infinite', color: 'color-infinite'},
  ];


  constructor(private apiService: ApiService) {
  }

  ngOnInit() {
  }

  get isSpell() {
    return this.form.get('isSpell').value;
  }

  get isMinion() {
    return this.form.get('isMinion').value;
  }

  get apValue() {
    return this.form.get('apValue').value;
  }

  // resetGod() {
  //   if (this.rarity === 4) {
  //     this.god = -1;
  //   }
  // }
  //
  // resetRarity() {
  //   if (this.rarity === 4) {
  //     this.rarity = -1;
  //   }
  // }


  toggleFilterSection() {
    this.filterSectionActive = !this.filterSectionActive
  }

}

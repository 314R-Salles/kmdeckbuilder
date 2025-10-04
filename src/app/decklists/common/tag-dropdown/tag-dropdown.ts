import {Component, computed, input, output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgStyle} from '@angular/common';
import {TranslatePipe} from "@ngx-translate/core";
import {AbstractDropdownComponent} from "../../../base/AbstractDropdownComponent";

@Component({
  selector: 'app-tag-dropdown',
  imports: [
    FormsModule,
    NgStyle,
    TranslatePipe
  ],
  templateUrl: './tag-dropdown.html',
  styleUrl: './tag-dropdown.scss'
})
export class TagDropdown extends AbstractDropdownComponent {

  selectedTags = input<{ title: string, count: number, iconId: string }[]>([]);
  allTags = input<{ title: string, count: number, iconId: string }[]>([]);
  withCount = input<boolean>(false);
  onSelectTag = output<{ title: string, count: number, iconId: string }>();
  onNegativeSelectTag = output<{ title: string, count: number, iconId: string }>();

  displayedTags = computed(() => {
    let r = (this.allTags() || []).filter(result => !this.selectedTags().map(c => c.title).includes(result.title));
    return r.filter(tag => !this.search() || tag.title.toLowerCase().indexOf(this.search().toLowerCase()) != -1);
  })

  selectTag(tag, negative) {
    if (!negative)
      this.onSelectTag.emit(tag);
    else
      this.onNegativeSelectTag.emit(tag);

    if (this.displayedTags().length == 1) {
      this.search.set(null);
      this.displayDropdown = false
    }
  }
}

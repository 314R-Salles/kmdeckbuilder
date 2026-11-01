import {Component, computed, input, output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgStyle} from '@angular/common';
import {TranslatePipe} from "@ngx-translate/core";
import {AbstractDropdownComponent} from "../../../common/components/AbstractDropdownComponent";
import {DeckTag} from "../../../common/models/deck.model";

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

  selectedTags = input<DeckTag[]>([]);
  removedTags = input<DeckTag[]>([]);
  allTags = input<DeckTag[]>([]);
  asFilter = input<boolean>(false);
  onSelectTag = output<DeckTag>();
  onNegativeSelectTag = output<DeckTag>();

  displayedTags = computed(() => {
    const allSelected = this.selectedTags().concat(this.removedTags())
    let r = (this.allTags() || []).filter(result => !allSelected.map(c => c.title).includes(result.title));
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

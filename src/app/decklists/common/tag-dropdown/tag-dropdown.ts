import {Component, computed, HostListener, input, output, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgStyle} from '@angular/common';

@Component({
  selector: 'app-tag-dropdown',
  imports: [
    FormsModule,
    NgStyle
  ],
  templateUrl: './tag-dropdown.html',
  styleUrl: './tag-dropdown.scss'
})
export class TagDropdown {

  displayDropdown = false

  selectedTags = input<{ title: string, count: number, iconId: string }[]>([]);
  allTags = input<{ title: string, count: number, iconId: string }[]>([]);
  withCount = input<boolean>(false);
  onSelectTag = output<{ title: string, count: number, iconId: string }>();
  onNegativeSelectTag = output<{ title: string, count: number, iconId: string }>();

  tagSearch = signal<string>('');

  displayedTags = computed(() => {
    let r = this.allTags().filter(result => !this.selectedTags().map(c => c.title).includes(result.title));
    return r.filter(tag => !this.tagSearch() || tag.title.toLowerCase().indexOf(this.tagSearch().toLowerCase()) != -1);
  })

  dropdownClick() {
    this.displayDropdown = !this.displayDropdown
  }

  selectTag(tag, negative) {
    if (!negative)
      this.onSelectTag.emit(tag);
    else
      this.onNegativeSelectTag.emit(tag);

    if (this.displayedTags().length == 1) {
      this.tagSearch.set(null);
      this.displayDropdown = false
    }
  }

  clickedInside

  @HostListener('click', ['$event'])
  clickInside(event) {
    this.clickedInside = true
  }

  @HostListener('document:click')
  clickout() {
    if (!this.clickedInside) {
      this.tagSearch.set(null);
      this.displayDropdown = false;
    }
    this.clickedInside = false
  }

}

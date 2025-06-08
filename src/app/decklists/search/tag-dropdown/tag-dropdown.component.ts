import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {ApiService} from "../../../api/api.service";


@Component({
  selector: 'app-tag-dropdown',
  templateUrl: './tag-dropdown.component.html',
  styleUrl: './tag-dropdown.component.scss'
})
export class TagDropdownComponent {

  allTags: { title: string, count: number }[] = []
  displayedTags: { title: string, count: number }[] = []
  @Input() selectedTags = []
  @Input() withCount = false
  @Output() onSelectTag = new EventEmitter<any>();
  tagSearch

  displayDropdown = false

  constructor(private apiService: ApiService) {
    this.apiService.getTagsByLanguage("FR").subscribe(tags => {
      this.allTags = tags;
      this.displayedTags = tags
    })
  }

  dropdownClick() {
    this.displayDropdown = !this.displayDropdown
    this.filterTags()
  }

  filterTags() {
    this.displayedTags = this.allTags.filter(result => !this.selectedTags.map(c => c.title).includes(result.title));
    this.displayedTags = this.displayedTags.filter(tag => !this.tagSearch || tag.title.toLowerCase().indexOf(this.tagSearch.toLowerCase()) != -1);
  }

  selectTag(tag) {
    // this.displayedTags = this.displayedTags.filter(g => g.title !== tag.title);
    this.onSelectTag.emit(tag);
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
      this.tagSearch = null
      this.displayDropdown = false;
    }
    this.clickedInside = false
  }

}

import {Component} from '@angular/core';
import {AdminApiService} from "../../api/admin-api.service";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
    selector: 'app-tag-management',
    templateUrl: './tag-management.component.html',
    styleUrl: './tag-management.component.scss',
    standalone: false
})
export class TagManagementComponent {

  selectedTag
  formGroup: FormGroup

  constructor(
    private adminApiService: AdminApiService, private formbuilder: FormBuilder) {
    this.formGroup = new FormGroup({tagArray: this.formbuilder.array([])})
    this.adminApiService.getAllTags().subscribe(r => {
      // let index = 0
      r.forEach(tag => {
        this.addNewRow(tag)
      })
    })
  }

  select(id) {
    this.selectedTag = id;
  }

  saveAllChanges() {
    this.adminApiService.saveAllTags(this.formGroup.value.tagArray).subscribe()
  }


  addNewRow(tag?) {
    if (tag) {
      this.formArr.push(this.formbuilder.group({
        id: tag.id,
        frTitle: [tag.frTitle, [Validators.required]],
        enTitle: tag.enTitle,
        esTitle: tag.esTitle,
        brTitle: tag.brTitle,
        ruTitle: tag.ruTitle,
        iconId: tag.iconId,
        disabled: tag.disabled
      }))
    } else {
      this.formArr.push(this.formbuilder.group({
        id: '',
        frTitle: ['Obligatoire', [Validators.required]],
        enTitle: '',
        esTitle: '',
        brTitle: '',
        ruTitle: '',
        iconId: '',
        disabled: true
      }))
    }
  }

  get formArr() {
    return this.formGroup && this.formGroup.get('tagArray') as FormArray;
  }
}

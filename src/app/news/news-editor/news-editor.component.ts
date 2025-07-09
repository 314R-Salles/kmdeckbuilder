import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../api/api.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {DomSanitizer} from '@angular/platform-browser';
import {AuthenticatedApiService} from "../../api/authenticated-api.service";
import {AdminApiService} from "../../api/admin-api.service";


@Component({
    selector: 'app-news-editor',
    templateUrl: './news-editor.component.html',
    styleUrl: './news-editor.component.scss',
    standalone: false
})
export class NewsEditorComponent implements OnInit {

  titles: any[] = [];
  displayedIllustration: any
  illustrationForm: any;
  newsForm: any;
  savedIllustrationId: number;

  constructor(private sanitizer: DomSanitizer,
              private adminApiService: AdminApiService) {
  }

  ngOnInit() {
    this.getIllustrationsList();

    this.illustrationForm = new FormGroup({
      content: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required])
    })
    this.newsForm = new FormGroup({
      illustrationId: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      content: new FormControl('', [Validators.required]),
    })
  }

  handleContentChange(event: any) {
    let content = event.html
    this.newsForm.patchValue({content});
    this.newsForm.markAsTouched('content');
  }

  save() {
    this.adminApiService.saveNews({
      title: this.newsForm.get('title').value,
      content: this.newsForm.get('content').value,
      illustrationId: this.newsForm.get('illustrationId').value,
    }).subscribe();
  }

  getIllustrationsList() {
    this.adminApiService.getIllustrationsTitles().subscribe(titles => this.titles = titles)
  }

  setIllustration(id: any) {
    this.adminApiService.getIllustration(id).subscribe(illustration => {
      this.displayedIllustration = this.sanitizer.bypassSecurityTrustResourceUrl(illustration);
      this.newsForm.patchValue({illustrationId: id});
      this.newsForm.markAsTouched('illustrationId');
    });
  }

  handleUpload(a: any) {
    const file = a.target.files[0];
    this.illustrationForm.patchValue({content: file});
  }

  uploadIllustration() {
    const reader = new FileReader();
    debugger
    reader.readAsDataURL(this.illustrationForm.get('content').value);
    reader.onloadend = () => {
      this.adminApiService.saveIllustration(reader.result as string, this.illustrationForm.get('title').value).subscribe(
        id => {
          this.savedIllustrationId = id;
          this.getIllustrationsList();
        }
      )
    };
  }
}

import {Component, inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from "@angular/common";
import {Meta} from "@angular/platform-browser";

@Component({
  selector: 'app-temppage',
  imports: [],
  templateUrl: './temppage.html',
  styleUrl: './temppage.scss'
})
export class Temppage {

  platformId = inject(PLATFORM_ID);
  metaService = inject(Meta)

  constructor() {

    if (isPlatformBrowser(this.platformId)) {

    }
    // this.titleService.setTitle(deckView.name)
    this.metaService.removeTag("name='description'");
    this.metaService.addTags([
      {
        name: 'description',
        content: 'Deckbuilder pour krosmaga'
      },
    ]);
  }

}

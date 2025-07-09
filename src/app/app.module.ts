import { NgModule, inject, provideAppInitializer } from '@angular/core';
import {BrowserModule, provideClientHydration} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NewsEditorComponent} from "./news/news-editor/news-editor.component";
import {StreamListComponent} from "./stream-list/stream-list.component";
import {HeaderComponent} from "./header/header.component";
import {AngularMaterialModule} from "./shared/angular.material.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {provideHttpClient} from "@angular/common/http";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
// import {QuillModule} from "ngx-quill";
import {AppInitializerService} from "./app-initializer.service";
import {HomeComponent} from './home/home.component';
import {NewsViewComponent} from './news/news-view/news-view.component';
import {NewsManagementComponent} from './news/news-management/news-management.component';
import {OAuthModule, OAuthStorage, provideOAuthClient} from "angular-oauth2-oidc";
import {EmailVerifiedPopinComponent} from './popins/email-verified-popin/email-verified-popin.component';
import {UserProfileComponent} from './user-profile/user-profile.component';
import {FilterFormComponent} from "./decklists/filter-form/filter-form.component";
import {DeckbuilderComponent} from './decklists/deckbuilder/deckbuilder.component';
import {SelectedListComponent} from './decklists/selected-list/selected-list.component';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {SynthesisGaugeComponent} from './decklists/synthesis-gauge/synthesis-gauge.component';
import {SynthesisComponent} from './decklists/synthesis/synthesis.component';
import {DeckCreatedPopinComponent} from "./popins/deck-created-popin/deck-created-popin.component";
import {SearchDeckComponent} from './decklists/search-deck/search-deck.component';
import {ViewDeckComponent} from './decklists/view-deck/view-deck.component';
import {RaritySynthesisComponent} from './decklists/rarity-synthesis/rarity-synthesis.component';
import {ViewListComponent} from './decklists/view-list/view-list.component';
import {SectionComponent} from './base/section/section.component';
import {CardDropdownComponent} from './decklists/search/card-dropdown/card-dropdown.component';
import {OwnerDropdownComponent} from './decklists/search/owner-dropdown/owner-dropdown.component';
import {GodDropdownComponent} from './decklists/search/god-dropdown/god-dropdown.component';
import {HighlightDisplayComponent} from './decklists/search/highlight-display/highlight-display.component';
import {TagManagementComponent} from './admin/tag-management/tag-management.component';
import {TagDropdownComponent} from './decklists/search/tag-dropdown/tag-dropdown.component';
import {VersionDropdownComponent} from "./decklists/version-dropdown/version-dropdown.component";
import { PaginationComponent } from './base/pagination/pagination.component';

@NgModule({
  declarations: [
    AppComponent,
    StreamListComponent,
    HeaderComponent,
    NewsEditorComponent,
    HomeComponent,
    NewsViewComponent,
    NewsManagementComponent,
    EmailVerifiedPopinComponent,
    DeckCreatedPopinComponent,
    UserProfileComponent,
    FilterFormComponent,
    DeckbuilderComponent,
    SelectedListComponent,
    SynthesisGaugeComponent,
    SynthesisComponent,
    SearchDeckComponent,
    ViewDeckComponent,
    RaritySynthesisComponent,
    ViewListComponent,
    SectionComponent,
    CardDropdownComponent,
    OwnerDropdownComponent,
    GodDropdownComponent,
    HighlightDisplayComponent,
    TagManagementComponent,
    TagDropdownComponent,
    VersionDropdownComponent,
    PaginationComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    OAuthModule.forRoot(
      //   {
      //   resourceServer: {
      //     allowedUrls: ['http://localhost:8080/api/authenticated/twitch/streams'],
      //     sendAccessToken: true
      //   }
      // }
    ),
    // QuillModule.forRoot({
    //   suppressGlobalRegisterWarning: true
    // }),
    NgOptimizedImage
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(), //???
    provideOAuthClient(), //???
    {provide: OAuthStorage, useFactory: storageFactory},
// {provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true},
    provideAppInitializer(() => {
        const initializerFn = (initApp)(inject(AppInitializerService));
        return initializerFn();
      }),
    provideAnimationsAsync(), //???
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

function storageFactory(): OAuthStorage {
  if (typeof window !== 'undefined') {
    return localStorage;
  }
  return null;
}


export function initApp(appLoaderService: AppInitializerService) {
  return () => appLoaderService.initApp();
}

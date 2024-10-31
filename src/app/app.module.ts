import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule, provideClientHydration} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NewsEditorComponent} from "./news-editor/news-editor.component";
import {StreamListComponent} from "./stream-list/stream-list.component";
import {HeaderComponent} from "./header/header.component";
import {AngularMaterialModule} from "./shared/angular.material.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {provideHttpClient} from "@angular/common/http";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
import {QuillModule} from "ngx-quill";
import {AppInitializerService} from "./app-initializer.service";
import {HomeComponent} from './home/home.component';
import {NewsViewComponent} from './news-view/news-view.component';
import {NewsManagementComponent} from './news-management/news-management.component';
import {OAuthModule, provideOAuthClient} from "angular-oauth2-oidc";
import {EmailVerifiedPopinComponent} from './email-verified-popin/email-verified-popin.component';
import {UserProfileComponent} from './user-profile/user-profile.component';
import {FilterFormComponent} from "./decklists/filter-form/filter-form.component";
import {DeckbuilderComponent} from './decklists/deckbuilder/deckbuilder.component';
import {SelectedListComponent} from './decklists/selected-list/selected-list.component';

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
    UserProfileComponent,
    FilterFormComponent,
    DeckbuilderComponent,
    SelectedListComponent,
  ],
  imports: [
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
    QuillModule.forRoot({
      suppressGlobalRegisterWarning: true
    })
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(), //???
    provideOAuthClient(), //???
// {provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true},
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      multi: true,
      deps: [AppInitializerService]
    },
    provideAnimationsAsync(), //???
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

export function initApp(appLoaderService: AppInitializerService) {
  return () => appLoaderService.initApp();
}

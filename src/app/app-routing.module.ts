import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NewsEditorComponent} from "./news/news-editor/news-editor.component";
import {HomeComponent} from "./home/home.component";
import {NewsViewComponent} from "./news/news-view/news-view.component";
import {NewsManagementComponent} from "./news/news-management/news-management.component";
import {UserProfileComponent} from "./user-profile/user-profile.component";
import {DeckbuilderComponent} from "./decklists/deckbuilder/deckbuilder.component";
import {SearchDeckComponent} from "./decklists/search-deck/search-deck.component";
import {ViewDeckComponent} from "./decklists/view-deck/view-deck.component";
import {TagManagementComponent} from "./admin/tag-management/tag-management.component";
import {StreamListComponent} from "./stream-list/stream-list.component";

const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'user', component: UserProfileComponent},
  {path: 'user/:username', component: UserProfileComponent},
  {path: 'news/view/:id', component: NewsViewComponent},
  // adminGuard nawak sur F5.
  {
    path: 'news/create', component: NewsEditorComponent,
    // canActivate: [AdminGuard]
  },
  {
    path: 'news/edit', component: NewsManagementComponent,
    // canActivate: [AdminGuard]
  },
  {
    path: 'tags/edit', component: TagManagementComponent,
    // canActivate: [AdminGuard]
  },
  {path: 'decks/create', component: DeckbuilderComponent},
  {path: 'decks/browse', component: SearchDeckComponent},
  {path: 'media', component: StreamListComponent},
  {path: 'decks/view/:id/:version', component: ViewDeckComponent},
  {path: 'decks/edit/:id/:version', component: DeckbuilderComponent},
];


@NgModule({
  imports: [RouterModule.forRoot(routes, {
    bindToComponentInputs: true,
    // enableTracing: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

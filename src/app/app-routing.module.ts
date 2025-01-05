import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NewsEditorComponent} from "./news/news-editor/news-editor.component";
import {HomeComponent} from "./home/home.component";
import {NewsViewComponent} from "./news/news-view/news-view.component";
import {NewsManagementComponent} from "./news/news-management/news-management.component";
import {UserProfileComponent} from "./user-profile/user-profile.component";
import {AdminGuard, AuthGuard} from "./auth.guards";
import {DeckbuilderComponent} from "./decklists/deckbuilder/deckbuilder.component";
import {SearchDeckComponent} from "./decklists/search-deck/search-deck.component";
import {ViewDeckComponent} from "./decklists/view-deck/view-deck.component";

const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'user', component: UserProfileComponent, canActivate: [AuthGuard]},
  {path: 'user/:username', component: UserProfileComponent},
  {path: 'news/view/:id', component: NewsViewComponent},
  {path: 'news/create', component: NewsEditorComponent, canActivate: [AdminGuard]},
  {path: 'news/edit', component: NewsManagementComponent, canActivate: [AdminGuard]},
    // AuthGuard foireux parce que "pas co" au moment de check
  // donc refresh sur deck/create => redirige sur /home
  {path: 'decks/create', component: DeckbuilderComponent, canActivate: [AuthGuard]},
  {path: 'decks/browse', component: SearchDeckComponent},
  {path: 'decks/view/:id', component: ViewDeckComponent},
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

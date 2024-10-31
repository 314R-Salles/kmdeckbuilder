import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NewsEditorComponent} from "./news-editor/news-editor.component";
import {HomeComponent} from "./home/home.component";
import {NewsViewComponent} from "./news-view/news-view.component";
import {NewsManagementComponent} from "./news-management/news-management.component";
import {UserProfileComponent} from "./user-profile/user-profile.component";
import {AdminGuard, AuthGuard} from "./auth.guards";
import {DeckbuilderComponent} from "./decklists/deckbuilder/deckbuilder.component";

const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'user', component: UserProfileComponent, canActivate: [AuthGuard]},
  {path: 'user/:username', component: UserProfileComponent},
  {path: 'news/view/:id', component: NewsViewComponent},
  {path: 'news/create', component: NewsEditorComponent, canActivate: [AdminGuard]},
  {path: 'news/edit', component: NewsManagementComponent, canActivate: [AdminGuard]},
  {path: 'decks/create', component: DeckbuilderComponent},
];


@NgModule({
  imports: [RouterModule.forRoot(routes, {
    bindToComponentInputs: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

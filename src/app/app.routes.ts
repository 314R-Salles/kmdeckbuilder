import {Routes} from "@angular/router";
import {Home} from "./home/home";
import {UserProfile} from "./user-profile/user-profile";
import {SearchDeck} from "./decklists/search/search-deck/search-deck";
import {StreamList} from "./stream-list/stream-list";
import {ViewDeck} from "./decklists/view/view-deck/view-deck";

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: Home},
  {path: 'user', component: UserProfile},
  {path: 'user/:username', component: UserProfile},
  {
    path: 'tags/edit',
    loadComponent: () => import('./admin/tag-management/tag-management').then(mod => mod.TagManagement)
  },
  {
    path: 'decks/create',
    loadComponent: () => import('./decklists/create/deckbuilder/deckbuilder').then(mod => mod.Deckbuilder)
  },
  {path: 'decks/browse', component: SearchDeck},
  {path: 'media', component: StreamList},
  {path: 'decks/view/:id/:version', component: ViewDeck},
  {
    path: 'decks/edit/:id/:version',
    loadComponent: () => import('./decklists/create/deckbuilder/deckbuilder').then(mod => mod.Deckbuilder)
  },

];


// // In the main application:
// export const ROUTES: Route[] = [
//   {path: 'admin', loadChildren: () => import('./admin/routes').then(mod => mod.ADMIN_ROUTES)},
//   // ...
// ];
//
// // In admin/routes.ts:
// export const ADMIN_ROUTES: Route[] = [
//   {path: 'home', component: AdminHomeComponent},
//   {path: 'users', component: AdminUsersComponent},
//   // ...
// ];

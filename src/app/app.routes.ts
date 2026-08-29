import {Routes} from "@angular/router";
import {Home} from "./home/home";
import {UserProfile} from "./user-profile/user-profile";
import {SearchDeck} from "./decklists/search/search-deck/search-deck";
import {StreamList} from "./stream-list/stream-list";
import {ViewDeck} from "./decklists/view/view-deck/view-deck";
import {Temppage} from "./temppage/temppage";
import {CreateDraft} from "./draft/create-draft/create-draft";

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {
    path: 'home',
    component: Home,
    title: 'Accueil | Kmtools',
    data: {description: 'Créez, partagez et explorez des decks Krosmaga sur Kmtools.'}
  },
  {path: 'temp', component: Temppage},
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
  {
    path: 'decks/browse',
    component: SearchDeck,
    title: 'Parcourir les decks | Kmtools',
    data: {description: 'Découvrez et filtrez les decks Krosmaga créés par la communauté.'}
  },
  {
    path: 'media',
    component: StreamList,
    title: 'Streams et vidéos Krosmaga | Kmtools',
    data: {description: 'Retrouvez les lives Twitch et vidéos YouTube Krosmaga.'}
  },
  {path: 'draft', component: CreateDraft},
  {path: 'decks/view/:id/:version/:minorVersion', component: ViewDeck},
  {
    path: 'decks/edit/:id/:version/:minorVersion',
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

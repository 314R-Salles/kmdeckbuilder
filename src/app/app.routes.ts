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
  {
    path: 'temp',
    component: Temppage,
    title: 'Kmtools',
    data: {description: 'Deckbuilder communautaire pour Krosmaga.'}
  },
  {
    path: 'user',
    component: UserProfile,
    title: 'Mon profil | Kmtools',
    data: {description: 'Gérez votre profil Kmtools : pseudo, decks et favoris.'}
  },
  {
    path: 'user/:username',
    component: UserProfile,
    title: 'Profil | Kmtools',
    data: {description: 'Profil et decks publiés sur Kmtools.'}
  },
  {
    path: 'tags/edit',
    loadComponent: () => import('./admin/tag-management/tag-management').then(mod => mod.TagManagement),
    title: 'Gestion des tags | Kmtools',
    data: {description: 'Administration des tags de decks Kmtools.'}
  },
  {
    path: 'decks/create',
    loadComponent: () => import('./decklists/create/deckbuilder/deckbuilder').then(mod => mod.Deckbuilder),
    title: 'Créer un deck | Kmtools',
    data: {description: 'Construisez votre deck Krosmaga et partagez-le sur Kmtools.'}
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
  {
    path: 'draft',
    component: CreateDraft,
    title: 'Draft | Kmtools',
    data: {description: 'Simulez une draft Krosmaga sur Kmtools.'}
  },
  {
    path: 'decks/view/:id/:version/:minorVersion',
    component: ViewDeck,
    title: 'Deck | Kmtools',
    data: {description: 'Consultez ce deck Krosmaga sur Kmtools.'}
  },
  {
    path: 'decks/edit/:id/:version/:minorVersion',
    loadComponent: () => import('./decklists/create/deckbuilder/deckbuilder').then(mod => mod.Deckbuilder),
    title: 'Modifier un deck | Kmtools',
    data: {description: 'Modifiez votre deck Krosmaga sur Kmtools.'}
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

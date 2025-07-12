import {Routes} from "@angular/router";
import {Home} from "./home/home";
import {UserProfile} from "./user-profile/user-profile";
import {TagManagement} from "./admin/tag-management/tag-management";
import {Deckbuilder} from "./decklists/create/deckbuilder/deckbuilder";
import {SearchDeck} from "./decklists/search/search-deck/search-deck";
import {StreamList} from "./stream-list/stream-list";
import {ViewDeck} from "./decklists/view/view-deck/view-deck";

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: Home},
  {path: 'user', component: UserProfile},
  {path: 'user/:username', component: UserProfile},
  {path: 'tags/edit', component: TagManagement},
  {path: 'decks/create', component: Deckbuilder},
  {path: 'decks/browse', component: SearchDeck},
  {path: 'media', component: StreamList},
  {path: 'decks/view/:id/:version', component: ViewDeck},
  {path: 'decks/edit/:id/:version', component: Deckbuilder},
];

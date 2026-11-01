import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Header} from './header/header';
import {SeoService} from './seo.service';
import {NavigationHistoryService} from './navigation-history.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // la déclaration ici permet d'activer les services au démarrage
  private seo = inject(SeoService);
  private navigationHistory = inject(NavigationHistoryService);
}

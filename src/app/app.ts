import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Header} from './header/header';
import {SeoService} from './seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private seo = inject(SeoService);
}

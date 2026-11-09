import {DOCUMENT} from '@angular/common';
import {inject, Injectable} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter, map} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {environment} from '../environments/environment';

// Complète la propriété native `title` du Router (déjà appliquée à document.title) avec
// la meta description, les balises og:* et le lien canonical, à partir de `route.data.description`.
// Une seule source de vérité par route (voir `app.routes.ts`), pas de duplication par composant.
@Injectable({providedIn: 'root'})
export class SeoService {

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.leafRouteDescription()),
      takeUntilDestroyed(),
    ).subscribe(description => this.applySeoTags(description));
  }

  private leafRouteDescription(): string {
    let route = this.activatedRoute.firstChild;
    while (route?.firstChild) {
      route = route.firstChild;
    }
    return route?.snapshot.data['description'] ?? 'Deckbuilder communautaire pour Krosmaga.';
  }

  private applySeoTags(description: string): void {
    const title = this.titleService.getTitle();
    const url = `${environment.SITE_URL}${this.router.url.split('?')[0]}`;

    this.metaService.updateTag({name: 'description', content: description});
    this.metaService.updateTag({property: 'og:title', content: title});
    this.metaService.updateTag({property: 'og:description', content: description});
    this.metaService.updateTag({property: 'og:url', content: url});
    this.updateCanonicalLink(url);
  }

  private updateCanonicalLink(url: string): void {
    let canonicalLink = this.document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!canonicalLink) {
      canonicalLink = this.document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      this.document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', url);
  }
}

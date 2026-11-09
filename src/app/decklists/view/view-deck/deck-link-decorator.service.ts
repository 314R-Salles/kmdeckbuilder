import {inject, Injectable, Renderer2} from '@angular/core';
import {Observable, shareReplay} from 'rxjs';
import {ApiService} from '../../../api/api.service';

// Détection des liens vers d'autres decks dans la description (texte brut, pas des <a>).
// Fonctionnement détaillé et pièges déjà rencontrés : documentation/view-deck-description-links.md
const DECK_LINK_TOKEN_PATTERN = /(https?:\/\/[^\s/]+)?\/decks\/view\/([^\s/]+)\/(\d+)\/\d+/g;

// Injectable au niveau du composant (voir `providers` sur ViewDeck) : chaque instance de la page
// doit repartir d'un cache vide, et le Renderer2 passé à `decorate` doit être celui du composant
// hôte pour que les éléments créés portent le bon attribut de scoping CSS (cf documentation).
@Injectable()
export class DeckLinkDecoratorService {

  private apiService = inject(ApiService);
  private deckSummaryByKey = new Map<string, Observable<{ title: string, owner: string }>>();

  decorate(container: HTMLElement, renderer: Renderer2): void {
    this.collectPlainTextNodes(container).forEach(textNode => this.replaceDeckLinksInTextNode(textNode, renderer));
  }

  private collectPlainTextNodes(root: HTMLElement): Text[] {
    // Exclut le texte des chips déjà créés, pour ne pas les re-décorer à la passe suivante.
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: node =>
        (node as Text).parentElement?.closest('.deck-link-chip')
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT
    });

    const textNodes: Text[] = [];
    let currentNode: Node | null;
    while ((currentNode = walker.nextNode())) {
      textNodes.push(currentNode as Text);
    }
    return textNodes;
  }

  private replaceDeckLinksInTextNode(textNode: Text, renderer: Renderer2): void {
    const text = textNode.textContent ?? '';
    const matches = [...text.matchAll(DECK_LINK_TOKEN_PATTERN)];
    const parent = textNode.parentNode;
    if (matches.length === 0 || !parent) {
      return;
    }

    let cursor = 0;
    matches.forEach(match => {
      const [rawUrl, , deckId, deckVersion] = match;
      const matchStart = match.index ?? 0;

      this.insertTextBefore(parent, text.slice(cursor, matchStart), textNode, renderer);
      renderer.insertBefore(parent, this.createDeckLinkChip(rawUrl, deckId, Number(deckVersion), renderer), textNode);
      cursor = matchStart + rawUrl.length;
    });
    this.insertTextBefore(parent, text.slice(cursor), textNode, renderer);

    renderer.removeChild(parent, textNode);
  }

  // Renderer2 pour que les nœuds créés respectent l'encapsulation de vue Angular et restent ciblés par le CSS scopé du composant. Cf doc
  private insertTextBefore(parent: Node, text: string, referenceNode: Node, renderer: Renderer2): void {
    if (text.length > 0) {
      renderer.insertBefore(parent, renderer.createText(text), referenceNode);
    }
  }

  private createDeckLinkChip(url: string, deckId: string, deckVersion: number, renderer: Renderer2): HTMLAnchorElement {
    const anchor: HTMLAnchorElement = renderer.createElement('a');
    renderer.setAttribute(anchor, 'href', url);
    renderer.setAttribute(anchor, 'target', '_blank');
    renderer.setAttribute(anchor, 'rel', 'noopener noreferrer');
    renderer.addClass(anchor, 'deck-link-chip');
    renderer.appendChild(anchor, renderer.createText(url));

    this.getDeckSummary(deckId, deckVersion).subscribe(({title, owner}) => {
      anchor.textContent = `${title} - ${owner}`;
    });

    return anchor;
  }

  private getDeckSummary(deckId: string, version: number): Observable<{ title: string, owner: string }> {
    const cacheKey = `${deckId}-${version}`;
    if (!this.deckSummaryByKey.has(cacheKey)) {
      this.deckSummaryByKey.set(cacheKey, this.apiService.getDeckForCrawler({id: deckId, version}).pipe(shareReplay(1)));
    }
    return this.deckSummaryByKey.get(cacheKey)!;
  }
}

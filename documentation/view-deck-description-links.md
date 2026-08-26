# Liens vers d'autres decks dans la description (`view-deck`)

Fichiers concernés : `src/app/decklists/view/view-deck/view-deck.ts`, `.html`, `.scss`,
et `deck-link-decorator.service.ts` (logique de remplacement extraite dans un service).

## Contexte

La description d'un deck est du HTML produit par l'éditeur Quill côté création
(`decklists/create`), enregistré tel quel en base, puis réinjecté via
`[innerHTML]` sur la page de consultation (`description()` dans `view-deck.ts`).

Certains auteurs y collent l'URL d'un autre deck du site pour y faire
référence (ex: "basé sur la version de Tonalite :
`https://krosmaga.tools/decks/view/141da121-.../2/0`"). Quill ne transforme
**pas** ces URL en balises `<a>` : ce sont de simples URL en texte brut dans
le HTML stocké. On veut, à l'affichage, remplacer ce texte par un lien discret
"titre - auteur" (bordure + fond), toujours cliquable et ouvrant la page dans
un nouvel onglet.

Ce document explique le fonctionnement et les pièges déjà rencontrés, pour
éviter de les re-découvrir un par un.

## Fonctionnement général

Toute la logique de détection/remplacement vit dans `DeckLinkDecoratorService`
(`deck-link-decorator.service.ts`), fourni au niveau du composant `ViewDeck`
(`providers: [DeckLinkDecoratorService]`) plutôt qu'en `providedIn: 'root'` :
chaque instance de la page doit repartir d'un cache de résumés de decks vide,
comme c'était le cas quand ce cache était un champ d'instance de `ViewDeck`.

1. `afterRenderEffect` (dans le constructeur de `ViewDeck`) observe le signal
   `description()`. À chaque fois qu'il change (nouveau deck, nouvelle
   langue, nouvelle version...) et une fois le DOM à jour, il appelle
   `deckLinkDecorator.decorate(container, this.renderer)` — le `Renderer2` du
   composant est passé en paramètre plutôt qu'injecté dans le service
   lui-même (voir piège dédié ci-dessous : c'est ce `Renderer2` précis, lié
   au composant, qui garantit le bon scoping CSS).
2. `collectPlainTextNodes` parcourt tous les nœuds texte du conteneur
   (`#descriptionContainer`) via un `TreeWalker`, en excluant ceux déjà
   contenus dans un lien qu'on a nous-mêmes créé (`.deck-link-chip`), pour ne
   pas les re-transformer à la passe suivante.
3. `replaceDeckLinksInTextNode` cherche dans le texte brut toutes les
   occurrences du pattern `DECK_LINK_TOKEN_PATTERN` (une URL, absolue ou
   relative, pointant vers `/decks/view/:id/:version/:minorVersion`) et
   reconstruit le nœud texte : morceaux de texte inchangés + `<a>` créés à la
   volée pour chaque URL trouvée.
4. `createDeckLinkChip` crée le lien (`href`, `target="_blank"`,
   `rel="noopener noreferrer"`, classe `deck-link-chip`), affiche l'URL brute
   en attendant, puis appelle `getDeckSummary` pour remplacer le texte par
   `"titre - auteur"` une fois la réponse API reçue.
5. `getDeckSummary` appelle `ApiService.getDeckForCrawler({id, version})` et
   met le résultat en cache (`deckSummaryByKey`, `shareReplay(1)`) par
   `id-version`, pour ne pas refaire l'appel si le même deck est référencé
   plusieururs fois dans la description.

## Pièges déjà rencontrés

### Il n'y a pas de `<a>` à décorer, seulement du texte

Première approche (fausse) : chercher des balises `<a>` existantes dans la
description et les décorer. En pratique, les auteurs collent juste l'URL en
texte brut — Quill ne la linkifie pas automatiquement. Il faut donc scanner
le texte lui-même (regex + `TreeWalker`), pas le DOM des liens.

### Duplication du template responsive → `viewChild` ne trouvait pas le bon nœud

Le template affichait autrefois **deux** instances du bloc STATS/CARDS/DESC
(`shortScreenContainer` et `largeScreenContainer`), toutes deux présentes en
même temps dans le DOM et juste masquées en CSS (`display: none`) selon la
largeur d'écran. `viewChild('descriptionContainer')` (singulier) ne
récupérait que la première occurrence, qui n'était pas forcément celle
visible à l'écran — la décoration semblait "ne rien faire" alors qu'elle
s'appliquait bien, mais sur la copie cachée.

Solution retenue : refactor du template pour n'avoir **qu'une seule**
instance de STATS/CARDS/DESC, réagencée en CSS via `flex-direction` selon un
`@media (min-width: 1400px)` sur `.container` (voir `view-deck.scss`). Ce
n'était pas qu'un problème de style : dupliquer tout l'arbre dupliquait aussi
`<app-view-list>`, `<app-synthesis>`, et surtout les iframes Twitch/YouTube
(potentiellement deux lecteurs vidéo actifs en même temps).

Si un jour le template redevient dupliqué pour une raison quelconque, il
faudra repasser `viewChild` en `viewChildren` et décorer chaque occurrence.

### Le CSS `.deck-link-chip` ne s'appliquait pas

Les éléments créés via `document.createElement('a')` n'ont pas l'attribut de
scoping (`_ngcontent-xxx`) qu'Angular ajoute aux éléments de son propre
template. En `ViewEncapsulation.Emulated` (le mode par défaut), les règles
SCSS du composant sont compilées avec ce même attribut ajouté au sélecteur
(`.deck-link-chip[_ngcontent-xxx]`), donc un `<a>` créé "à la main" n'est
jamais ciblé.

Solution : créer et manipuler ces nœuds via `Renderer2`
(`createElement`, `createText`, `insertBefore`, `removeChild`, `addClass`,
`setAttribute`) plutôt que via l'API DOM native. `Renderer2` est l'abstraction
Angular pour manipuler le DOM depuis un composant ; il applique
automatiquement le bon attribut de scoping aux nœuds qu'il crée. Règle
générale à retenir pour tout futur composant : dès qu'on manipule le DOM de
façon impérative en dehors du template, passer par `Renderer2`, jamais par
`document.createElement` / `appendChild` / etc. directement.

**Corollaire pour `DeckLinkDecoratorService`** : le service ne fait volontairement
pas `inject(Renderer2)` lui-même. Un `Renderer2` injecté en dehors du contexte
d'un composant (typiquement dans un service `providedIn: 'root'` ou instancié
sans lien avec une vue) est résolu sans élément/type hôte, donc sans
l'attribut de scoping du composant appelant — ça reproduirait exactement ce
piège. Le service reçoit donc le `Renderer2` du composant en paramètre de
`decorate(container, renderer)`, et le propage à ses méthodes privées.

## Limites connues / pistes non traitées

- Le regex `DECK_LINK_TOKEN_PATTERN` matche n'importe quel host devant
  `/decks/view/...` (pas de vérification que l'host est bien celui du site).
  Sans risque de sécurité ici (on ne fait qu'un `GET` public en lecture sur
  l'API), mais à garder en tête si le pattern doit un jour être réutilisé
  ailleurs.
- Pas de gestion d'erreur si `getDeckForCrawler` échoue (le lien reste alors
  affiché avec l'URL brute en texte, ce qui reste un état acceptable pour
  l'utilisateur).

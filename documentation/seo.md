# SEO : sitelinks Google et aperçus de partage

Fichiers concernés : `public/robots.txt`, `public/sitemap.xml`, `src/index.html`,
`src/app/app.routes.ts`, `src/app/seo.service.ts`,
`src/app/decklists/view/view-deck/view-deck.ts`.

## Contexte

Deux besoins distincts, avec deux publics différents :

- Des **sitelinks** (les liens secondaires affichés sous le résultat principal
  dans une recherche Google) vers Accueil, Decks et Media. Public : **Googlebot**,
  qui exécute le JavaScript.
- Un **aperçu de partage** correct (titre du deck + auteur) quand un lien de
  deck est collé sur Discord, Twitter/X, Facebook... Public : les **bots de
  prévisualisation** de ces plateformes, qui **n'exécutent pas** le JavaScript
  — ils ne lisent que le HTML brut renvoyé par le serveur à la première requête.

Cette seconde contrainte est la raison pour laquelle les balises `og:*`/`title`
posées dynamiquement par Angular ne suffisent que si l'app tourne en **SSR**
(rendu serveur) au moment où le bot fait sa requête — ce qui est le cas en
production ici (le bloc `server`/`prerender`/`ssr` d'`angular.json`, désactivé
en local pour un dev plus rapide, est réactivé manuellement avant chaque build
de déploiement).

## `robots.txt`

Fichier texte à la racine du domaine (`https://krosmaga.tools/robots.txt`)
qui indique aux robots d'indexation ce qu'ils ont le droit de parcourir.

```
User-agent: *
Allow: /

Sitemap: https://krosmaga.tools/sitemap.xml
```

- `User-agent: *` : la règle s'applique à tous les robots.
- `Allow: /` : autorise l'exploration de tout le site (par défaut tout est
  déjà autorisé en l'absence de `Disallow`, mais l'expliciter est une
  convention courante).
- `Sitemap: ...` : indique où trouver le sitemap, en complément d'une
  éventuelle soumission manuelle dans Google Search Console.

Ce fichier ne garantit ni n'empêche l'indexation à lui seul : il ne fait que
guider le crawl.

## `sitemap.xml`

Liste des URL du site que l'on souhaite voir indexées, avec des métadonnées
optionnelles par URL :

```xml
<url>
  <loc>https://krosmaga.tools/decks/browse</loc>
  <changefreq>daily</changefreq>
  <priority>0.8</priority>
</url>
```

- `<loc>` : l'URL canonique de la page.
- `<changefreq>` : à quelle fréquence la page est censée changer
  (`always`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`, `never`).
  C'est une **indication pour aider Googlebot à planifier ses passages**, pas
  une consigne suivie à la lettre — Google se base surtout sur ses propres
  observations de changement réel de la page pour décider de la fréquence de
  recrawl, et ignore ouvertement cette balise si elle est jugée peu fiable.
  Valeurs choisies ici : `weekly` pour l'accueil (peu de changement),
  `daily` pour la liste des decks et media (contenu qui évolue avec les
  publications de la communauté).
- `<priority>` : priorité relative entre les URL du site (0.0 à 1.0), utilisée
  seulement au sein du site lui-même. Google indique aujourd'hui ne quasiment
  plus en tenir compte pour le classement — laissé ici surtout comme
  indication humaine de la hiérarchie du site (accueil > decks > media).

Comme `robots.txt`, le sitemap **facilite la découverte**, il ne force ni le
classement ni l'apparition de sitelinks.

## JSON-LD (données structurées)

Bloc de métadonnées au format JSON, inséré dans le HTML via
`<script type="application/ld+json">`, qui décrit la page dans un vocabulaire
standardisé (schema.org) que les moteurs de recherche savent parser
directement, sans avoir à interpréter le contenu visuel de la page.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Kmtools",
  "url": "https://krosmaga.tools"
}
```

`@type: WebSite` déclare simplement "ce site s'appelle Kmtools et son URL
racine est celle-ci" — utile pour que Google associe clairement la marque à
son URL, un des facteurs qui contribue (parmi beaucoup d'autres, jamais
suffisant à lui seul) à l'éligibilité aux sitelinks et à l'affichage du nom du
site dans les résultats.

**Point important** : il n'existe **aucun type JSON-LD qui déclenche des
sitelinks de navigation classiques**. Le type `SiteNavigationElement` a
existé dans le vocabulaire schema.org, mais Google ne l'a jamais documenté
comme un signal officiel pour ça — s'appuyer dessus serait trompeur. Les
sitelinks restent décidés uniquement par l'algorithme de Google.

## Pourquoi les sitelinks ne peuvent pas être "ajoutés"

Contrairement au titre, à la description ou à l'aperçu de partage (qui sont
du contenu qu'on *fournit* directement au bot), les sitelinks sont un
**résultat calculé** par Google à partir de signaux qu'on ne contrôle pas
directement :

- structure et cohérence de la navigation du site dans le temps,
- autorité du domaine (âge, liens entrants, trafic),
- comportement de clic agrégé sur de nombreuses recherches "marque".

Ce qu'on peut faire ici (sitemap, robots.txt, titres/descriptions distincts,
JSON-LD, canonical) **maximise l'éligibilité** sans rien garantir, et
l'éventuel résultat n'est observable qu'après indexation et un peu de trafic
(semaines à mois), via Google Search Console. On peut aussi *demander la
suppression* d'un sitelink existant dans Search Console, mais pas en demander
l'ajout.

## Débogueurs / outils de vérification

| Outil | Usage |
|---|---|
| [Google Rich Results Test](https://search.google.com/test/rich-results) | Valide le JSON-LD et simule ce que Googlebot voit sur une URL donnée. |
| [Google Search Console](https://search.google.com/search-console) | Inspection d'URL (voir le rendu réel indexé par Google), soumission du sitemap, suivi de l'indexation et, plus tard, des sitelinks générés. |
| [Schema.org Validator](https://validator.schema.org/) | Validation générique de n'importe quel bloc JSON-LD/microdata, indépendante de Google. |
| [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) | Montre l'aperçu Facebook et permet de forcer un re-scrape (le cache d'aperçu Facebook est sinon très persistant). |
| [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) | Équivalent LinkedIn, avec son propre cache à invalider manuellement. |
| Twitter/X Card Validator | Outil historiquement à `cards-dev.twitter.com/validator`, dont la disponibilité est irrégulière depuis le rachat par X — à défaut, tester en publiant/prévisualisant un tweet contenant le lien. |
| Discord | Pas d'outil de debug officiel : coller le lien dans un salon de test. Le cache d'aperçu Discord est lui aussi persistant — ajouter un paramètre bidon à l'URL (ex. `?v=2`) force un nouvel aperçu pendant les tests. |

Pour l'aperçu de partage des decks spécifiquement (Étape 4 du plan), le test
qui compte est de vérifier le **HTML brut renvoyé par le serveur** (avant
exécution JS) — via `curl` sur l'URL en prod, ou directement via ces
débogueurs qui simulent un bot non-JS.

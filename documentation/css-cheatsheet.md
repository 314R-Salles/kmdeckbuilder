# Pense-bête CSS

Notes courtes sur des pièges ou subtilités CSS rencontrés dans le projet,
au fil de l'eau. Contrairement aux autres fichiers de `documentation/`, celui-ci
n'est pas dédié à un pattern précis : chaque section est une entrée
indépendante, à consulter en cas de doute plutôt qu'à lire linéairement.

## Media query vs container query : pas interchangeables automatiquement

Une `@media (max-width: ...)` et une `@container (max-width: ...)` répondent
à la même syntaxe mais pas à la même question, et remplacer l'une par l'autre
sans réfléchir peut casser silencieusement une règle.

- **`@media`** réagit à la taille du **viewport** (ou du device). Elle peut
  cibler n'importe quel sélecteur dans la page, y compris l'élément qui sert
  de racine de mise en page, sans restriction.
- **`@container`** réagit à la taille d'un **élément conteneur** ancêtre
  (celui qui porte `container-type: inline-size` / `size` / `normal`).
  Contrainte importante de la spec CSS Containment : **un élément ne peut pas
  être son propre conteneur de requête**. Autrement dit, si `.foo` porte
  `container-type`, une règle `@container (...) { .foo { ... } }` ciblant
  `.foo` lui-même est **silencieusement ignorée** par le moteur (pas
  d'erreur, pas de warning) — seules les règles ciblant des **descendants**
  de `.foo` s'appliquent. La raison : autoriser la self-query créerait une
  dépendance circulaire (la taille de l'élément dépendrait d'une règle qui
  dépend elle-même de cette taille).

Cas vécu dans `deck-preview.scss` : `.deck` portait `container-type:
inline-size` **et** était ciblé dans son propre bloc `@container (max-width:
768px) { .deck { height: 105px; } }`. Toutes les règles du bloc ciblant des
descendants (`.leftBlock`, `.tagLabel`, `.info`...) fonctionnaient, seule
celle ciblant `.deck` lui-même (`height`, `padding`) était ignorée.

Solution : porter `container-type` sur un ancêtre distinct de l'élément à
restyler — ici `:host` (l'élément `<app-deck-preview>`, ancêtre réel de
`.deck` dans le DOM) plutôt que `.deck` lui-même. `.deck` devient alors un
simple descendant du conteneur, et toutes ses propriétés (y compris sa
propre `height`) peuvent être modifiées dans le `@container`.

```scss
// ❌ .deck ne peut pas se restyler lui-même via sa propre container query
.deck {
  container-type: inline-size;
  height: 160px;
}
@container (max-width: 768px) {
  .deck { height: 105px; } // ignoré silencieusement
}

// ✅ le conteneur est porté par un ancêtre distinct de l'élément restylé
:host {
  display: block;
  container-type: inline-size;
}
.deck {
  height: 160px;
}
@container (max-width: 768px) {
  .deck { height: 105px; } // s'applique normalement
}
```

À vérifier en premier si une règle dans un bloc `@container` ne se déclenche
pas alors que les autres règles du même bloc fonctionnent : le sélecteur en
cause cible-t-il exactement l'élément qui porte `container-type` ?

## Espacer des enfants flex : `gap` plutôt que `margin`/`padding`

Sur un conteneur `display: flex` (ou `grid`), préférer `gap` pour espacer les
enfants entre eux plutôt que d'ajouter un `margin` (ou un `padding`) sur
chaque enfant. Exemple présent dans `deck-preview.scss` (`.tag { margin-right:
5px; }`, répété sur chaque tag d'une ligne flex) :

```scss
// ❌ margin sur l'enfant : porte la responsabilité de l'espacement sur
// chaque enfant, doit être répété/ajusté (:last-child, etc.) et s'accumule
// mal si l'enfant est réutilisé ailleurs sans le même besoin d'espacement
.tags {
  display: flex;
}
.tag {
  margin-right: 5px;
}

// ✅ gap sur le parent : l'espacement est une propriété de la mise en page
// (le conteneur), pas du composant enfant
.tags {
  display: flex;
  gap: 5px;
}
.tag {
  // plus de margin-right ici
}
```

Pourquoi c'est préférable :
- **Séparation des responsabilités** : l'espacement entre éléments est une
  décision de layout, donc elle revient au conteneur qui organise ces
  éléments — pas à chaque enfant, qui n'a pas à savoir qu'il fait partie
  d'une rangée espacée. Un enfant stylé avec ses propres marges devient plus
  difficile à réutiliser ailleurs (form standalone, autre conteneur...) sans
  traîner un espacement qui n'a plus de sens.
- **Pas de bricolage aux bords** : avec `margin-right` sur chaque enfant, le
  dernier élément traîne une marge en trop à droite, qu'on corrige
  classiquement avec `:last-child { margin-right: 0; }`. Avec `gap`, l'espace
  n'existe qu'*entre* les enfants, jamais avant le premier ni après le
  dernier — pas de cas particulier à gérer.
- **Un seul endroit à modifier** : changer l'espacement, c'est changer une
  valeur sur le conteneur, pas rechercher/remplacer une valeur dupliquée sur
  chaque règle d'enfant.

Limite à connaître : `gap` s'applique uniquement entre enfants directs du
conteneur flex/grid. S'il faut aussi de l'espace *autour* du groupe (avant le
premier enfant, après le dernier), ça reste le rôle du `padding` sur le
conteneur — les deux ne sont pas mutuellement exclusifs, `gap` remplace
seulement les marges *entre* enfants.

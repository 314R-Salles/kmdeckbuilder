# Subset local de la police Material Symbols Outlined

Fichiers concernés : `src/assets/mi-outlined-400.woff2`, `src/styles.scss`
(bloc `@font-face` + classe `.material-symbols-outlined`),
`src/app/app.config.ts` (`MatIconRegistry.setDefaultFontSetClass('material-symbols-outlined')`).

## Contexte

L'app utilise les icônes Material Symbols via `<mat-icon>` d'Angular
Material, en mode "font ligature" : le texte affiché dans la balise est le
nom de l'icône côté Google (ex. `<mat-icon>logout</mat-icon>`,
`header.html`), et c'est la police qui remplace visuellement ce texte par le
glyphe via une substitution OpenType (table **GSUB**, feature **`liga`**).
Ça ne fonctionne **que** si la police chargée contient cette table de
ligatures — un point de code Unicode "zone privée" (PUA) classique
(`\ue9ba`, etc.) ne suffit pas ici, contrairement à l'ancienne génération
Material Icons (Font Awesome-like, classes `.mi-logout::before{content:...}`).

Pour éviter de télécharger la police Google complète (~4 Mo, des milliers
d'icônes, tous les poids), on charge un **sous-ensemble local** ne contenant
que les icônes réellement utilisées par l'app, tout en conservant la table
de ligatures.

## Ce qui a été fait

1. Identifié que l'app dépend du mécanisme de ligature (`<mat-icon>` +
   `setDefaultFontSetClass`), pas d'un système à base de classes CSS par
   icône.
2. Récupéré la vraie police Google via le package npm officiel
   [`material-symbols`](https://www.npmjs.com/package/material-symbols)
   (toujours à jour, contient les icônes récentes comme
   `right_panel_close`, absente de l'ancien set "Material Icons").
3. Sous-setté cette police avec [`subset-font`](https://www.npmjs.com/package/subset-font)
   (bindings HarfBuzz/WASM), en passant en **texte** les noms d'icônes (pas
   des codepoints) : HarfBuzz calcule alors la fermeture de glyphes en
   tenant compte du GSUB et conserve la substitution en ligature pour
   exactement ces noms-là.
4. Figé les axes de variation (police variable à la base) sur des valeurs
   statiques : `wght=400`, `FILL=0`, `GRAD=0`, `opsz=24` — ce sont les
   valeurs implicites déjà utilisées par `.material-symbols-outlined` dans
   `styles.scss` (`font-size: 24px`, style "outlined" non rempli), et ça
   réduit encore la taille du fichier (pas de table `gvar`).
5. Résultat : **~179 Ko** (vs ~4 Mo pour la police complète), remplaçant
   `src/assets/mi-outlined-400.woff2`.
6. Vérifié avec [`fontkit`](https://www.npmjs.com/package/fontkit) que
   chaque nom d'icône se résout bien en un seul glyphe après subsetting
   (donc que la ligature a survécu — voir script de vérification plus bas).
7. Ajouté `font-feature-settings: 'liga'` (+ `text-rendering`,
   `-moz-osx-font-smoothing`) à `.material-symbols-outlined` dans
   `styles.scss`, pour matcher exactement la CSS officielle de Google et
   sécuriser l'activation de la ligature (les navigateurs l'activent par
   défaut via `font-variant-ligatures`, mais autant l'expliciter).

Aucune modification n'a été nécessaire dans `angular.json` (le dossier
`src/assets` est déjà servi tel quel) ni dans les composants/templates.

## Piège rencontré : mauvaise première tentative

Une première tentative a utilisé la librairie npm
[`subset-iconfont`](https://github.com/dzhuang/subset-iconfont) (copie
locale dans `C:\Users\salle\programmation\subset-iconfont-1.0.3`) et son
`MiProvider`, pensé pour l'ancien set **"Material Icons"** classique (pas
Material Symbols) à la façon Font Awesome : un point de code PUA par icône
+ une classe CSS par icône (`.mi-outlined.mi-logout`). Ce n'est **pas** un
système de ligatures, donc incompatible avec `<mat-icon>logout</mat-icon>`
(le texte "logout" se serait affiché tel quel, sans devenir une icône). Le
fichier généré portait par coïncidence le même nom
(`mi-outlined-400.woff2`) que celui déjà présent dans `src/assets`, ce qui
aurait pu masquer le problème si l'app n'avait pas été testée. Cette
librairie reste utile pour des projets basés sur des classes CSS façon Font
Awesome, mais pas pour ce projet.

À retenir : avant de resubsetter une police d'icônes, vérifier **comment
elle est consommée côté app** (classe CSS par icône vs. ligature texte) —
les deux approches ne sont pas interchangeables au niveau du fichier de
police lui-même.

## Comment reproduire (ajout de nouvelles icônes)

Étapes pour régénérer `src/assets/mi-outlined-400.woff2` avec une liste
d'icônes mise à jour. Nécessite Node.js (pas de dépendance ajoutée au
projet : tout se fait dans un dossier temporaire).

### 1. Trouver le nom exact des icônes

Sur [Google Fonts – Material Symbols](https://fonts.google.com/icons?icon.set=Material+Symbols),
style **Outlined**. Le nom à utiliser est celui en `snake_case` affiché
sous l'icône (ex. `right_panel_close`), pas une version avec des tirets.

### 2. Préparer un dossier de travail temporaire

```sh
mkdir mat-symbols-scratch && cd mat-symbols-scratch
npm init -y
npm install material-symbols@latest subset-font fontkit --no-save
```

(Installer les trois en une seule commande — sinon `npm install` peut
purger les paquets déjà installés qui ne sont pas listés dans
`package.json`.)

### 3. Créer le script de subsetting (`subset-ligatures.js`)

```js
const { readFileSync, writeFileSync } = require('fs');
const subsetFont = require('subset-font');

// Mettre à jour cette liste : ajouter/retirer des noms d'icônes
// (snake_case, exactement comme sur fonts.google.com/icons).
const icons = [
  'logout',
  'cached',
  'info',
  'delete',
  'add',
  'contact_page',
  'keyboard_backspace',
  'warning',
  'arrow_drop_down',
  'right_panel_close',
  'tune',
  'favorite',
  'arrow_upward',
  'arrow_downward',
  // 'nouvelle_icone',
];

const srcPath = './node_modules/material-symbols/material-symbols-outlined.woff2';
const outPath = './mi-outlined-400.woff2';

const srcBuffer = readFileSync(srcPath);
const text = icons.join(' ');

subsetFont(srcBuffer, text, {
  targetFormat: 'woff2',
  variationAxes: {
    wght: 400,
    FILL: 0,
    GRAD: 0,
    opsz: 24,
  },
})
  .then((buf) => {
    writeFileSync(outPath, buf);
    console.log(`Wrote ${outPath} (${buf.length} bytes) with icons: ${icons.join(', ')}`);
  })
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
```

### 4. (Optionnel mais recommandé) Script de vérification (`verify.js`)

Confirme que chaque icône se résout bien en un seul glyphe (donc que la
ligature fonctionne) avant de déployer le fichier :

```js
const fontkit = require('fontkit');

const icons = [/* même liste que ci-dessus */];

const font = fontkit.openSync('./mi-outlined-400.woff2');
for (const name of icons) {
  const run = font.layout(name, ['liga']);
  console.log(`${name} -> ${run.glyphs.length} glyphe(s)`);
  if (run.glyphs.length !== 1) {
    console.error(`  ATTENTION: "${name}" ne se résout pas en 1 seul glyphe.`);
  }
}
```

Un résultat différent de 1 glyphe pour une icône signifie qu'elle n'a pas
été trouvée dans la police (nom incorrect) ou que la ligature ne s'est pas
appliquée.

### 5. Générer et vérifier

```sh
node subset-ligatures.js
node verify.js
```

### 6. Déployer le résultat

```sh
cp mi-outlined-400.woff2 /chemin/vers/kmdeckbuilder/src/assets/mi-outlined-400.woff2
```

Aucune autre modification n'est nécessaire (même nom de fichier, même
`@font-face` dans `styles.scss`). Relancer `ng serve`/`ng build` et
vérifier visuellement que les icônes s'affichent (et pas le texte brut du
nom de l'icône, signe que la ligature n'a pas fonctionné).

### 7. Nettoyer

```sh
cd .. && rm -rf mat-symbols-scratch
```

## Limites connues / pistes non traitées

- Pas de script de génération versionné dans le repo (`kmdeckbuilder`) : la
  procédure ci-dessus est manuelle, à refaire dans un dossier temporaire à
  chaque ajout d'icône. Si les icônes changent souvent, ça vaut le coup
  d'ajouter `material-symbols` et `subset-font` en `devDependencies` et un
  script npm (`icons:build`) qui automatise tout ça directement dans le
  projet.
- La liste des icônes n'est définie nulle part de façon centralisée (ni
  dans un fichier de config, ni dérivée automatiquement d'un grep sur les
  templates) — elle vit uniquement dans le script de subsetting au moment
  où il est exécuté. Un oubli lors de l'ajout d'une icône dans un template
  sans mettre à jour le subset se traduirait par le texte brut du nom
  affiché au lieu de l'icône.

# `DatePipe` : format, timezone ignorée, locale par langue

Fichiers concernés : `src/app/decklists/search/deck-preview/deck-preview.ts`,
`src/app/decklists/search/deck-preview/deck-preview.html` (usage actuel) ;
`src/app/app.config.ts` (déclaration de la locale FR).

## Signature du pipe

`DatePipe.transform` (`@angular/common`) prend ses arguments **par
position**, pas par nom :

```ts
transform(value: Date | string | number, format?: string, timezone?: string, locale?: string): string | null
```

Dans un template, ça donne :

```html
{{ deck().creationDate | date:'longDate':undefined:dateLocale() }}
```

- `'longDate'` → `format`
- `undefined` → `timezone`
- `dateLocale()` → `locale`

## Pourquoi `undefined` en 3e position

TypeScript/Angular n'a pas d'équivalent des arguments nommés (contrairement à
Python `format=..., locale=...`). Pour renseigner le 4e paramètre (`locale`)
sans imposer de fuseau horaire particulier, il faut occuper la 3e position
(`timezone`) avec une valeur explicite. `undefined` est justement la valeur
par défaut que `DatePipe` utilise en interne quand `timezone` n'est pas
fourni (il retombe alors sur le fuseau du navigateur) : le passer
explicitement permet donc de "sauter" ce paramètre sans changer le
comportement par défaut, uniquement pour atteindre `locale`.

## Locale EN par défaut, FR à déclarer explicitement

Angular embarque nativement les données de la locale `en-US` (`LOCALE_ID` par
défaut). Pour toute autre locale, il faut enregistrer ses données via
`registerLocaleData` avant de pouvoir l'utiliser dans un pipe — sinon Angular
lève une erreur au runtime (`Missing locale data for the locale "fr"`).

C'est fait une fois pour toute l'app dans `app.config.ts` :

```ts
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';

// déclarer les locales autres que la locale par défaut EN
registerLocaleData(localeFr);
```

Dans `deck-preview.ts`, la locale à passer au pipe est dérivée de la langue
courante de l'app (`StoreService`) :

```ts
private currentLanguage = toSignal(this.storeService.getLanguage());
// seule la langue FR a une locale de date dédiée ; toutes les autres langues restent en EN
dateLocale = computed(() => this.currentLanguage() === 'FR' ? 'fr' : 'en-US');
```

## Limites connues / pistes non traitées

- Seule la locale `fr` est enregistrée. Si une langue de l'app (`BR`, `ES`,
  `RU`, cf. `CLAUDE.md`) doit un jour afficher une date dans sa propre
  locale plutôt qu'en `en-US`, il faudra `registerLocaleData` la locale
  correspondante dans `app.config.ts` et étendre le `computed` de
  `dateLocale` en conséquence.
- Le couple `undefined:dateLocale()` est peu lisible dans le template à
  cause du paramètre positionnel muet. Une alternative serait d'exposer un
  `computed()` du type `formattedCreationDate()` qui encapsule l'appel au
  pipe (via `formatDate()` de `@angular/common`) et retourne directement la
  chaîne déjà formatée, pour ne plus exposer ce détail de signature dans le
  HTML.

import {RenderMode, ServerRoute} from '@angular/ssr';


// Si j'ai compris :
// Faire en sorte que Visu de deck soit généré par le serveur pour le SEO
// Tout le reste, on aura des balises génériques (pour l'instant) donc ça sera traité par le navigateur
export const serverRoutes: ServerRoute[] = [
  {
    path: 'decks/view/:id/:version/:minorVersion',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];


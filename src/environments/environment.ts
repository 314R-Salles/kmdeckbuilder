export const environment = {
  production: true,
  TWITCH_AUTH_URL: 'https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=048o30kiq54suyv43jio7boaknv8e2&redirect_uri=https://psalles.ovh/user&state=c3ab8aa609ea11e793ae92361f002671',
  JAVA_API: 'https://psalles.ovh:8080/api',
  TWITCH_PARENT: 'psalles.ovh', // si besoin d'un lecteur twitch, sauf que si déployé sur 2 site, pas constant.
};

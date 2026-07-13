// netlify/functions/mollie-webhook.js
// Webhook simple pour Mollie - juste retourne 200 OK

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Méthode non autorisée' };
  }

  try {
    console.log('Webhook Mollie reçu');
    // Pour maintenant, on accepte juste le webhook
    // Tu pourras l'améliorer plus tard avec une vraie base de données
    
    return { statusCode: 200, body: 'OK' };

  } catch (error) {
    return { statusCode: 500, body: 'Erreur serveur' };
  }
};

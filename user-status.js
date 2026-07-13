// netlify/functions/user-status.js
// Simple - juste retourne 200 OK

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  try {
    const { email } = JSON.parse(event.body);
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email requis' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        plan: 'free',
        questionsUsed: 0,
        questionsRemaining: 2,
        isNew: true
      })
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Erreur serveur' }) };
  }
};

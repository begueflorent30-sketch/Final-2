// netlify/functions/chat.js
// Chatbot avec compteur de questions gratuites
// Stockage simplifié en mémoire + localStorage du client

const FREE_LIMIT = 2;
const users = {}; // Stockage en mémoire simple

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  try {
    const { email, message, system } = JSON.parse(event.body);

    if (!email || !message) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email et message requis' }) };
    }

    const userKey = email.toLowerCase().trim();

    // Initialise l'utilisateur s'il n'existe pas
    if (!users[userKey]) {
      users[userKey] = { 
        email: userKey, 
        questionsUsed: 0,
        plan: 'free'
      };
    }

    // Vérifie s'il a atteint la limite gratuite
    if (users[userKey].questionsUsed >= FREE_LIMIT && users[userKey].plan === 'free') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          blocked: true,
          reply: "Tu as utilisé tes 2 diagnostics gratuits. Passe à l'offre Essentiel (9,90€/mois) pour un accès illimité.",
          questionsUsed: users[userKey].questionsUsed,
          questionsRemaining: 0,
          plan: 'free'
        })
      };
    }

    // Appel à l'API Claude
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Clé API non configurée' }) };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: system,
        messages: [{ role: 'user', content: message }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "Désolé, une erreur est survenue.";

    // Incrémenter le compteur seulement pour les utilisateurs gratuits
    if (users[userKey].plan === 'free') {
      users[userKey].questionsUsed += 1;
    }

    const remaining = Math.max(0, FREE_LIMIT - users[userKey].questionsUsed);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reply: reply,
        questionsUsed: users[userKey].questionsUsed,
        questionsRemaining: users[userKey].plan === 'free' ? remaining : null,
        plan: users[userKey].plan,
        blocked: false
      })
    };

  } catch (error) {
    console.error('Erreur chat:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur serveur', details: error.message })
    };
  }
};

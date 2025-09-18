export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    if (!process.env.VITE_ANTHROPIC_API_KEY || !process.env.VITE_ANTHROPIC_API_KEY.trim()) {
      return res.status(500).json({ error: 'VITE_ANTHROPIC_API_KEY is not set in environment' });
    }
  
    const apiKey = process.env.VITE_ANTHROPIC_API_KEY.trim();
  
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(req.body)
      });
  
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'API request failed' });
    }
  }
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    if (!process.env.VITE_ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'VITE_ANTHROPIC_API_KEY is not set in environment' });
    }
  
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'Authorization': `Bearer ${process.env.VITE_ANTHROPIC_API_KEY}`,
        },
        body: JSON.stringify(req.body)
      });
  
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'API request failed' });
    }
  }
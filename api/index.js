// Simple API handler for Vercel
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simple health check response
  res.status(200).json({
    status: 'success',
    message: 'Aashray API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    url: req.url,
    method: req.method
  });
};

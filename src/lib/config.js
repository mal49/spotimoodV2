const config = {
  API_BASE_URL: import.meta.env.PROD || window.location.hostname !== 'localhost'
    ? 'https://spotimood-production.up.railway.app'
    : 'http://localhost:3001',
  
  isDevelopment: import.meta.env.DEV && window.location.hostname === 'localhost',
  isProduction: import.meta.env.PROD || window.location.hostname !== 'localhost'
};

// Debug logging (remove after testing)
console.log('Environment check:', {
  'import.meta.env.PROD': import.meta.env.PROD,
  'window.location.hostname': window.location.hostname,
  'Final API_BASE_URL': config.API_BASE_URL
});

export default config;

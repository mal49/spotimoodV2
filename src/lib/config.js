const config = {
  API_BASE_URL: import.meta.env.PROD 
    ? 'https://your-actual-railway-url.railway.app'  // Replace with your Railway URL
    : 'http://localhost:3001',
  
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
};

export default config;

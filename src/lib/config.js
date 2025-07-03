const config = {
  API_BASE_URL: import.meta.env.PROD 
    ? 'https://your-backend-app.railway.app'  // We'll update this after Railway deployment
    : 'http://localhost:3001',
  
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
};

export default config;

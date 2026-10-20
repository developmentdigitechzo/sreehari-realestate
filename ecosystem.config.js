module.exports = {
  apps: [
    {
      name: 'sreehari-backend',
      cwd: './backend',
      script: 'dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        CORS_ORIGIN: 'https://sreeharirealty.com,http://sreeharirealty.com,https://www.sreeharirealty.com,http://www.sreeharirealty.com,http://localhost:3000,http://127.0.0.1:3000'
      }
    },
    {
      name: 'sreehari-frontend',
      cwd: './',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://sreeharirealty.com/api',
        NEXT_PUBLIC_SITE_URL: 'https://sreeharirealty.com',
        BACKEND_URL: 'http://127.0.0.1:5000'
      }
    }
  ]
};

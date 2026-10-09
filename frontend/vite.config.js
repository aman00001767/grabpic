import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      'import.meta.env.API_URL': JSON.stringify(env.API_URL || 'http://localhost:8000'),
      'import.meta.env.GOOGLE_CLIENT_ID': JSON.stringify(env.GOOGLE_CLIENT_ID || ''),
    },
  };
});

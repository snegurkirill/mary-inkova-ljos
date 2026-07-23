import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// In production the app is served from the GitHub Pages project subpath.
// Dev stays at '/'. The router reads import.meta.env.BASE_URL as its basename.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/mary-inkova-ljos/' : '/',
  plugins: [react()],
}))

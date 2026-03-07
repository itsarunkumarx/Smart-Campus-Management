import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh (default, but explicit)
      fastRefresh: true,
    }),
    tailwindcss(),
  ],

  // Dev server optimisations
  server: {
    hmr: true,
  },

  // Pre-bundle heavy dependencies on first run so they don't slow down page loads
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'axios',
      'lucide-react',
    ],
  },

  build: {
    // Silence chunk-size warnings
    chunkSizeWarningLimit: 1000,

    // Split vendor libraries into separate cacheable chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached forever by browsers
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Animation lib — large, rarely changes
          'vendor-framer': ['framer-motion'],
          // Icons — tree-shaken but still worth isolating
          'vendor-icons': ['lucide-react'],
          // HTTP layer
          'vendor-axios': ['axios'],
        },
      },
    },

    // Minify with esbuild (default, very fast)
    minify: 'esbuild',

    // Produce source maps for production debugging without exposing source
    sourcemap: false,

    // Target modern browsers for smaller output
    target: 'es2020',
  },
})

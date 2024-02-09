import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output:
      {
          format: 'es',
          strict: false,
          entryFileNames: "[name].js",
          dir: 'dist/'
      }
      
   }
   
  },
  css:{
    devSourcemap: true
  },
  server:{
    headers:{
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"

    }
    
  }
})

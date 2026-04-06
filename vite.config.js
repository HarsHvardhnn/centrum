import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Match production server.js meta for landings; used so “View page source” is correct under `vite` dev. */
function escapeHtmlForMeta(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const DEV_HTML_SEO_BY_PATH = {
  '/uslugi/ortopeda-dzieciecy-skarzysko': {
    title: 'Ortopeda dziecięcy Skarżysko – prywatnie, bez skierowania',
    description:
      'Ortopeda dziecięcy Skarżysko – konsultacje dla dzieci i niemowląt. Diagnostyka wad postawy i rozwoju układu ruchu, w tym USG bioderek.',
  },
}

function devHtmlSeoPlugin() {
  return {
    name: 'dev-html-seo-static-routes',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const raw = ctx.path ?? ''
        const p = raw.replace(/\/$/, '') || '/'
        const seo = DEV_HTML_SEO_BY_PATH[p]
        if (!seo) return html
        let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtmlForMeta(seo.title)}</title>`)
        out = out.replace(
          /<meta\s+name="description"[^>]*>/i,
          `<meta name="description" content="${escapeHtmlForMeta(seo.description)}" />`
        )
        return out
      },
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), devHtmlSeoPlugin()],
  optimizeDeps: {
    include: ['react-google-recaptcha-v3']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-helmet-async', 'sonner'],
          'form-vendor': ['formik', 'yup'],
          'auth-vendor': ['@react-oauth/google', 'react-google-recaptcha-v3'],
          // Large component chunks
          'editor-vendor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-image', '@tiptap/extension-link'],
          'calendar-vendor': ['react-big-calendar', 'date-fns'],
        },
        // Optimize chunk size warnings
        chunkSizeWarningLimit: 1000,
      },
    },
    // Increase chunk size limit
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging (optional, can be disabled for smaller builds)
    sourcemap: false,
  },
})

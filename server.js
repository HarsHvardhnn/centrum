import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

// Import slug utility function
const generateServiceSlug = (title) => {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    // Replace Polish characters with ASCII equivalents
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-');
};

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  app.use(vite.ssrLoadModule)
  app.use(vite.middlewares)

  // API routes - proxy to your backend
  app.use('/api', (req, res, next) => {
    // Proxy to your actual backend
    const backendUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:5000'
    const proxyUrl = `${backendUrl}${req.url}`
    
    // Simple proxy implementation
    fetch(proxyUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    })
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(err => {
      console.error('Proxy error:', err)
      res.status(500).json({ error: 'Backend error' })
    })
  })

  // SSR routes
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl

    try {
      // Check if this is a route that needs SSR
      const ssrRoutes = [
        /^\/aktualnosci\/[^\/]+$/,          // News detail pages (now using slugs)
        /^\/uslugi\/[^\/]+$/,               // Service detail pages
      ]

      const needsSSR = ssrRoutes.some(pattern => pattern.test(url))

      if (!needsSSR) {
        return next()
      }

      let template, render

      if (import.meta.env.NODE_ENV === 'production') {
        template = fs.readFileSync(
          path.resolve(__dirname, 'dist/client/index.html'),
          'utf-8'
        )
        render = (await import('./dist/server/entry-server.js')).render
      } else {
        // Dev mode
        template = fs.readFileSync(
          path.resolve(__dirname, 'index.html'),
          'utf-8'
        )
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render
      }

      // Pre-fetch data for SSR
      let initialData = {}
      
      // Extract route parameters
      if (url.includes('/aktualnosci/') && !url.includes('/aktualnosci/single/')) {
        const newsSlug = url.split('/aktualnosci/')[1]
        try {
          const newsResponse = await fetch(`${import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/news/slug/${newsSlug}`)
          if (newsResponse.ok) {
            initialData.news = await newsResponse.json()
          }
        } catch (error) {
          console.error('Error fetching news:', error)
        }
      }

      if (url.includes('/uslugi/')) {
        const serviceSlug = decodeURIComponent(url.split('/uslugi/')[1])
        try {
          const servicesResponse = await fetch(`${import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/services`)
          if (servicesResponse.ok) {
            const services = await servicesResponse.json()
            // Try to find by slug first, then fallback to title
            const service = services.find(s => 
              generateServiceSlug(s.title) === serviceSlug || s.title === serviceSlug
            )
            if (service) {
              initialData.service = service
            }
          }
        } catch (error) {
          console.error('Error fetching services:', error)
        }
      }

      const context = { initialData }
      const appHtml = render(url, context)

      // Generate meta tags based on the data
      const metaTags = generateMetaTags(url, initialData)

      const html = template
        .replace(`<!--ssr-outlet-->`, appHtml.html)
        .replace(`<!--meta-tags-->`, metaTags)
        .replace(`<!--initial-data-->`, `<script>window.__INITIAL_DATA__ = ${JSON.stringify(initialData)}</script>`)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      vite.ssrFixStacktrace(e)
      next(e)
    }
  })

  return app
}

// Generate meta tags for SEO
function generateMetaTags(url, data) {
  const baseTitle = "Centrum Medyczne"
  const baseDescription = "Profesjonalna opieka medyczna"
  
  let title = baseTitle
  let description = baseDescription
  let image = "/images/default-og.jpg"

  if (data.news) {
    title = `${data.news.title} - ${baseTitle}`
    description = data.news.shortDescription || data.news.description?.substring(0, 160) || baseDescription
    image = data.news.image || image
  }

  if (data.service) {
    title = `${data.service.title} - Usługi - ${baseTitle}`
    description = data.service.shortDescription || data.service.description?.substring(0, 160) || baseDescription
    image = data.service.images?.[0] || image
  }

  return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
  `
}

createServer().then(app => {
  app.listen(3000, () => {
    // console.log('Server running on http://localhost:3000')
  })
}) 
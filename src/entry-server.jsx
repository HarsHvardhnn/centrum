import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'
import { UserProvider } from './context/userContext'
import { ServicesProvider } from './context/serviceContext'

export function render(url, context = {}) {
  const html = renderToString(
    <StaticRouter location={url} context={context}>
      <UserProvider>
        <ServicesProvider>
          <App />
        </ServicesProvider>
      </UserProvider>
    </StaticRouter>
  )
  return { html, context }
} 
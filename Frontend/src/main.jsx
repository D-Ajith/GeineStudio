import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "next-themes";

import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)

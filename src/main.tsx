import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from "@/components/theme-provider"
import router from '@/routes'
import { Toaster } from '@/components/ui/toaster'
import '@/styles/global.css'
import { AnimatePresence } from "framer-motion";

const updateMetaThemeColor = (theme: string) => {
  const metaThemeColor = document.querySelector("meta[name=theme-color]");
  const metaBackgroundColor = document.querySelector("meta[name=background-color]");

  if (metaThemeColor && metaBackgroundColor) {
    switch (theme) {
      case 'dark':
        metaThemeColor.setAttribute("content", "#e2e8f0");
        metaBackgroundColor.setAttribute("content", "#0f172a");
        break;
      case 'light':
        metaThemeColor.setAttribute("content", "#059669");
        metaBackgroundColor.setAttribute("content", "#e2e8f0");
        break;
      default:
        metaThemeColor.setAttribute("content", "#000000");
        metaBackgroundColor.setAttribute("content", "#ffffff");
    }
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AnimatePresence  mode='wait'>
        <RouterProvider router={router} />
      </AnimatePresence>
    </ThemeProvider>
    <Toaster />
  </React.StrictMode>,
)

// Retrieve the stored theme from localStorage
const storedTheme = localStorage.getItem('vite-ui-theme') || 'dark';

// Initially update the theme color based on the stored theme
updateMetaThemeColor(storedTheme);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/src/service-worker.ts').then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch(error => {
      console.error('Service Worker registration failed:', error);
    });
  });
}
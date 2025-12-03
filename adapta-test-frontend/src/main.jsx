import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { store } from './services/store';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { ThemeProvider } from "@/components/theme-provider";
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        {/* CORRECCIÓN: Cambiado a "system" para mejor UX por defecto */}
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <App />
          <Toaster 
            position="bottom-right"
            expand={false}
            richColors
            closeButton
            theme="system"
            duration={3000}
          />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
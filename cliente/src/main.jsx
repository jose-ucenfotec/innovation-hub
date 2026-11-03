import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/main.scss';
import App from './App.jsx';
import { SesionProvider } from './context/SesionContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <SesionProvider>
          <App />
        </SesionProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
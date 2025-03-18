import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add Storylane script dynamically
const script = document.createElement('script');
script.src = 'https://js.storylane.io/js/v2/storylane.js';
script.async = true;
document.head.appendChild(script);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
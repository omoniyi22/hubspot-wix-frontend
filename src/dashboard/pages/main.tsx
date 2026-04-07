const injectTailwindCDN = () => {
  const script = document.createElement('script');
  script.src = 'https://cdn.tailwindcss.com';
  script.async = true;
  document.head.appendChild(script);
};

injectTailwindCDN();

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
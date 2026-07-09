import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { apiUrl } from './config/api.js';
import CustomAlertProvider from './components/CustomAlertProvider.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Global fetch interceptor to rewrite relative '/api/...' calls dynamically in production
const originalFetch = window.fetch;
window.fetch = function (resource, options) {
  if (typeof resource === 'string' && resource.startsWith('/api') && !resource.startsWith('http')) {
    return originalFetch(apiUrl(resource), options);
  }
  return originalFetch(resource, options);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <CustomAlertProvider>
        <App />
      </CustomAlertProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
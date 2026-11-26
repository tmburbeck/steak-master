// App entry point: loads Ionic's base styles and our theme, then renders <App />.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { setupIonicReact } from '@ionic/react';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './theme.css';
import App from './App';

// Use the iOS look for Ionic components on every platform, for a consistent style.
setupIonicReact({ mode: 'ios' });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

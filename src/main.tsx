import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

import { DataProvider } from './context/DataContext';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <DataProvider>
    <App />
  </DataProvider>
);

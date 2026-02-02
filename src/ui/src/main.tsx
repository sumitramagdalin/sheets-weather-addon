import { createRoot } from 'react-dom/client';
import App from './App';

const htmlElement: HTMLElement = document.getElementById('root')!;
createRoot(htmlElement).render(<App />);

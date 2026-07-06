import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Modal from './Modal';
import '../shared/styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter basename="/extensions">
      <Routes>
        <Route path="/modal" element={<Modal />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

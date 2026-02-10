import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Scoreboard from './components/Scoreboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="game/:sessionId" element={<Scoreboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MissionPage from './pages/MissionPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/mission/:id" element={<MissionPage />} />
    </Routes>
  );
}

export default App;

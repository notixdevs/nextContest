import { Routes, Route, MemoryRouter as BrowserRouter } from 'react-router-dom';
import Platforms from './pages/Platform';
import SelectedPlatformsPage from './pages/Contests';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SelectedPlatformsPage />} />
        <Route path="/select-platforms" element={<Platforms />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { useEffect } from 'react';
import { Routes, Route, MemoryRouter as BrowserRouter } from 'react-router-dom';
import Platforms from './pages/Platform';
import Contests from './pages/Contests';

function App() {
  useEffect(() => {
    chrome.runtime.sendMessage({ action: "startAlarm" });
  }, []); // only once on mount

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Contests />} />
        <Route path="/select-platforms" element={<Platforms />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { useEffect } from "react";
import { Routes, Route, MemoryRouter as BrowserRouter } from "react-router-dom";
import Platforms from "./pages/Platform";
import Contests from "./pages/Contests";

function App() {
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

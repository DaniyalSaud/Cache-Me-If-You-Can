import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HeroPage from "./components/HeroPage";
import AuthPage from "./components/AuthPage";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<HeroPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;


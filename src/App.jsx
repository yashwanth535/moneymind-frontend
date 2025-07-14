import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Error from "./pages/error/error";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/Landing";
import Home from "./pages/Home";
import NotFound from "./pages/error/PageNotFound";
import BackendStatusCheck from "./pages/error/BackendStatusCheck";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";

function App() {
  return (
    <Router>
       <Routes>
        {/* Public Route */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/error" element={<Error/>} />
        <Route path="*" element={<NotFound  />} />
        <Route path="/backend" element={<BackendStatusCheck />} />
        <Route path="/policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route element={<ProtectedRoute role="user"/>}>
          <Route path="/home" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

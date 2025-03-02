import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Error from "./pages/error/error";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/Landing";
import Home from "./pages/Home";
import NotFound from "./pages/error/PageNotFound";

function App() {
  return (
    <Router>
       <Routes>
        {/* Public Route */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/error" element={<Error/>} />
        <Route path="*" element={<NotFound  />} />

        <Route element={<ProtectedRoute role="user"/>}>
          <Route path="/home" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

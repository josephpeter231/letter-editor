import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/editor" 
              element={
                <ProtectedRoute>
                  <Editor />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </>
      </AuthProvider>
    </Router>
  );
}

export default App;
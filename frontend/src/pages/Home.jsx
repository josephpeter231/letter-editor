import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/editor");
    } else {
      login();
    }
  };
  
  return (
    <div className="home-container">
      <h1>Welcome to Letter Editor</h1>
      <p>A simple editor that lets you save your letters to Google Drive</p>
      
      <button onClick={handleGetStarted} className="cta-button">
        {isAuthenticated ? "Go to Editor" : "Get Started with Google"}
      </button>
    </div>
  );
}

export default Home;
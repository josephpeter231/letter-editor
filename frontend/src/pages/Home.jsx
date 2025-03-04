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
    <div className="container-fluid d-flex flex-column justify-content-center align-items-center vh-100 text-center" style={{
      background: "linear-gradient(135deg, #f8f9fa, #e3f2fd)",
      animation: "fadeIn 1.5s ease-in-out"
    }}>
      <h1 className="display-4 fw-bold animate__animated animate__fadeInDown">Welcome to Letter Editor</h1>
      <p className="lead text-muted animate__animated animate__fadeIn">A simple and efficient editor to save your letters to Google Drive.</p>
      
      <button onClick={handleGetStarted} className="btn btn-primary btn-lg mt-3 px-4 shadow animate__animated animate__zoomIn">
        {isAuthenticated ? "Go to Editor" : "Get Started with Google"}
      </button>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}

export default Home;
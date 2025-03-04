import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Letter Editor</Link>
      </div>
      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            <Link to="/editor" className="navbar-item">Editor</Link>
            <button onClick={logout} className="button">Logout</button>
          </>
        ) : (
          <button onClick={login} className="button">Login with Google</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;  
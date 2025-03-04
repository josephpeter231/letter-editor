import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm py-3 px-4">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand fw-bold text-primary fs-4">
          <i className="bi bi-envelope-paper-fill me-2"></i>Letter Editor
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link to="/editor" className="nav-link text-primary fw-semibold">
                    <i className="bi bi-pencil-square me-1"></i>Editor
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/files" className="nav-link text-dark fw-semibold">
                    <i className="bi bi-folder-fill me-1"></i>My Letters
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    onClick={logout}
                    className="btn btn-outline-danger ms-3 fw-semibold"
                  >
                    <i className="bi bi-box-arrow-right me-1"></i>Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <button
                  onClick={login}
                  className="btn btn-primary fw-semibold"
                >
                  <i className="bi bi-google me-1"></i>Login with Google
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

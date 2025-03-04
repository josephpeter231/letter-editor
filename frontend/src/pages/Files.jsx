import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Files() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthAxios } = useAuth();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const authAxios = getAuthAxios();
        const response = await authAxios.get("/drive/files");
        setFiles(response.data);
      } catch (error) {
        console.error("Error fetching files:", error);
        setError("Failed to load your files. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [getAuthAxios]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="text-primary">Your Documents</h1>
        <Link to="/editor" className="btn btn-success">Create New Document</Link>
      </div>

      {loading ? (
        <div className="text-center text-secondary">Loading your files...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : files.length === 0 ? (
        <div className="alert alert-warning text-center">
          <p>You don't have any documents yet.</p>
          <p>
            <Link to="/editor" className="alert-link">Create your first document</Link> to get started!
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-primary">
              <tr>
                <th>Document Name</th>
                <th>Last Modified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td>{file.name}</td>
                  <td>{formatDate(file.modifiedTime)}</td>
                  <td>
                    <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="btn btn-info btn-sm me-2">View</a>
                    <Link to={`/editor/${file.id}`} className="btn btn-primary btn-sm">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Files;
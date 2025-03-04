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

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="files-container">
      <h1>Your Documents</h1>
      <div className="files-actions">
        <Link to="/editor" className="new-file-btn">
          Create New Document
        </Link>
      </div>

      {loading ? (
        <div className="loading">Loading your files...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : files.length === 0 ? (
        <div className="no-files">
          <p>You don't have any documents yet.</p>
          <p>
            <Link to="/editor">Create your first document</Link> to get started!
          </p>
        </div>
      ) : (
        <div className="files-list">
          <table>
            <thead>
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
                  <td className="file-actions">
                    <a 
                      href={file.webViewLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="view-btn"
                    >
                      View in Drive
                    </a>
                    <Link 
                      to={`/editor/${file.id}`} 
                      className="edit-btn"
                    >
                      Edit
                    </Link>
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
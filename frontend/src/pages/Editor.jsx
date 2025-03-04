import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Editor.css";

function Editor() {
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("Untitled Document");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const { getAuthAxios } = useAuth();
  const { fileId } = useParams();  // Gets the fileId from URL
  const navigate = useNavigate();
  
  // Load existing file if fileId is provided
  useEffect(() => {
    if (fileId) {
      const loadFile = async () => {
        setLoading(true);
        try {
          const authAxios = getAuthAxios();
          const response = await authAxios.get(`/drive/files/${fileId}/content`);
          setContent(response.data.content);
          setFileName(response.data.name);
        } catch (error) {
          console.error("Error loading file:", error);
          alert("Failed to load the document. Please try again.");
          navigate("/files");
        } finally {
          setLoading(false);
        }
      };
      
      loadFile();
    }
  }, [fileId, getAuthAxios, navigate]);
  
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };
  
  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
  };
  
  const saveDocument = async () => {
    if (!content.trim()) {
      alert("Please add some content before saving");
      return;
    }
    
    setSaving(true);
    setSaveResult(null);
    
    try {
      const authAxios = getAuthAxios();
      
      let response;
      if (fileId) {
        // Update existing file
        response = await authAxios.put(`/drive/files/${fileId}`, { 
          content,
          name: fileName
        });
      } else {
        // Create new file
        response = await authAxios.post("/drive/save", { 
          content,
          name: fileName || "Untitled Document"
        });
      }
      
      setSaveResult({
        success: true,
        fileId: response.data.fileId,
        fileName: response.data.fileName,
        webViewLink: response.data.webViewLink
      });
      
      // If this was a new file, redirect to the edit URL
      if (!fileId && response.data.fileId) {
        navigate(`/editor/${response.data.fileId}`, { replace: true });
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveResult({
        success: false,
        error: error.response?.data?.message || error.message
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="loading-container">Loading document...</div>;
  }
  
  return (
    <div className="editor-container">
      <div className="editor-header">
        <input
          type="text"
          value={fileName}
          onChange={handleFileNameChange}
          className="file-name-input"
          placeholder="Document Title"
        />
        <div className="editor-actions">
          <button onClick={() => navigate("/files")} className="cancel-button">
            Back to Files
          </button>
          <button 
            onClick={saveDocument}
            disabled={saving}
            className="save-button"
          >
            {saving ? "Saving..." : fileId ? "Update" : "Save to Drive"}
          </button>
        </div>
      </div>
      
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Start typing your letter here..."
        className="editor-textarea"
        rows={20}
      />
      
      {saveResult && (
        <div className={`save-result ${saveResult.success ? "success" : "error"}`}>
          {saveResult.success ? (
            <>
              <p>Document {fileId ? "updated" : "saved"} successfully!</p>
              {saveResult.webViewLink && (
                <a href={saveResult.webViewLink} target="_blank" rel="noopener noreferrer">
                  View in Google Drive
                </a>
              )}
            </>
          ) : (
            <p>Error saving document: {saveResult.error}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Editor;
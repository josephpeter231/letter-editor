import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Editor.css";

function Editor() {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const { getAuthAxios } = useAuth();
  
  const handleContentChange = (e) => {
    setContent(e.target.value);
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
      const response = await authAxios.post("/drive/save", { content });
      
      setSaveResult({
        success: true,
        fileId: response.data.fileId,
        fileName: response.data.fileName,
        webViewLink: response.data.webViewLink
      });
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
  
  return (
    <div className="editor-container">
      <h1>Letter Editor</h1>
      
      <div className="editor-controls">
        <button 
          onClick={saveDocument}
          disabled={saving}
          className="save-button"
        >
          {saving ? "Saving..." : "Save to Google Drive"}
        </button>
      </div>
      
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Start typing your letter here..."
        className="editor-textarea"
        rows={15}
      />
      
      {saveResult && (
        <div className={`save-result ${saveResult.success ? "success" : "error"}`}>
          {saveResult.success ? (
            <>
              <p>Document saved successfully!</p>
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
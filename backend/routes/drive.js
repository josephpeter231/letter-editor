const express = require("express");
const { google } = require("googleapis");
const router = express.Router();

// Create OAuth client factory function
const createOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:5000/api/auth/google/callback"
  );
};

// Authentication middleware with token handling
const isAuthenticated = async (req, res, next) => {
  console.log("Authentication check:");
  console.log("- isAuthenticated:", req.isAuthenticated());
  console.log("- Headers:", Object.keys(req.headers));
  console.log("- Has auth header:", !!req.headers.authorization);
  
  // Create a fresh OAuth client for each request
  const oauth2Client = createOAuthClient();
  
  try {
    // 1. Check session authentication first
    if (req.isAuthenticated() && req.user && req.user.accessToken) {
      console.log("- Using session token");
      oauth2Client.setCredentials({
        access_token: req.user.accessToken,
        refresh_token: req.user.refreshToken
      });
      req.oauth2Client = oauth2Client;
      return next();
    }
    
    // 2. Then check for Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: "Invalid token format" });
      }
      
      console.log("- Token from header:", token.substring(0, 10) + "...");
      
      // Set token on OAuth client
      oauth2Client.setCredentials({ access_token: token });
      
      // Verify token is valid
      try {
        const tokenInfo = await oauth2Client.getTokenInfo(token);
        console.log("- Token verified successfully");
        console.log("- Token expires in:", tokenInfo.expires_in, "seconds");
        
        // Verify correct scopes
        const hasFileScope = tokenInfo.scopes.includes('https://www.googleapis.com/auth/drive.file');
        if (!hasFileScope) {
          return res.status(403).json({ 
            error: "Insufficient permissions",
            message: "This token doesn't have Google Drive access permissions" 
          });
        }
        
        req.oauth2Client = oauth2Client;
        return next();
      } catch (error) {
        console.error("- Token verification failed:", error.message);
        return res.status(401).json({ 
          error: "Invalid token", 
          message: "Authentication token is invalid or expired" 
        });
      }
    }
    
    return res.status(401).json({ error: "Authentication required" });
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
};

// Route to save content to Google Drive
router.post("/save", isAuthenticated, async (req, res) => {
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }
  
  try {
    console.log("Save request received");
    
    // Use the oauth2Client that was set in the middleware
    const drive = google.drive({ 
      version: "v3", 
      auth: req.oauth2Client 
    });

    const fileMetadata = {
      name: "Letter.txt",
      mimeType: "application/vnd.google-apps.document",
    };

    const media = {
      mimeType: "text/plain",
      body: content,
    };

    console.log("Attempting to save file to Drive...");
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id,name,webViewLink",
    });

    console.log("File saved successfully:", file.data.id);
    res.status(200).json({ 
      fileId: file.data.id,
      fileName: file.data.name,
      webViewLink: file.data.webViewLink
    });
  } catch (error) {
    console.error("Drive error details:", error);
    
    if (error.response && error.response.status === 401) {
      return res.status(401).json({ 
        error: "Authentication failed", 
        message: "Your Google Drive access has expired. Please log in again." 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to save file", 
      message: error.message || "An unknown error occurred" 
    });
  }
});

// Test endpoint for checking Drive API access
router.get("/test", isAuthenticated, async (req, res) => {
  try {
    const drive = google.drive({ version: "v3", auth: req.oauth2Client });
    
    // Just retrieve file metadata as a simple test
    const response = await drive.files.list({
      pageSize: 1,
      fields: "files(id, name)"
    });
    
    res.json({ 
      success: true, 
      message: "Drive API connection successful",
      fileCount: response.data.files.length
    });
  } catch (error) {
    console.error("Drive test error:", error);
    res.status(500).json({ 
      error: "Drive API test failed", 
      message: error.message 
    });
  }
});

module.exports = router;
const express = require("express");
const passport = require("passport");
const { google } = require("googleapis");
const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile", 
      "email",
      "https://www.googleapis.com/auth/drive.file"
    ],
    accessType: "offline", 
    prompt: "consent"      
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "https://letter-editor.vercel.app/login" }),
  (req, res) => {
    console.log("OAuth Success - User:", {
      id: req.user.id,
      hasAccessToken: !!req.user.accessToken,
      hasRefreshToken: !!req.user.refreshToken
    });
    
    res.redirect(`https://letter-editor.vercel.app/editor?accessToken=${req.user.accessToken}&refreshToken=${req.user.refreshToken || ''}`);
  }
);

// Check if user is logged in
router.get("/status", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ 
      authenticated: true, 
      user: {
        id: req.user.id,
        displayName: req.user.displayName,
        email: req.user.email
      }
    });
  }
  res.json({ authenticated: false });
});

// Add a token verification endpoint
router.get("/verify-token", (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "No token provided" });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Create a fresh OAuth client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://letter-editor-backend.onrender.com/api/auth/google/callback"
  );
  
  oauth2Client.getTokenInfo(token)
    .then((tokenInfo) => {
      console.log("Token info:", {
        expires_in: tokenInfo.expires_in,
        scopes: tokenInfo.scopes
      });
      
      const hasFileScope = tokenInfo.scopes.includes('https://www.googleapis.com/auth/drive.file');
      
      if (!hasFileScope) {
        return res.status(403).json({ 
          error: "Token missing required scopes",
          required: "https://www.googleapis.com/auth/drive.file" 
        });
      }
      
      res.json({ valid: true, expiresIn: tokenInfo.expires_in });
    })
    .catch(error => {
      console.error("Token verification error:", error.message);
      res.status(401).json({ error: "Invalid token", message: error.message });
    });
});

// Token refresh endpoint
router.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token required" });
  }
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://letter-editor-backend.onrender.com/api/auth/google/callback"
  );
  
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  
  oauth2Client.refreshAccessToken()
    .then((response) => {
      const tokens = response.credentials;
      res.json({ 
        accessToken: tokens.access_token,
        expiresIn: tokens.expiry_date 
      });
    })
    .catch((error) => {
      console.error("Token refresh error:", error);
      res.status(401).json({ error: "Failed to refresh token" });
    });
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout(function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;
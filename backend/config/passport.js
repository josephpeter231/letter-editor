const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { google } = require("googleapis");

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/api/auth/google/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        // Log token receipt for debugging
        console.log("OAuth tokens received:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          userId: profile.id
        });
        
        // Store tokens with the user profile
        const user = {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value,
          accessToken,
          refreshToken
        };
        
        return done(null, user);
      }
    )
  );

  // Serialize and deserialize user functions
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};
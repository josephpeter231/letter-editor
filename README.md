# Letter Editor

A cloud-based document editor that lets you create, edit, and save letters directly to your Google Drive.

![Letter Editor](https://drive.google.com/file/d/1rgPjlSN9ZjHbrc_dwC6prhlTuMS0LH9T/view?usp=drive_link)

## 🚀 Features

- **Google Authentication**: Securely login with your Google account
- **Create Documents**: Write and format letters in a clean, distraction-free editor
- **Save to Google Drive**: Automatically save documents to your Google Drive
- **Document Management**: Browse, edit, and manage all your saved letters
- **Responsive Design**: Works on desktop and mobile devices

## 📋 Tech Stack

### Frontend

- React.js with Vite
- React Router for navigation
- Bootstrap for UI components
- Axios for API requests

### Backend

- Node.js with Express
- Google OAuth2 for authentication
- Google Drive API for document storage
- JWT for secure token management

## 🔧 Installation

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- A Google Cloud Platform account with OAuth credentials

### Setup Instructions

#### 1. Clone the repository

```bash
git clone https://github.com/josephpeter231/letter-editor.git
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with the following variables
touch .env
```

Add the following to your `.env` file:

```
PORT=5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file for frontend
touch .env.local
```

```
VITE_API_URL=http://localhost:5173/api
```

#### 4. Google API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Drive API
4. Configure OAuth consent screen
5. Create OAuth 2.0 Client IDs
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for development)
   - `https://letter-editor-backend.onrender.com/api/auth/google/callback` (for production)

#### 5. Run the application

In development mode:

```bash
# Start the backend server (from backend directory)
npm run dev

# In a separate terminal, start the frontend (from frontend directory)
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 🌐 Deployment

The application is deployed and accessible at:
(backend is hosted in free tier in render.com so there will be some delay)
- **Frontend**: [https://letter-editor.vercel.app](https://letter-editor.vercel.app)
- **Backend**: [https://letter-editor-backend.onrender.com](https://letter-editor-backend.onrender.com)

## 📝 Usage

1. **Login**: Click the "Login with Google" button to authenticate
2. **Create**: Click "Editor" in the navigation bar to create a new document
3. **Save**: Enter your content and click "Save to Drive" to store in Google Drive
4. **Manage**: Access all your documents from the "My Letters" section
5. **Edit**: Click on any document to view or edit its contents

## 🔒 Authentication Flow

1. User clicks "Login with Google"
2. User is redirected to Google's OAuth consent screen
3. After granting permissions, user is redirected back to the application
4. The backend exchanges the authorization code for access and refresh tokens
5. User is authenticated and can now access the application features

## 📚 API Endpoints

- `GET /api/auth/google`: Initiates Google OAuth flow
- `GET /api/auth/google/callback`: OAuth callback endpoint
- `GET /api/drive/files`: Retrieves user's saved documents
- `GET /api/drive/files/:fileId/content`: Gets content of a specific document
- `POST /api/drive/save`: Creates a new document
- `PUT /api/drive/files/:fileId`: Updates an existing document

## 🛠️ Future Improvements

- Rich text editing with formatting options
- Document templates for common letter types
- Collaboration features for shared editing
- Export options (PDF, Word, etc.)
- Folder organization for better document management

Made with ❤️ by [Joseph peter J](https://www.linkedin.com/in/josephpeter-j/)

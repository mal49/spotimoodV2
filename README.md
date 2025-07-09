# 🎵 Spotimood

**A mood-based music playlist generator that creates personalized playlists using AI-powered mood analysis.**

Spotimood combines your current emotional state with intelligent music curation to deliver the perfect soundtrack for any moment. Whether you're feeling energetic, relaxed, melancholic, or euphoric, Spotimood understands your vibe and curates YouTube music playlists that match your mood perfectly.

![Spotimood Banner](public/spotimood-logo.jpeg)

## ✨ Features

### 🎭 **Intelligent Mood Analysis**
- Interactive mood questionnaire powered by Google Gemini AI
- Contextual questions that understand nuanced emotional states
- Smart mood scoring and categorization
- Mood history tracking and trends analysis

### 🎵 **AI-Powered Playlist Generation**
- Personalized playlist creation based on mood analysis
- Integration with YouTube's vast music library
- Genre-aware music curation
- Seamless music discovery and playback

### 👤 **User Management & Authentication**
- Secure user authentication with Supabase Auth
- Email/password and social login (Google, GitHub)
- User profiles with mood history
- Row Level Security for data privacy

### 📱 **Playlist Management**
- Create, edit, and organize custom playlists
- Add/remove songs from playlists
- Drag-and-drop playlist reordering
- Public/private playlist settings

### 🔍 **Music Search & Discovery**
- Real-time YouTube music search
- Advanced filtering and sorting
- Song previews and metadata
- Artist and album information

### 💬 **Community & Feedback**
- User feedback system with ratings
- Bug reports and feature requests
- Community-driven improvements

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### **Backend & Database**
- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL database with real-time subscriptions
  - Authentication & user management
  - Row Level Security (RLS)
  - Auto-generated REST APIs

### **APIs & Services**
- **YouTube Data API v3** - Primary music source with video playback
- **Spotify Web API** - High-quality music metadata and previews
- **Last.fm API** - Music discovery and recommendations
- **Google Gemini AI** - Mood analysis and playlist generation
- **Supabase Auth** - Authentication flows

### **Rate Limit Solutions**
- **API Key Rotation** - Multiple YouTube API keys with automatic switching
- **Fallback System** - Seamless fallback to alternative APIs
- **Intelligent Caching** - 5-minute cache to reduce API calls
- **Quota Management** - Real-time tracking and optimization

### **State Management**
- **React Context API** - Global state management
- **Custom hooks** - Reusable stateful logic
- **Local Storage** - Client-side data persistence

## 🚀 Getting Started

### Prerequisites

Before running Spotimood, ensure you have the following installed and configured:

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download from git-scm.com](https://git-scm.com/)
- **Supabase account** - [Sign up at supabase.com](https://supabase.com/)
- **Google Cloud Console account** - For YouTube Data API and Gemini AI API keys

### 📋 Step-by-Step Installation Guide

#### 1. **Clone and Setup Repository**

```bash
# Clone the repository
git clone https://github.com/yourusername/spotimood.git
cd spotimood

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

#### 2. **Create API Keys and Accounts**

##### 2.1 **Supabase Setup**
1. Go to [supabase.com](https://supabase.com/) and create a new project
2. Wait for the project to be fully initialized (usually 2-3 minutes)
3. Go to **Settings** → **API** in your Supabase dashboard
4. Copy your **Project URL** and **anon public** key

##### 2.2 **YouTube Data API Setup (Multiple Keys Recommended)**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create multiple projects (recommended: 3-5 projects for rotation)
3. For each project, enable the **YouTube Data API v3**:
   - Go to **APIs & Services** → **Library**
   - Search for "YouTube Data API v3" and enable it
4. Create credentials for each project:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **API Key**
   - Copy the generated API key
5. **Set quota limits** (optional but recommended):
   - Go to **APIs & Services** → **Quotas**
   - Set daily quota to 10,000 units per project

##### 2.3 **Spotify Web API Setup (Alternative Source)**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Get your **Client ID** and **Client Secret**
4. Add redirect URIs if needed for OAuth

##### 2.4 **Last.fm API Setup (Alternative Source)**
1. Go to [Last.fm API](https://www.last.fm/api)
2. Create an account
3. Create an API application
4. Get your **API Key**

##### 2.5 **Google Gemini AI Setup**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the generated API key

#### 3. **Environment Configuration**

##### 3.1 **Frontend Environment (.env)**
Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Development Settings (optional)
VITE_DEV_MODE=true
```

##### 3.2 **Backend Environment (server/.env)**
Create a `.env` file in the `server` directory:

```env
# YouTube Data API Keys (Multiple for rotation)
YOUTUBE_API_KEY=your-youtube-api-key-1
YOUTUBE_API_KEY_2=your-youtube-api-key-2
YOUTUBE_API_KEY_3=your-youtube-api-key-3
YOUTUBE_API_KEY_4=your-youtube-api-key-4
YOUTUBE_API_KEY_5=your-youtube-api-key-5

# Alternative Music APIs
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
LASTFM_API_KEY=your-lastfm-api-key

# AI Services
GEMINI_API_KEY=your-gemini-api-key

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Settings (for development)
FRONTEND_URL=http://localhost:5173
```

#### 4. **Database Setup**

##### 4.1 **Import Database Schema**
1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy the contents of `database-schema.sql` and paste it
5. Click **Run** to execute the schema

##### 4.2 **Verify Database Tables**
Check that these tables were created:
- `users`
- `moods`
- `playlists`
- `songs`
- `playlist_songs`
- `feedback`

#### 5. **Authentication Configuration**

##### 5.1 **Configure Auth Providers in Supabase**
1. Go to **Authentication** → **Providers** in Supabase dashboard
2. **Enable Email Provider**:
   - Toggle **Enable email provider** to ON
   - Configure email templates if needed

3. **Enable Google OAuth** (optional):
   - Toggle **Enable Google provider** to ON
   - Add your Google OAuth client ID and secret
   - Set redirect URL: `http://localhost:5173/auth/callback`

4. **Enable GitHub OAuth** (optional):
   - Toggle **Enable GitHub provider** to ON
   - Add your GitHub OAuth app credentials
   - Set redirect URL: `http://localhost:5173/auth/callback`

##### 5.2 **Configure Site URL**
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:5173`
3. Add **Redirect URLs**: `http://localhost:5173/auth/callback`

#### 6. **Running the Application**

##### 6.1 **Start Backend Server**
```bash
# Navigate to server directory
cd server

# Start the backend server
npm start

# You should see: "Server running on port 3001"
```

##### 6.2 **Start Frontend Development Server**
Open a new terminal window/tab:

```bash
# Make sure you're in the root directory
cd spotimood

# Start the frontend development server
npm run dev

# You should see: "Local: http://localhost:5173"
```

##### 6.3 **Verify Setup**
1. Open your browser and navigate to `http://localhost:5173`
2. You should see the Spotimood landing page
3. Try creating an account or logging in
4. Test the mood questionnaire functionality

### 🔧 Development Workflow

#### **Running Both Servers Simultaneously**
For convenience, you can run both servers in separate terminal windows:

**Terminal 1 (Backend):**
```bash
cd server
npm start
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

#### **Development Scripts**
```bash
# Frontend development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Backend development
cd server
npm start            # Start server with nodemon
npm run dev          # Alternative development command
```

### 🐛 Troubleshooting

#### **Common Issues and Solutions**

##### **1. "Module not found" errors**
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# For server
cd server
rm -rf node_modules package-lock.json
npm install
```

##### **2. Database connection issues**
- Verify your Supabase URL and anon key in `.env`
- Check that your Supabase project is fully initialized
- Ensure database schema was imported correctly

##### **3. API key errors**
- Verify all API keys are correctly copied (no extra spaces)
- Check API quotas in Google Cloud Console
- Ensure YouTube Data API v3 is enabled

##### **4. Authentication not working**
- Check Supabase Auth configuration
- Verify redirect URLs are set correctly
- Ensure Site URL matches your development URL

##### **5. CORS errors**
- Verify `FRONTEND_URL` in server `.env` matches your frontend URL
- Check that both servers are running on correct ports

##### **6. Port conflicts**
```bash
# If port 3001 or 5173 are in use, kill processes:
# On Windows:
netstat -ano | findstr :3001
taskkill /PID <process_id> /F

# On Mac/Linux:
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### 🧪 Testing the Application

#### **Frontend Testing**
1. **Landing Page**: Should load without errors
2. **Authentication**: Try signup/login with email
3. **Mood Questionnaire**: Complete a mood assessment
4. **Music Search**: Search for songs
5. **Playlist Creation**: Create and manage playlists

#### **Backend Testing**
Test API endpoints using curl or Postman:

```bash
# Test server health
curl http://localhost:3001/health

# Test YouTube search (replace YOUR_API_KEY)
curl "http://localhost:3001/api/search?q=test&key=YOUR_YOUTUBE_API_KEY"
```

### 🚀 Production Deployment

#### **Frontend (Vercel/Netlify)**
```bash
npm run build
# Deploy the 'dist' folder
```

#### **Backend (Railway/Heroku)**
```bash
# Set environment variables in your hosting platform
# Deploy the server folder
```

#### **Environment Variables for Production**
Update your production environment variables:
- Use production Supabase URLs
- Set `NODE_ENV=production`
- Update CORS settings for production domains

## 📁 Project Structure

```
spotimood/
├── src/
│   ├── components/
│   │   ├── Layout/          # Header, Sidebar, Navigation
│   │   ├── pages/           # Main page components
│   │   ├── mood/            # Mood questionnaire components
│   │   ├── MusicPlayer/     # Audio playback controls
│   │   ├── cards/           # Playlist and album cards
│   │   ├── forms/           # Form components
│   │   └── UI/              # Reusable UI components
│   ├── context/             # React Context providers
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries (Supabase client)
│   └── api/                 # API service functions
├── server/                  # Express.js backend
├── public/                  # Static assets
└── database-schema.sql      # Supabase database schema
```

## 🎯 Key Features in Detail

### Mood Analysis Workflow
1. User completes interactive mood questionnaire
2. Responses are analyzed using Google Gemini AI
3. Mood score and description are generated
4. Personalized playlist is created based on analysis
5. User can save, modify, or regenerate playlists

### Authentication Flow
1. Users can sign up/sign in with email or social providers
2. Supabase handles secure authentication and session management
3. Row Level Security ensures users only access their own data
4. Authentication state is managed globally via React Context

### Music Integration
1. YouTube Data API provides music search and metadata
2. Custom YouTube player component handles playback
3. Playlists are stored in Supabase with song references
4. Real-time updates across all user sessions

## 🔒 Security & Privacy

- **Row Level Security (RLS)** - Database-level access control
- **JWT Authentication** - Secure token-based authentication
- **Environment Variables** - Sensitive data protection
- **Input Validation** - Client and server-side validation
- **CORS Configuration** - Controlled cross-origin requests

## 🌟 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** - Amazing backend-as-a-service platform
- **YouTube** - Extensive music library and API
- **Google Gemini** - Powerful AI for mood analysis
- **Tailwind CSS** - Beautiful and responsive design system
- **React Team** - Incredible frontend framework

## 📞 Support

If you have any questions or need help:

- 📧 Email: support@spotimood.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/spotimood/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/spotimood/discussions)

---

**Built with ❤️ by the Spotimood Team**

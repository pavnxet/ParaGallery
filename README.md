# Photo Gallery App

A secure, modern photo gallery application built with React, Vite, Tailwind CSS, and Supabase. Upload, organize, and manage your photos with album support and a beautiful masonry layout.

![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.3.1-646cff?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-2.97.0-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2.0-38B2AC?logo=tailwind-css)

## ✨ Features

- **📸 Photo Upload & Management** - Upload photos with drag-and-drop support, view in masonry grid layout
- **📁 Album Organization** - Create albums and organize photos into collections
- **🔐 Secure Authentication** - User signup/login with password strength validation and brute-force protection
- **🔍 Search Functionality** - Search photos by name with input sanitization
- **🎨 Modern UI** - Responsive design with Tailwind CSS and Lucide icons
- **⚡ Fast Performance** - Built with Vite for instant hot module replacement and optimized builds
- **🛡️ Security Hardened** - Content Security Policy, file validation, rate limiting, and more

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project ([supabase.com](https://supabase.com))
- An ImgBB API key (free at [api.imgbb.com](https://api.imgbb.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_IMGBB_API_KEY=your_imgbb_api_key
   ```

4. **Configure Supabase**

   Run the migrations in your Supabase project:
   ```bash
   # Copy migration files to your Supabase project or run manually via SQL editor
   ```
   
   Required tables:
   - `users` - User profiles
   - `albums` - Photo albums
   - `photos` - Photo metadata
   
   Enable Row Level Security (RLS) policies to ensure users can only access their own data.

5. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AlbumList.jsx    # Album display and management
│   ├── Navbar.jsx       # Navigation bar
│   ├── PhotoCard.jsx    # Individual photo card
│   ├── PhotoModal.jsx   # Photo detail modal
│   ├── UploadModal.jsx  # File upload interface
│   └── ProtectedRoute.jsx # Auth route protection
├── contexts/            # React contexts
│   └── AuthContext.jsx  # Authentication state management
├── lib/                 # Utility libraries
│   ├── db.js            # Database operations
│   ├── imgbb.js         # ImgBB API integration
│   ├── supabaseClient.js # Supabase client setup
│   └── dateUtils.js     # Date formatting utilities
├── pages/               # Page components
│   ├── Dashboard.jsx    # Main dashboard
│   ├── Gallery.jsx      # Photo gallery view
│   ├── Login.jsx        # Login page
│   └── SignUp.jsx       # Registration page
├── App.jsx              # Main app component
└── main.jsx             # Entry point
```

## 🔒 Security Features

This application includes multiple security enhancements:

| Feature | Description |
|---------|-------------|
| **Password Validation** | Minimum 8 characters with uppercase, lowercase, number, and special character |
| **Rate Limiting** | Brute-force protection (5 attempts per 15 minutes) |
| **File Upload Validation** | 10MB limit, magic byte verification, MIME type checking |
| **Input Sanitization** | SQL injection prevention for search queries |
| **Content Security Policy** | XSS protection via CSP meta tags |
| **Error Handling** | Generic error messages to prevent information disclosure |

See [SECURITY_IMPROVEMENTS.md](./SECURITY_IMPROVEMENTS.md) for detailed information.

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code quality checks |

## 🏗️ Building for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory ready for deployment.

### Deployment Options

- **Vercel** - Configuration included (`vercel.json`)
- **Netlify** - Drop the `dist` folder
- **GitHub Pages** - Use GitHub Actions workflow
- **Any static host** - Upload contents of `dist/`

## ⚙️ Configuration

### Supabase Setup

Ensure your Supabase project has the following tables:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Albums table
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Enable RLS policies:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Example policy for photos
CREATE POLICY "Users can view own photos"
  ON photos FOR SELECT
  USING (auth.uid() = user_id);
```

### ImgBB Integration

The app uses ImgBB for image hosting. For production:

- **Development**: Direct API calls from client (API key exposed)
- **Production**: Recommended to create a backend proxy to keep API key secret

## 🧪 Testing Security Features

After setup, verify security measures:

1. Try creating an account with password `weak` → Should be rejected
2. Attempt 6 failed logins → Should lock out for 15 minutes
3. Upload a `.exe` file → Should be rejected
4. Upload a 15MB image → Should be rejected
5. Search with `' OR 1=1 --` → Should be sanitized

## 📦 Dependencies

### Core
- **react** (19.2.0) - UI library
- **react-dom** (19.2.0) - DOM rendering
- **react-router-dom** (7.13.0) - Routing
- **@supabase/supabase-js** (2.97.0) - Backend client
- **axios** (1.13.5) - HTTP client
- **lucide-react** (0.574.0) - Icon library
- **react-masonry-css** (1.0.16) - Masonry layout

### Development
- **vite** (7.3.1) - Build tool
- **tailwindcss** (4.2.0) - CSS framework
- **eslint** (9.39.1) - Code linting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Important Notes

- Never commit `.env` files to version control
- Always use HTTPS in production
- Keep dependencies updated for security patches
- Review and customize RLS policies for your use case
- Consider implementing server-side rate limiting for production

## 🆘 Support

For issues or questions:
1. Check existing issues in the repository
2. Review Supabase documentation: https://supabase.com/docs
3. Review Vite documentation: https://vitejs.dev/guide/

---

Built with ❤️ using React, Vite, and Supabase

# Frontend Setup Guide

The frontend is built with React + Vite + Tailwind CSS. Follow these steps to get it running:

## ✅ Complete Frontend Setup

All frontend files have been created! Here's what's ready:

### 📁 Files Created:

- ✅ `package.json` - Dependencies configured
- ✅ `vite.config.js` - Vite configuration with proxy
- ✅ `tailwind.config.js` - Tailwind styling configuration
- ✅ `postcss.config.js` - PostCSS configuration
- ✅ `index.html` - HTML entry point
- ✅ `src/index.jsx` - React entry point
- ✅ `src/index.css` - Global styles with Tailwind
- ✅ `src/App.jsx` - Main app component
- ✅ `src/App.css` - App-specific styles
- ✅ `src/components/UploadForm.jsx` - Enhanced upload form with theme selector
- ✅ `src/components/ProgressBar.jsx` - Animated progress bar
- ✅ `.gitignore` - Git ignore rules

## 🚀 To Run the Frontend:

### Step 1: Install Node.js (if not installed)

Download and install Node.js from: https://nodejs.org/

Choose the LTS version (recommended).

### Step 2: Verify Installation

Open PowerShell and run:

```powershell
node --version
npm --version
```

Both should show version numbers.

### Step 3: Install Dependencies

Navigate to the project root and run:

```powershell
npm install
```

This will install all required packages:

- React 18
- Vite
- Tailwind CSS
- And other dependencies

### Step 4: Start Development Server

```powershell
npm run dev
```

You should see:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 5: Open Browser

Visit `http://localhost:3000` to see your Aiditor app!

## 🎨 Features Implemented

### Upload Form Component

- ✅ Drag & drop ZIP file upload
- ✅ File browser fallback
- ✅ Theme selector (Cinematic, Esports, Chill)
- ✅ Duration slider (30-120 seconds)
- ✅ File preview with size
- ✅ Beautiful gradient UI
- ✅ Error handling and display

### Progress Bar Component

- ✅ Animated progress indicator
- ✅ Spinner for processing state
- ✅ Smooth progress transitions
- ✅ Completion checkmark
- ✅ Status messages

### App Component

- ✅ Modern gradient background
- ✅ Feature cards section
- ✅ Responsive design
- ✅ Beautiful glassmorphism effects

## 🔧 Development Commands

```powershell
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## 📝 Configuration

### Vite Proxy

The Vite server is configured to proxy `/api/*` requests to `http://localhost:8000` (the backend).

This means you can use:

```javascript
fetch('/api/upload', { ... })
```

Instead of:

```javascript
fetch('http://localhost:8000/upload', { ... })
```

### Tailwind Theme

Custom colors defined:

- Primary color palette (blue)
- Full customization available in `tailwind.config.js`

## 🎯 What Happens When You Upload

1. User selects ZIP file and settings
2. Click "Generate Highlight Reel"
3. File is uploaded to backend at `http://localhost:8000/upload`
4. Progress bar shows simulated progress (actual progress coming soon)
5. Backend processes and returns MP4
6. Video player shows with download button

## 🔗 Integration Points

The frontend communicates with the backend via:

```javascript
POST http://localhost:8000/upload
Content-Type: multipart/form-data

Parameters:
- file: ZIP file containing video clips
- target_duration: Integer (seconds)
```

Returns: MP4 video file

## 📦 Production Build

To create an optimized production build:

```powershell
npm run build
```

Output goes to `dist/` directory. You can serve this with any static file server:

- Apache
- Nginx
- Netlify
- Vercel
- etc.

## 🐛 Troubleshooting

### "npm is not recognized"

- Install Node.js from https://nodejs.org/
- Restart your terminal/PowerShell

### Port 3000 already in use

Edit `vite.config.js`:

```javascript
server: {
  port: 3001, // Change to any available port
}
```

### Can't connect to backend

1. Make sure backend is running: `docker-compose -f backend/docker-compose.yml ps`
2. Check backend logs: `docker-compose -f backend/docker-compose.yml logs`

### Styling not working

Make sure Tailwind is imported in `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## ✨ Next Steps

Once the frontend is running, you can:

1. Upload test ZIP files
2. Customize theme colors
3. Add more UI components
4. Implement real-time progress updates
5. Add user authentication

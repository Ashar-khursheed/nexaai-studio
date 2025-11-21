# NexaAI Studio - Complete AI-Powered Web Platform

A modern, responsive web application featuring AI-powered tools, interactive 3D mascot, virtual try-on with face tracking, and hand gesture gaming.

## 🚀 Recent Updates & Fixes

### ✅ Fixed Issues
- **HandShoot Game**: Fixed camera initialization for production/live deployment
  - Proper async/await camera stream handling
  - MediaPipe Hands initialization after video ready
  - Cleanup on component unmount
  
### 🎨 New Features

#### 1. **Interactive 3D NexaAI Mascot**
- Animated 3D robot built with Three.js
- Mouse-responsive head movement
- Eye blinking animation
- Floating and wobbling effects
- Interactive chat bubbles with quick navigation
- **4 Position Modes**: Left/Right Top/Bottom - user can move it anywhere!
- Fully responsive (auto-positions on mobile)
- Particle effects around the mascot

#### 2. **Advanced Virtual Try-On**
- **Real Face Detection** using MediaPipe Face Mesh (468 facial landmarks)
- Accurate positioning of glasses, hats, and masks
- Face rotation and angle tracking
- **3 Categories**: Glasses, Caps/Hats, Face Masks
- Mirror mode for natural selfie experience
- Photo capture with overlays
- Responsive design for all devices

#### 3. **Enhanced HandShoot Shooter**
- Production-ready camera initialization
- Proper error handling and cleanup
- Smooth hand gesture recognition
- Better shooting mechanics with cooldown
- Responsive game canvas

## 🛠️ Tech Stack

- **React 18** - Modern UI framework
- **Three.js** - 3D graphics and animations
- **MediaPipe** - AI-powered face & hand tracking
- **Vite** - Fast build tool
- **CSS3** - Responsive styling with animations

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 Features

### AI-Powered Tools
1. **Smart Shopping Assistant** - AI chatbot for product recommendations
2. **Virtual Try-On AR** - Real-time face tracking with accessories
3. **HandShoot Shooter** - Hand gesture-controlled shooting game
4. **AI Image Editor** - Filters and effects for photos
5. **Background Remover** - Remove backgrounds from images

### Utility Tools
1. **Password Generator** - Secure password creation
2. **QR Code Generator** - Create QR codes instantly
3. **Text Case Converter** - Convert text cases
4. **Unit Converter** - Convert various units
5. **Color Palette Generator** - Generate color schemes
6. **Lorem Ipsum Generator** - Placeholder text generator

### Interactive Elements
- **3D Background** - Dynamic Three.js scene
- **NexaAI Mascot** - Interactive 3D robot companion
- **Smooth Animations** - CSS3 and Three.js powered
- **Responsive Design** - Works on all devices

## 🎯 Key Improvements

### Responsive Design
- Mobile-first approach
- Breakpoints: 480px, 768px, 1024px
- Touch-friendly interactions
- Optimized layouts for all screens

### Performance
- Lazy loading components
- Optimized Three.js rendering
- Efficient MediaPipe initialization
- Proper cleanup and memory management

### User Experience
- Smooth transitions and animations
- Interactive mascot with position control
- Clear error messages
- Loading states
- Intuitive navigation

## 🐛 Bug Fixes

### HandShoot Shooter (Production Fix)
**Problem**: Camera not initializing on live/production deployment
**Solution**: 
- Added proper async/await for getUserMedia
- Initialize MediaPipe after video is ready (onloadedmetadata)
- Proper cleanup of camera streams and MediaPipe instances
- Added shooting cooldown with ref to prevent rapid firing

### Virtual Try-On Enhancement
**Before**: Basic canvas overlay without face tracking
**After**: Full MediaPipe Face Mesh integration with 468 landmarks
- Accurate glasses positioning based on eye locations
- Cap/hat positioning based on forehead landmarks
- Mask positioning based on nose, cheeks, and chin
- Rotation and angle compensation

## 📱 Responsive Breakpoints

```css
/* Mobile Small */
@media (max-width: 480px) {
  - Single column layouts
  - Reduced font sizes
  - Optimized touch targets
  - Mascot auto-positions to bottom-right
}

/* Mobile/Tablet */
@media (max-width: 768px) {
  - Stack grid layouts
  - Full-width components
  - Adjusted spacing
  - Simplified navigation
}

/* Desktop */
@media (min-width: 769px) {
  - Multi-column grids
  - Sidebar layouts
  - Larger interactive areas
  - Advanced animations
}
```

## 🎨 NexaAI Mascot Usage

The mascot appears on the home page and can be:
- **Clicked** to expand/collapse chat bubble
- **Positioned** using corner buttons (↙️ ↘️ ↖️ ↗️)
- **Interacted** with mouse hover for head tracking
- **Quick Navigation** via bubble buttons

## 🔧 Development Notes

### Camera Permissions
Both HandShoot and Virtual Try-On require camera access:
- HTTPS required for production
- Handle permission denials gracefully
- Clear error messages for users

### MediaPipe Models
Models are loaded from CDN:
- `@mediapipe/hands` - Hand tracking
- `@mediapipe/face_mesh` - Face tracking
- `@mediapipe/camera_utils` - Camera utilities

### Three.js Performance
- RequestAnimationFrame for smooth animations
- Proper cleanup on unmount
- Optimized particle counts
- Efficient material usage

## 🚀 Deployment

### Build
```bash
npm run build
```

### Environment Requirements
- Node.js 16+
- Modern browser with WebGL support
- HTTPS for camera access (production)
- Sufficient bandwidth for MediaPipe models

### Recommended Hosting
- Vercel (recommended)
- Netlify
- GitHub Pages (with HTTPS)
- Any static hosting with HTTPS

## 📄 License

MIT License

## 🤝 Contributing

Issues and pull requests welcome!

---

Built with ❤️ by NexaAI Studio Team

**Version**: 2.0.0
**Last Updated**: November 2024

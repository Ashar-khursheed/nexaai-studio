# 🚀 NexaAI Studio - Complete Edition

A modern web application with **13 useful tools** including **4 AI-powered products** - all working 100% offline!

## 🚀 Quick Start

```bash
# Extract the zip file
unzip nexaai-studio-complete.zip
cd nexaai-studio-complete

# Install dependencies (IMPORTANT - includes qrcode library)
npm install

# Start development server
npm run dev
```

Open browser to `http://localhost:5173`

**IMPORTANT:** Make sure to run `npm install` to install the qrcode library for working QR codes!

## 🤖 AI Products (No APIs!)

1. **🛍️ Smart Shopping Assistant** - AI chatbot for shopping recommendations
2. **👓 Virtual Try-On AR** - Try glasses/caps with your camera
3. **👁️ Eye-Blink Shooter** - Game controlled by blinking
4. **🎨 AI Image Editor** - Photo editing with 8 filters

## 🛠️ Utility Tools (9)

1. **🔐 Password Generator** - Secure passwords
2. **📱 QR Code Generator** - Scannable QR codes
3. **🔤 Text Case Converter** - 10 text transformations
4. **⚖️ Unit Converter** - 40+ units, 6 categories
5. **🌈 Color Palette** - Color scheme generator
6. **📝 Lorem Ipsum** - Placeholder text
7. **📋 Markdown Converter** - MD to HTML
8. **🖼️ Color Extractor** - From images
9. **{ } JSON Formatter** - Format & validate

## ✨ Features

- ✅ **100% Offline** - No external APIs
- ✅ **Privacy First** - All local processing
- ✅ **Free Forever** - No costs
- ✅ **Camera Support** - For AR features
- ✅ **Responsive** - Works on all devices

## 🎯 How to Use

1. Click any tool card on homepage
2. Tool opens in modal popup
3. Use the tool
4. Press ESC or click outside to close

### Camera Permissions

For Virtual Try-On and Eye-Blink Game:
- Click "Start Camera"
- Allow camera access when prompted
- Ensure good lighting for best results

## 📦 Build for Production

```bash
npm run build
```

Output in `dist/` folder - ready to deploy!

## 🌐 Browser Support

- Chrome 90+ ✅
- Firefox 88+ ✅  
- Safari 14+ ✅
- Edge 90+ ✅

## 🔧 Tech Stack

- React 18
- Vite
- Canvas API (for AR & image processing)
- MediaDevices API (for camera)
- Web Crypto API (for passwords)

## 🎨 Customization

### Change Colors

Edit CSS files and replace:
- `#8b5cf6` - Primary purple
- `#3b82f6` - Secondary blue
- `#ec4899` - Pink for AI products

### Add New Tool

1. Create `src/components/YourTool.jsx`
2. Create `src/components/YourTool.css`
3. Import in `src/pages/Home.jsx`
4. Add to `tools` array

## 🐛 Troubleshooting

**Camera not working?**
- Click "Allow" when browser asks for camera permission
- Check browser settings for camera access
- Try Chrome or Firefox (best support)
- Make sure you're on HTTPS or localhost

**QR codes not scannable?**
- Make sure you ran `npm install` first
- The qrcode library must be installed
- Try scanning with your phone's camera app

**Eye-Blink game not detecting blinks?**
- Ensure good, even lighting
- Position face in center of camera
- Blink normally and clearly
- Remove glasses if wearing any

**Virtual Try-On not showing video?**
- Allow camera permissions
- Check browser console for errors
- Refresh page and try again

**Tools not opening?**
- Clear browser cache
- Hard reload (Ctrl+Shift+R)
- Check browser console for errors

**Performance issues?**
- Close other tabs
- Update browser
- Use smaller images
- Restart browser

## 📄 License

MIT License - Free to use and modify

## 🎉 What's Special?

No expensive APIs like OpenAI, Google Vision, or AWS!

Instead:
- Smart local algorithms
- Browser Canvas API
- Camera pixel analysis
- Real-time rendering

Result: **Faster, Free, Private, Unlimited!**

---

**Enjoy your NexaAI Studio!** 🚀✨

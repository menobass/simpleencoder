# 🎬 Simple Video Compressor (PWA)

A lightweight **Progressive Web App** built for the **3Speak Community** that lets users **compress videos directly in the browser** using [`ffmpeg.wasm`](https://github.com/ffmpegwasm/ffmpeg.wasm).  
No uploads, no servers — everything happens locally for **privacy** and **speed**.

## 🚀 Features

✅ **Local Processing** - All video compression happens in your browser  
✅ **Multiple Formats** - Supports `.mp4`, `.mov`, `.mkv`, and more  
✅ **Compression Presets** - Light, Medium, and Strong compression options  
✅ **Real-time Progress** - See compression progress in real-time  
✅ **File Size Comparison** - View original vs compressed file sizes  
✅ **PWA Support** - Install and use offline on any device  
✅ **Privacy Focused** - No files ever leave your device  
✅ **Modern Design** - Twitter-inspired UI with clean, professional styling  

## 🛠️ Tech Stack

- **React** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **FFmpeg.wasm** - Video processing in WebAssembly
- **Tailwind CSS** - Utility-first styling
- **PWA** - Service worker for offline functionality

## 🚦 Quick Start

### Prerequisites
- Node.js 16+ installed
- Modern browser with WebAssembly support

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/menobass/simpleencoder.git
   cd simpleencoder
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder, ready for deployment.

## 📱 PWA Installation

Once deployed:

1. **Desktop:** Click the install button in your browser's address bar
2. **Mobile:** Tap "Add to Home Screen" from your browser menu
3. **Offline:** Works completely offline once installed

## 🎯 How to Use

1. **Select Video:** Click "Choose File" and select your video
2. **Choose Compression:** Pick Light, Medium, or Strong compression
3. **Load FFmpeg:** Click "Load FFmpeg" (first time only)
4. **Compress:** Click "Compress Video" and wait for processing
5. **Download:** Save your compressed video when complete

## 🔧 Compression Settings

| Preset | CRF Value | Description |
|--------|-----------|-------------|
| Light  | 24        | Slight compression, best quality |
| Medium | 28        | Balanced size vs. quality |
| Strong | 32        | Maximum compression, smaller file |

## 🏗️ Project Structure

```
src/
├── components/
│   └── VideoCompressor.jsx    # Main compression component
├── App.jsx                    # Root app component
├── index.css                  # Tailwind CSS imports
└── main.jsx                   # React entry point

public/
├── manifest.json              # PWA manifest
├── service-worker.js          # Service worker for offline support
└── icon-*.svg                 # PWA icons
```

## 🌐 Browser Support

- **Chrome/Edge** - Full support
- **Firefox** - Full support  
- **Safari** - Supported (iOS 16.4+)
- **Mobile** - Works on all modern mobile browsers

## 🔒 Privacy & Security

- **No Data Collection** - Nothing is tracked or stored
- **Local Processing** - Videos never leave your device
- **No Server Required** - Everything runs in your browser
- **Open Source** - Full transparency

## 🚀 Deployment

Deploy to any static hosting service:

### Vercel (Recommended)
1. Connect your GitHub repository to [Vercel](https://vercel.com)
2. Vercel will auto-detect Vite and deploy automatically
3. Your app will be live with automatic deployments on every push

### Netlify
```bash
npm run build
# Deploy the 'dist' folder
```

### Cloudflare Pages
```bash
npm run build
# Deploy the 'dist' folder
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

The main component is in `src/components/VideoCompressor.jsx`. Key areas:

- **File handling** - `handleFileSelect()` function
- **Compression logic** - `compressVideo()` function
- **UI components** - JSX return statement
- **FFmpeg integration** - `loadFFmpeg()` and compression commands

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) - WebAssembly FFmpeg
- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

**Built for the 3Speak Community with ❤️ by @meno**

## 🔗 Links

- **Live Demo:** [Coming Soon - Deploy to see it live!]
- **Repository:** [https://github.com/menobass/simpleencoder](https://github.com/menobass/simpleencoder)
- **3Speak:** [https://3speak.tv](https://3speak.tv)

---

*Empowering content creators with fast, private video compression tools.*

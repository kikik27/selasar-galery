# 🎨 Selasar Gallery

Platform galeri seni AI modern dengan sistem prompt sharing dan caching yang optimal.

## ✨ Features

- 🖼️ **AI Art Gallery** - Showcase karya seni AI dengan tampilan modern
- 📝 **Prompt Sharing** - Bagikan dan salin prompt AI
- ⚡ **Image Caching** - IndexedDB + Memory cache untuk performa maksimal
- 🎭 **User Profiles** - Profil artist dengan portfolio
- ❤️ **Like & Copy System** - Interaksi sosial dengan tracking
- 🛡️ **Content Moderation** - Sistem report dan moderasi admin
- 📱 **Responsive Design** - Neo-brutalism design yang modern
- 🔥 **Real-time Updates** - Firebase Firestore real-time sync

## 🚀 Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **Backend**: Firebase (Auth + Firestore + Storage)
- **Routing**: React Router v7
- **Icons**: Lucide React

## 📦 Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan Firebase credentials

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── AuthContext.tsx
│   ├── ErrorBoundary.tsx
│   ├── OptimizedImage.tsx
│   ├── Skeleton.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useImageCache.ts
│   ├── useLikeArtwork.ts
│   ├── useCopyPrompt.ts
│   ├── useArtworks.ts
│   └── useInfiniteScroll.ts
├── lib/                # Libraries & configs
│   └── firebase.ts
├── utils/              # Utility functions
│   ├── constants.ts
│   └── helpers.ts
├── types.ts            # TypeScript types
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## 🎯 Performance Optimizations

### Image Caching
- **IndexedDB** untuk persistent cache (7 hari)
- **Memory cache** untuk akses ultra-cepat
- **Progressive loading** dengan blur placeholder
- **Lazy loading** untuk images di bawah fold

### Code Splitting
- Vendor chunks terpisah (React, Firebase, UI)
- Dynamic imports untuk routes
- Tree-shaking otomatis

### React Optimizations
- `React.memo` untuk components
- Custom hooks untuk reusable logic
- Debounced search
- Infinite scroll dengan Intersection Observer

## 🔧 Configuration

### Firebase Setup
1. Buat project di [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Google Sign-in)
3. Create Firestore Database
4. Create Storage bucket
5. Copy credentials ke `.env`

### Environment Variables
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_ID=your_database_id
```

## 📊 Firestore Structure

```
artworks/
  {artworkId}/
    - title: string
    - prompt: string
    - imageUrl: string
    - artistId: string
    - artistName: string
    - likesCount: number
    - copyCount: number
    - tags: string[]
    - createdAt: timestamp
    
    likes/
      {userId}/
        - userId: string
        - createdAt: timestamp

users/
  {userId}/
    - username: string
    - bio: string
    - avatarUrl: string
    - createdAt: timestamp

reports/
  {reportId}/
    - artworkId: string
    - artworkTitle: string
    - reporterId: string
    - reason: string
    - status: string
    - createdAt: timestamp
```

## 🎨 Design System

- **Primary Color**: `#fbbf24` (Amber)
- **Background**: Dark theme dengan glassmorphism
- **Typography**: System fonts dengan bold weights
- **Borders**: 2-4px solid dengan shadows
- **Animations**: Smooth transitions dengan Framer Motion

## 🛠️ Development

```bash
# Type checking
npm run lint

# Clean build
npm run clean
```

## 📝 Code Quality

- TypeScript untuk type safety
- ESLint untuk code linting
- Custom hooks untuk reusable logic
- Error boundaries untuk error handling
- Proper loading states & skeletons

## 🚀 Deployment

```bash
# Build production
npm run build

# Deploy ke Vercel/Netlify
# atau hosting lainnya
```

## 📄 License

MIT License - feel free to use for your projects!

## 👨‍💻 Author

**Mula Labs**
- Email: labsmula@gmail.com
- GitHub: [@kikik27](https://github.com/kikik27)

---

Made with ❤️ by Mula Labs

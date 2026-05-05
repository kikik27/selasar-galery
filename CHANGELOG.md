# Changelog

All notable changes to Selasar Gallery will be documented in this file.

## [2.0.0] - 2026-05-05

### 🚀 Added
- **Image Caching System**: IndexedDB + Memory cache untuk performa optimal
- **OptimizedImage Component**: Progressive loading dengan blur placeholder
- **Custom Hooks**: 
  - `useImageCache` - Image caching management
  - `useLikeArtwork` - Like functionality dengan real-time sync
  - `useCopyPrompt` - Copy prompt dengan tracking
  - `useArtworks` - Fetch artworks dengan filtering
  - `useInfiniteScroll` - Infinite scroll implementation
- **Error Boundary**: Global error handling dengan fallback UI
- **Code Splitting**: Vendor chunks untuk faster loading
- **Helper Utilities**: Date formatting, text truncation, validation

### ⚡ Performance Improvements
- React.memo untuk components yang sering re-render
- Lazy loading untuk images
- Debounced search
- Optimized Firestore queries
- Build optimization dengan Terser
- Manual chunks untuk better caching

### 🎨 UI/UX Improvements
- Skeleton loading states
- Smooth transitions dengan Framer Motion
- Better responsive design
- Improved accessibility

### 🔧 Code Quality
- TypeScript strict mode
- ESLint configuration
- Better error handling
- Consistent code structure
- Separated concerns (hooks, utils, components)

### 📝 Documentation
- Comprehensive README
- Code comments
- Type definitions
- Environment setup guide

### 🐛 Bug Fixes
- Fixed memory leaks in useEffect
- Fixed infinite scroll issues
- Fixed image loading race conditions
- Fixed TypeScript errors

## [1.0.0] - 2026-04-01

### Initial Release
- Basic gallery functionality
- Firebase authentication
- Firestore database
- Upload artworks
- Like and copy system
- User profiles
- Content moderation

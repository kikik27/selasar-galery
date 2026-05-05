/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, Heart, ArrowRight, Plus, LogIn, LogOut, LayoutDashboard, Copy, Terminal, CheckCircle2, Flag, AlertTriangle, Shield, Check, Share2, Edit, User as UserIcon } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, onSnapshot, doc, updateDoc, increment, setDoc, deleteDoc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { useAuth } from './components/AuthContext';
import { UploadModal } from './components/UploadModal';
import { ShareModal } from './components/ShareModal';
import { EditArtworkModal } from './components/EditArtworkModal';
import { EditProfileModal } from './components/EditProfileModal';
import { LandingPage } from './components/LandingPage';
import { SelasarLogo } from './components/SelasarLogo';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OptimizedImage } from './components/OptimizedImage';
import { Artwork, UserProfile, Report } from './types';
import { ArtworkCardSkeleton, ProfileHeaderSkeleton, ArtworkDetailSkeleton } from './components/Skeleton';
import { useLikeArtwork } from './hooks/useLikeArtwork';
import { useCopyPrompt } from './hooks/useCopyPrompt';
import { ADMIN_EMAIL } from './utils/constants';
import { formatRelativeTime, isAdmin } from './utils/helpers';

// --- Application ---

const Navbar = memo(({ onOpenUpload }: { onOpenUpload: () => void }) => {
  const { user, userProfile, signIn, logout } = useAuth();
  const isUserAdmin = isAdmin(user?.email);
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between bg-dark-bg/60 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-10">
        <Link to="/" className="flex items-center gap-2 group">
          <SelasarLogo className="w-8 h-8 group-hover:scale-110 transition-transform" />
          <span className="text-xl font-extrabold tracking-tight">Selasar</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-white/50">
          <Link to="/gallery" className={`${location.pathname === '/gallery' ? 'text-primary' : 'hover:text-white'} transition-colors`}>Jelajahi</Link>
          {user && (
            <>
              <Link to="/dashboard" className={`${location.pathname === '/dashboard' ? 'text-primary' : 'hover:text-white'} transition-colors flex items-center gap-2`}>
                <LayoutDashboard className="w-4 h-4" />
                Dasbor
              </Link>
              {isUserAdmin && (
                <Link to="/moderation" className={`${location.pathname === '/moderation' ? 'text-primary' : 'hover:text-white'} transition-colors flex items-center gap-2`}>
                  <Shield className="w-4 h-4" />
                  Moderasi
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <button 
              onClick={onOpenUpload}
              className="hidden sm:flex items-center gap-2 px-4 py-2 glass-pill bg-primary/20 border-primary/20 text-primary hover:bg-primary/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs font-bold">Unggah Karya</span>
            </button>

            <button className="p-2.5 rounded-full bg-white/5 border border-white/10 relative">
              <Bell className="w-4 h-4" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-dark-bg" />
            </button>

            <div className="flex items-center gap-2 p-1.5 glass-pill pr-2 group relative">
              <OptimizedImage 
                src={userProfile?.avatarUrl || user.photoURL || ''} 
                alt={user.displayName || 'User'}
                className="w-8 h-8 rounded-full object-cover" 
              />
              <button onClick={logout} className="p-2 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={signIn}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm tracking-tight hover:bg-white/90 transition-all"
          >
            <LogIn className="w-4 h-4" />
            Masuk
          </button>
        )}
      </div>
    </nav>
  );
});

const ModerationQueue = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as Report)));
      setLoading(false);
    });
  }, []);

  const resolveReport = async (reportId: string) => {
    try {
      await deleteDoc(doc(db, 'reports', reportId));
    } catch (e) {
      console.error(e);
    }
  };

  const banArtwork = async (artworkId: string, reportId: string) => {
    if (!window.confirm("Anda yakin ingin menghapus karya ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      await deleteDoc(doc(db, 'artworks', artworkId));
      await deleteDoc(doc(db, 'reports', reportId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="pt-32 px-6 max-w-7xl mx-auto pb-40">
      <div className="flex items-center gap-4 mb-12">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-extrabold">Pusat Moderasi Galeri</h1>
          <p className="text-white/40 text-sm">Meninjau laporan dan menjaga kualitas konten di Selasar.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="py-20 text-center bg-white/5 rounded-3xl border border-white/5">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4 opacity-20" />
          <p className="text-sm text-white/20">Galeri dalam kondisi baik. Tidak ada laporan yang perlu ditinjau.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <motion.div 
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <h4 className="font-bold text-sm">Target: {report.artworkTitle}</h4>
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold uppercase">Pending Review</span>
                </div>
                <p className="text-sm text-white/60 mb-2 leading-relaxed">
                  <span className="text-white/20 italic">" {report.reason} "</span>
                </p>
                <div className="flex items-center gap-4 text-[10px] text-white/20 font-bold uppercase tracking-widest">
                  <span>ID: {report.artworkId}</span>
                  <span>•</span>
                  <span>Reported {new Date(report.createdAt?.toDate()).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => banArtwork(report.artworkId, report.id)}
                  className="px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/10"
                >
                  Hapus Karya
                </button>
                <button 
                  onClick={() => resolveReport(report.id)}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
                >
                  Dismiss Flag
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};


const ArtworkCard: React.FC<{ 
  artwork: Artwork, 
  isDashboard?: boolean, 
  onArtistClick?: (uid: string) => void, 
  onArtworkClick?: (id: string) => void,
  onShareClick?: (artwork: Artwork) => void,
  onEditClick?: (artwork: Artwork) => void
}> = memo(({ artwork, isDashboard = false, onArtistClick, onArtworkClick, onShareClick, onEditClick }) => {
  const { user } = useAuth();
  const { isLiked, toggleLike } = useLikeArtwork(artwork.id);
  const { copied, copyPrompt } = useCopyPrompt();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    await toggleLike();
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyPrompt(artwork.id, artwork.prompt);
  };

  const handleReport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const reason = window.prompt("Reason for reporting this artwork? (e.g. Inappropriate content, copyright violation)");
    if (!reason || reason.trim() === '') return;

    setIsReporting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        artworkId: artwork.id,
        artworkTitle: artwork.title,
        reporterId: user.uid,
        reason,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      alert("Karya telah dilaporkan. Tim moderasi akan segera meninjau.");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'reports');
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <motion.div 
      whileHover={{ 
        scale: 1.05
      }}
      onClick={() => onArtworkClick?.(artwork.id)}
      className="group rounded-card overflow-hidden bg-white/5 border border-white/10 flex flex-col h-full cursor-pointer transition-shadow"
    >
      <div className="aspect-[4/5] overflow-hidden relative">
        <OptimizedImage 
          src={artwork.imageUrl} 
          alt={artwork.title}
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
          {isDashboard && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEditClick?.(artwork);
              }}
              className="absolute top-4 left-16 p-2 bg-primary hover:bg-white text-black rounded-full transition-all border border-primary/20 group/edit"
              title="Edit Artwork"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onShareClick?.(artwork);
            }}
            className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-primary/80 rounded-full transition-all border border-white/10 group/share"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5 text-white/40 group-hover/share:text-black" />
          </button>
          <button 
            onClick={handleReport}
            disabled={isReporting}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-red-500/80 rounded-full transition-all border border-white/10 group/report"
            title="Report Content"
          >
            <Flag className={`w-3.5 h-3.5 ${isReporting ? 'animate-pulse' : ''} text-white/40 group-hover/report:text-white`} />
          </button>
          <div 
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 relative"
          >
            <Terminal className="w-3.5 h-3.5 text-primary" />
            <p className="text-[10px] text-white/70 line-clamp-2 italic font-mono">{artwork.prompt}</p>
            
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 right-0 mb-2 p-4 bg-black border border-white/20 rounded-xl shadow-2xl z-50 text-[11px] font-mono leading-relaxed text-white/90 max-h-40 overflow-y-auto"
                >
                  <div className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    Full Manifest
                  </div>
                  {artwork.prompt}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={handleCopy}
            className="w-full py-3 bg-white text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-xl"
          >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Prompts Berhasil Disalin' : 'Salin Prompt'}
          </button>
        </div>
        <div className="absolute top-4 right-4 z-20">
          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-md border ${
              isLiked ? 'bg-red-500 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-black/20 border-white/10 hover:bg-black/40'
            }`}
          >
            <motion.div
              animate={{ scale: isLiked ? [1, 1.4, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'text-white fill-current' : 'text-white/60'}`} />
            </motion.div>
          </motion.button>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-bold text-base mb-1 truncate max-w-[140px] group-hover:text-primary transition-colors">{artwork.title}</h4>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onArtistClick?.(artwork.artistId);
                }}
                className="text-xs text-white/40 hover:text-primary transition-colors hover:underline"
              >
                oleh {artwork.artistName}
              </button>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-[10px] font-bold text-white/30 uppercase">Suka</p>
                <p className="text-sm font-bold">{artwork.likesCount}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-white/30 uppercase">Salinan</p>
                <p className="text-sm font-bold">{artwork.copyCount}</p>
              </div>
            </div>
          </div>
          
          {artwork.tags && artwork.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {artwork.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-bold text-white/30 uppercase tracking-tighter">
                  #{tag}
                </span>
              ))}
              {artwork.tags.length > 3 && (
                <span className="text-[9px] font-bold text-white/20 mt-0.5">+{artwork.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

const DashboardView = ({ onArtistClick, onArtworkClick, onShareClick, onEditClick }: { onArtistClick: (uid: string) => void, onArtworkClick: (id: string) => void, onShareClick: (artwork: Artwork) => void, onEditClick: (artwork: Artwork) => void }) => {
  const { user, userProfile } = useAuth();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, 'artworks'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setArtworks(snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Artwork))
        .filter(a => a.artistId === user.uid)
      );
      setLoading(false);
    });
  }, [user]);

  if (!user) return <div className="pt-40 text-center">Please sign in.</div>;

  return (
    <div className="pt-32 px-6 max-w-7xl mx-auto pb-20">
      {loading && artworks.length === 0 && !userProfile ? (
        <ProfileHeaderSkeleton />
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-10 mb-16 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative group">
            <OptimizedImage 
              src={userProfile?.avatarUrl || user.photoURL || ''} 
              alt={userProfile?.username || user.displayName || 'User'}
              className="w-32 h-32 rounded-full border-2 border-primary/20 p-1 object-cover bg-dark-bg" 
            />
            <button 
              onClick={() => setIsEditProfileOpen(true)}
              className="absolute bottom-0 right-0 p-2.5 bg-primary text-black rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-dark-bg"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-4xl font-extrabold">{userProfile?.username || user.displayName}</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
                <Shield className="w-3 h-3" />
                Kreator Terverifikasi
              </span>
            </div>
            
            <p className="text-white/60 text-sm max-w-xl mb-6 leading-relaxed">
              {userProfile?.bio || "Seniman ini belum menulis manifestonya."}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">Kolaborasi</span>
                <span className="text-xl font-bold">0</span>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">Mahakarya</span>
                <span className="text-xl font-bold">{artworks.length}</span>
              </div>
              <div className="flex-1" />
              <button 
                onClick={() => setIsEditProfileOpen(true)}
                className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4 text-primary" />
                Ubah Profil
              </button>
            </div>
          </div>
        </div>
      )}

      <EditProfileModal 
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={userProfile}
        onSuccess={() => {}} // Success is handled by AuthContext onSnapshot
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading && artworks.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => <ArtworkCardSkeleton key={i} />)
        ) : artworks.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
              <Plus className="w-8 h-8" />
            </div>
            <p className="text-white/20 text-lg mb-4">Your digital gallery is currently empty.</p>
            <p className="text-white/10 text-sm mb-6">Start by uploading your first AI masterpiece!</p>
          </div>
        ) : (
          artworks.map(art => <ArtworkCard key={art.id} artwork={art} isDashboard onArtistClick={onArtistClick} onArtworkClick={onArtworkClick} onShareClick={onShareClick} onEditClick={onEditClick} />)
        )}
      </div>
    </div>
  );
};

const ArtistProfileView = ({ artistId, onArtistClick, onArtworkClick, onShareClick }: { artistId: string, onArtistClick: (uid: string) => void, onArtworkClick: (id: string) => void, onShareClick: (artwork: Artwork) => void }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, 'users', artistId));
      if (snap.exists()) {
        setProfile({ uid: snap.id, ...snap.data() } as UserProfile);
      }
    };

    const q = query(collection(db, 'artworks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setArtworks(snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Artwork))
        .filter(a => a.artistId === artistId)
      );
      setLoading(false);
    });

    fetchProfile();
    return unsubscribe;
  }, [artistId]);

  return (
    <div className="pt-32 px-6 max-w-7xl mx-auto pb-40">
      {loading && !profile ? (
        <ProfileHeaderSkeleton />
      ) : profile ? (
        <div className="flex flex-col md:flex-row items-center gap-8 mb-20 bg-white/[0.02] border border-white/5 p-12 rounded-card backdrop-blur-xl">
          <OptimizedImage 
            src={profile.avatarUrl || ''} 
            alt={profile.username}
            className="w-32 h-32 rounded-full border-2 border-primary/20 p-1" 
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl font-extrabold mb-4">{profile.username}</h1>
            <p className="text-white/60 text-lg leading-relaxed max-w-2xl italic font-light">
              {profile.bio || "No digital manifest found for this artist yet. Their works speak for themselves."}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-8 mt-8">
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Total Pieces</p>
                <p className="text-xl font-bold">{artworks.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Likes Gained</p>
                <p className="text-xl font-bold">{artworks.reduce((acc, curr) => acc + curr.likesCount, 0)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Prompt Clones</p>
                <p className="text-xl font-bold">{artworks.reduce((acc, curr) => acc + curr.copyCount, 0)}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-40 text-center">Creator not found in this dimension.</div>
      )}

      <div className="flex items-center gap-4 mb-12">
        <div className="h-px bg-white/10 flex-1" />
        <h2 className="text-xl font-bold tracking-widest text-white/40 uppercase">Artist's Collection</h2>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading && artworks.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => <ArtworkCardSkeleton key={i} />)
        ) : (
          artworks.map(art => <ArtworkCard key={art.id} artwork={art} onArtistClick={onArtistClick} onArtworkClick={onArtworkClick} onShareClick={onShareClick} />)
        )}
      </div>
    </div>
  );
};

const ArtworkDetailView = ({ artworkId, onArtistClick, onArtworkClick, onShareClick }: { artworkId: string, onArtistClick: (uid: string) => void, onArtworkClick: (id: string) => void, onShareClick: (artwork: Artwork) => void }) => {
  const { user } = useAuth();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [artist, setArtist] = useState<UserProfile | null>(null);
  const [related, setRelated] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLiked, toggleLike } = useLikeArtwork(artworkId);
  const { copied, copyPrompt } = useCopyPrompt();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const artSnap = await getDoc(doc(db, 'artworks', artworkId));
      if (artSnap.exists()) {
        const artData = { id: artSnap.id, ...artSnap.data() } as Artwork;
        setArtwork(artData);

        // Fetch artist
        const artistSnap = await getDoc(doc(db, 'users', artData.artistId));
        if (artistSnap.exists()) {
          setArtist({ uid: artistSnap.id, ...artistSnap.data() } as UserProfile);
        }

        // Fetch related (same artist or similar title/prompt - here we do same artist for simplicity)
        const q = query(
          collection(db, 'artworks'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const relatedSnap = await getDocs(q);
        setRelated(relatedSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as Artwork))
          .filter(a => a.id !== artworkId)
          .slice(0, 4)
        );
      }
      setLoading(false);
    };

    fetchData();
  }, [artworkId]);

  const handleLike = async () => {
    if (!user || !artwork) return;
    await toggleLike();
  };

  const handleCopy = async () => {
    if (!artwork) return;
    await copyPrompt(artwork.id, artwork.prompt);
  };

  if (loading && !artwork) return <ArtworkDetailSkeleton />;
  if (!artwork) return <div className="pt-40 text-center italic opacity-40">Artwork lost in the digital void.</div>;

  return (
    <div className="pt-32 px-6 max-w-7xl mx-auto pb-40">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left: Image */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative rounded-card overflow-hidden border border-white/5 shadow-2xl group"
        >
          <OptimizedImage 
            src={artwork.imageUrl} 
            alt={artwork.title}
            className="w-full h-auto object-cover"
            priority
          />
          <div className="absolute top-6 right-6">
            <motion.button 
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all backdrop-blur-xl border ${
                isLiked ? 'bg-red-500 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-black/40 border-white/10 hover:bg-black/60'
              }`}
            >
              <Heart className={`w-7 h-7 ${isLiked ? 'text-white fill-current' : 'text-white/80'}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* Right: Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col h-full"
        >
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20">Certified AI Work</span>
              <span className="text-white/20 text-xs font-mono">{new Date(artwork.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</span>
            </div>
            <h1 className="text-5xl font-black mb-6 leading-tight">{artwork.title}</h1>
            
            <button 
              onClick={() => onArtistClick(artwork.artistId)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
            >
              <OptimizedImage 
                src={artist?.avatarUrl || ''} 
                alt={artist?.username || 'Artist'}
                className="w-12 h-12 rounded-full border border-white/10" 
              />
              <div className="text-left">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Artist</p>
                <p className="font-bold group-hover:text-primary transition-colors">{artwork.artistName}</p>
              </div>
            </button>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm tracking-widest uppercase text-white/40">Logika Visual (Prompt)</h3>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => artwork && onShareClick(artwork)}
                    className="flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    Bagikan Karya
                  </button>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-xs font-bold text-primary hover:brightness-110 transition-all"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Berhasil Disalin' : 'Kloning Prompt Ini'}
                  </button>
                </div>
              </div>
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-sm italic font-mono leading-relaxed text-white/70 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary/40 transition-colors" />
                {artwork.prompt}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-sm tracking-widest uppercase text-white/40">Manifesto Seniman</h3>
              <p className="text-white/50 text-sm leading-relaxed italic">
                {artist?.bio || "Seniman ini lebih memilih membiarkan karya digitalnya berbicara melalui setiap pikselnya."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center">
                <p className="text-[10px] font-bold text-white/30 uppercase mb-2">Total Apresiasi</p>
                <p className="text-2xl font-black text-primary">{artwork.likesCount}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center">
                <p className="text-[10px] font-bold text-white/30 uppercase mb-2">Replikasi Prompt</p>
                <p className="text-2xl font-black text-primary">{artwork.copyCount}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Artworks */}
      <div className="mt-40">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-2xl font-bold tracking-tight">Eksplorasi Visi Terkait</h2>
          <div className="h-px bg-white/10 flex-1" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {related.length > 0 ? (
            related.map(art => (
              <ArtworkCard key={art.id} artwork={art} onArtistClick={onArtistClick} onArtworkClick={onArtworkClick} onShareClick={onShareClick} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center opacity-20 italic">Arsip karya terkait masih terus berkembang...</div>
          )}
        </div>
      </div>
    </div>
  );
};

const GalleryView = ({ onArtistClick, onArtworkClick, onShareClick }: { onArtistClick: (uid: string) => void, onArtworkClick: (id: string) => void, onShareClick: (artwork: Artwork) => void }) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | undefined>(undefined);

  const fetchArtworks = useCallback(async (isInitial = true) => {
    setLoading(true);
    try {
      const q = isInitial 
        ? query(collection(db, 'artworks'), orderBy('createdAt', 'desc'), limit(12))
        : query(collection(db, 'artworks'), orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(12));

      const snapshot = await getDocs(q);
      const newArtworks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artwork));
      
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 12);
      
      if (isInitial) {
        setArtworks(newArtworks);
      } else {
        setArtworks(prev => [...prev, ...newArtworks]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [lastVisible]);

  useEffect(() => {
    const q = query(collection(db, 'artworks'), orderBy('createdAt', 'desc'), limit(20));
    return onSnapshot(q, (snap) => {
      setArtworks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Artwork)));
      setLoading(false);
    });
  }, []);

  const lastArtworkElementRef = useCallback((node: any) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchArtworks(false);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchArtworks]);

  const allTags = Array.from(new Set(artworks.flatMap(a => a.tags || [])));
  const toggleTag = (tag: string) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const filteredArts = artworks.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(search.toLowerCase()) || 
                         art.prompt.toLowerCase().includes(search.toLowerCase());
    const matchesTags = activeTags.length === 0 || activeTags.every(tag => art.tags?.includes(tag));
    return matchesSearch && matchesTags;
  });

  const handleArtistClick = (uid: string) => onArtistClick(uid);
  const handleArtworkClick = (id: string) => onArtworkClick(id);
  const handleShareClick = (art: Artwork) => onShareClick(art);

  return (
    <>
      <section className="relative pt-48 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center z-10 relative">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-extrabold mb-8 leading-[1.1] max-w-5xl mx-auto"
          >
            Inovasi Digital <br /> 
            <span className="text-white/40">Bertemu Kreativitas Manusia</span>
          </motion.h1>
          <div className="flex justify-center mb-20">
            <div className="w-full md:w-[600px] relative mt-10">
              <input 
                type="text" 
                placeholder="Cari prompt unik..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-lg outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all pl-16"
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-12 flex-wrap">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 flex-grow">
            <button 
              onClick={() => {
                setSearch('');
                setActiveTags([]);
              }}
              className={`px-6 py-2.5 rounded-xl border text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                activeTags.length === 0 && search === '' 
                  ? 'bg-primary text-black border-primary' 
                  : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'
              }`}
            >
              Atur Ulang
            </button>
            {allTags.map(tag => (
              <button 
                key={tag as string} 
                onClick={() => toggleTag(tag as string)}
                className={`px-6 py-2.5 rounded-xl border text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTags.includes(tag as string) ? 'bg-primary/20 text-primary border-primary/50' : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>#{(tag as string)}</span>
                {activeTags.includes(tag as string) && <CheckCircle2 className="w-3 h-3" />}
              </button>
            ))}
          </div>
          {activeTags.length > 0 && (
            <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest border-l border-white/10 pl-6 h-10 flex items-center">
              Menyaring dengan {activeTags.length} gaya manifest
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading && artworks.length === 0 ? (
            Array.from({ length: 8 }).map((_, i) => <ArtworkCardSkeleton key={i} />)
          ) : (
            <>
              {filteredArts.map((art, index) => {
                if (artworks.length === index + 1) {
                  return (
                    <div ref={lastArtworkElementRef} key={art.id}>
                      <ArtworkCard artwork={art} onArtistClick={handleArtistClick} onArtworkClick={handleArtworkClick} onShareClick={handleShareClick} />
                    </div>
                  );
                } else {
                  return <ArtworkCard key={art.id} artwork={art} onArtistClick={handleArtistClick} onArtworkClick={handleArtworkClick} onShareClick={handleShareClick} />;
                }
              })}
            </>
          )}
          {filteredArts.length === 0 && !loading && artworks.length > 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
                <Search className="w-10 h-10" />
              </div>
              <p className="text-xl italic font-light text-white/40 mb-2">Gema kreatif tidak ditemukan...</p>
              <p className="text-sm text-white/20">Coba cari dengan kata kunci prompt yang berbeda.</p>
            </div>
          )}
          {loading && artworks.length > 0 && (
            Array.from({ length: 4 }).map((_, i) => <ArtworkCardSkeleton key={`loading-${i}`} />)
          )}
        </div>
      </section>
    </>
  );
};

export default function App() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sharingArtwork, setSharingArtwork] = useState<Artwork | null>(null);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent 
        isUploadOpen={isUploadOpen} 
        setIsUploadOpen={setIsUploadOpen}
        isShareOpen={isShareOpen}
        setIsShareOpen={setIsShareOpen}
        sharingArtwork={sharingArtwork}
        setSharingArtwork={setSharingArtwork}
        editingArtwork={editingArtwork}
        setEditingArtwork={setEditingArtwork}
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
      />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

const AppContent = ({ 
  isUploadOpen, setIsUploadOpen, 
  isShareOpen, setIsShareOpen, 
  sharingArtwork, setSharingArtwork,
  editingArtwork, setEditingArtwork,
  isEditOpen, setIsEditOpen
}: any) => {
  const navigate = useNavigate();

  const handleArtistClick = (uid: string) => navigate(`/artist/${uid}`);
  const handleArtworkClick = (id: string) => {
    navigate(`/artwork/${id}`);
  };
  const handleShareClick = (art: Artwork) => {
    setSharingArtwork(art);
    setIsShareOpen(true);
  };
  const handleEditClick = (art: Artwork) => {
    setEditingArtwork(art);
    setIsEditOpen(true);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white selection:bg-primary selection:text-black font-sans">
      <Navbar onOpenUpload={() => setIsUploadOpen(true)} />

      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/gallery" element={<GalleryView onArtistClick={handleArtistClick} onArtworkClick={handleArtworkClick} onShareClick={handleShareClick} />} />
          <Route path="/dashboard" element={<DashboardView onArtistClick={handleArtistClick} onArtworkClick={handleArtworkClick} onShareClick={handleShareClick} onEditClick={handleEditClick} />} />
          <Route path="/artist/:artistId" element={
            <ArtistWrapper 
              onArtistClick={handleArtistClick} 
              onArtworkClick={handleArtworkClick} 
              onShareClick={handleShareClick} 
            />
          } />
          <Route path="/artwork/:artworkId" element={
            <ArtworkWrapper 
              onArtistClick={handleArtistClick} 
              onArtworkClick={handleArtworkClick} 
              onShareClick={handleShareClick} 
            />
          } />
          <Route path="/moderation" element={<ModerationQueue />} />
        </Routes>
      </main>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={() => navigate('/dashboard')}
      />

      <ShareModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        artwork={sharingArtwork}
      />

      <EditArtworkModal 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => {}}
        artwork={editingArtwork}
      />

      <footer className="py-20 px-6 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="md:col-span-2 flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-6">
              <SelasarLogo className="w-7 h-7" />
              <span className="text-lg font-extrabold tracking-tight">Selasar</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
              Destinasi utama seni digital dan inovasi kreator. Buat, bagikan, dan beri inspirasi dengan AI.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-sm mb-6 uppercase tracking-widest text-white/60">Komunitas</h5>
            <ul className="space-y-4 text-sm text-white/40">
              <li>Sorotan Seniman</li>
              <li>Kurasi Global</li>
              <li>Ketentuan Privasi</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-sm mb-6 uppercase tracking-widest text-white/60">Dukungan</h5>
            <ul className="space-y-4 text-sm text-white/40">
              <li>Pusat Bantuan</li>
              <li>Keamanan Digital</li>
              <li>Akses API</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ArtistWrapper = (props: any) => {
  const { artistId } = useParams();
  return <ArtistProfileView artistId={artistId!} {...props} />;
};

const ArtworkWrapper = (props: any) => {
  const { artworkId } = useParams();
  return <ArtworkDetailView artworkId={artworkId!} {...props} />;
};

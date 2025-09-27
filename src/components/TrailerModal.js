import React, { useEffect } from 'react';

const TrailerModal = ({ videoKey, title = 'Trailer', onClose }) => {
  // Close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    // Prevent body scroll while open
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = original; };
  }, [onClose]);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  if (!videoKey) return null;
  const src = `https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={handleBackdrop}>
      <div className="relative w-full max-w-5xl bg-black/40 rounded-xl overflow-hidden ring-1 ring-white/10">
        <button aria-label="Close" onClick={onClose} className="absolute top-2 right-2 z-10 w-9 h-9 inline-flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
          <i className="fas fa-times" />
        </button>
        <div className="w-full aspect-video bg-black">
          <iframe
            title={title}
            src={src}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
        <div className="px-4 py-3 text-sm text-white/80 bg-black/30 border-t border-white/10">{title}</div>
      </div>
    </div>
  );
};

export default TrailerModal;

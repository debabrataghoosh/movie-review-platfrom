import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

const WishlistPage = () => {
  const { items, remove, clearAll } = useWishlist();

  return (
    <section className="pt-24 pb-16 text-white max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Wishlist</h1>
        {items.length > 0 && (
          <button onClick={clearAll} className="text-sm text-red-400 hover:underline">Clear All</button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="glass-lite rounded-xl p-6 text-white/70">No items yet. Add some movies or shows!</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {items.map(item => (
            <div key={item.id} className="group glass-lite rounded-xl overflow-hidden">
              <Link to={`/title/${item.id}`} className="block">
                {item.poster ? (
                  <img src={item.poster} alt={item.title} className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-60 bg-white/5 flex items-center justify-center text-xs">No Image</div>
                )}
                <div className="p-3">
                  <p className="text-sm font-medium truncate" title={item.title}>{item.title}</p>
                  {item.year && <p className="text-xs text-white/60">{item.year}</p>}
                </div>
              </Link>
              <div className="p-3 pt-0">
                <button onClick={() => remove(item.id)} className="text-xs text-white/70 hover:text-white">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default WishlistPage;

# MovieHub - Modern Movie Review & Rating Platform

A modern, full-featured React-based movie review and rating platform that integrates with The Movie Database (TMDB) API to provide real movie data and comprehensive user interaction features.

## 🚀 Features

- **Real Movie Data**: Integration with TMDB API for up-to-date movie information
- **Multi-Page Navigation**: React Router-powered navigation between different sections
- **Advanced Search & Filtering**: Search movies and filter by genre, year, and rating
- **User Ratings & Reviews**: Complete rating and review system with persistence
- **Dark/Light Theme**: Beautiful theme switching with smooth transitions
- **Responsive Design**: Fully responsive design using Tailwind CSS
- **Modern UI/UX**: Clean, modern interface with smooth animations
- **State Management**: Global state management using React Context API
- **Local Storage**: Persistent user data storage

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with functional components and hooks
- **React Router DOM** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Context API** - Global state management
- **Custom Hooks** - Reusable logic with localStorage integration

### API & Services
- **TMDB API** - The Movie Database API for real movie data
- **Axios** - HTTP client for API requests
- **Service Layer** - Organized API service architecture

### Development Tools
- **PostCSS** - CSS processing with Autoprefixer
- **ESLint** - Code linting and formatting
- **Font Awesome** - Icon library

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- TMDB API key (free from [themoviedb.org](https://www.themoviedb.org/settings/api))

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd movie-review-platfrom
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your TMDB API key:
   ```
   REACT_APP_TMDB_API_KEY=your_actual_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Header.js       # Navigation header with routing
│   ├── Hero.js         # Hero section with search
│   ├── SearchFilters.js # Advanced filtering controls
│   ├── MoviesGrid.js   # Movies grid display
│   ├── MovieCard.js    # Individual movie cards
│   ├── MovieModal.js   # Detailed movie modal
│   ├── StarRating.js   # Interactive star rating
│   └── Footer.js       # Footer component
├── pages/              # Page components for routing
│   ├── HomePage.js     # Home page with hero and popular movies
│   ├── MoviesPage.js   # All movies with filtering
│   ├── TopRatedPage.js # Top-rated movies
│   └── ReviewsPage.js  # User reviews page
├── context/            # React Context for state management
│   └── MovieContext.js # Global movie state and actions
├── services/           # API service layer
│   └── tmdbService.js  # TMDB API integration
├── hooks/              # Custom React hooks
│   └── useLocalStorage.js # localStorage management
├── data/               # Static/fallback data
│   └── moviesData.js   # Fallback movie data
├── App.js              # Main app with routing
├── App.css             # Tailwind CSS and custom styles
└── index.js            # React entry point
```

## 🎯 Key Components

### API Integration
- **TMDB Service**: Complete API wrapper with error handling
- **Image Handling**: Optimized image loading with fallbacks
- **Data Transformation**: Consistent data format across the app

### State Management
- **MovieContext**: Global state for movies, search, and filters
- **Custom Hooks**: Reusable logic for ratings, reviews, and themes
- **Local Storage**: Persistent user data across sessions

### Routing & Navigation
- **React Router**: Multi-page application structure
- **Active Link Highlighting**: Visual feedback for current page
- **Protected Routes**: Future-ready for authentication

### User Features
- **Interactive Ratings**: 5-star rating system with hover effects
- **Review System**: Full CRUD operations for user reviews
- **Theme Switching**: Smooth dark/light mode transitions
- **Search & Filters**: Real-time search with advanced filtering

## 🎨 Styling & Design

### Tailwind CSS Integration
- **Utility-First**: Responsive design with utility classes
- **Dark Mode**: Built-in dark mode support
- **Custom Theme**: Extended color palette and design tokens
- **Animations**: Smooth transitions and micro-interactions

### Responsive Breakpoints
- **Mobile First**: Optimized for mobile devices
- **Tablet**: Enhanced layouts for medium screens
- **Desktop**: Full-featured desktop experience

## 🔧 Configuration

### Environment Variables
```bash
REACT_APP_TMDB_API_KEY=your_tmdb_api_key
REACT_APP_NAME=MovieHub
REACT_APP_VERSION=2.0.0
```

### Tailwind Configuration
The project includes custom Tailwind configuration with:
- Extended color palette
- Custom animations
- Dark mode support
- Responsive breakpoints

## 🚀 Features in Detail

### TMDB API Integration
- Popular, top-rated, and now-playing movies
- Advanced movie search
- Detailed movie information
- High-quality movie posters and backdrops
- Genre and release information

### User Experience
- **Smooth Navigation**: Instant page transitions
- **Loading States**: Visual feedback during API calls
- **Error Handling**: Graceful fallbacks for API failures
- **Accessibility**: ARIA labels and keyboard navigation

### Performance Optimizations
- **Lazy Loading**: Images load on demand
- **Code Splitting**: Optimized bundle sizes
- **Caching**: Efficient data caching strategies
- **Responsive Images**: Multiple image sizes for different devices

## 🔮 Future Enhancements

- [ ] User authentication and profiles
- [ ] Movie watchlists and favorites
- [ ] Social features and friend recommendations
- [ ] Movie trailers and videos
- [ ] Advanced filtering (director, cast, etc.)
- [ ] Progressive Web App (PWA) features
- [ ] Movie recommendations based on ratings
- [ ] Export/import user data

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for the comprehensive movie API
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Font Awesome](https://fontawesome.com/) for the beautiful icons
- [React Team](https://reactjs.org/) for the amazing framework

## 📞 Support

If you have any questions or need help setting up the project, please create an issue in the repository or contact the development team.

---

**Built with ❤️ using modern web technologies**
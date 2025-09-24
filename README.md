# CineRank – Modern Movies & People Discovery Platform

A modern React + Tailwind application for discovering movies, TV series, and popular celebrities (people) using real data from The Movie Database (TMDB). The platform now emphasizes rich browsing, people exploration, progressive content reveal sections, and a refined glassmorphic UI.

## 🌐 Live Demo

Production Deployment: https://cinerank-tau.vercel.app

> If the link 404s shortly after a new deploy, wait a few seconds and refresh while DNS / CDN edges propagate.

## 🚀 Core Features

- **Real Movie & TV Data**: TMDB-powered (movies, TV series, trending, upcoming, now playing)
- **People / Celebs Module**: Browse popular celebrities and view detailed biography + "Known For" credits
- **Progressive Sections**: Weekly Picks & Popular Celebs with in-place "See more" expansion (no page reload/navigation)
- **Advanced Filter Popover**: Multi-genre selection, language filtering, rating/year sliders, clear & apply controls
- **Stable Routing IDs**: Added internal `tmdbId` to ensure correct detail navigation (fixes mismatched pages)
- **Unified Glass Buttons**: Reusable `LiquidButton` component for consistent glassmorphic CTAs
- **Modern Grid UI**: Responsive, accessible layouts with consistent spacing & large expressive headings
- **Local Ratings (Extensible)**: Context + localStorage patterns ready for persistent personalization
- **Context-driven State**: Central `MovieContext` aggregates movies, TV, people & details
- **Performance Friendly**: Conditional rendering, chunked lists, progressive reveal

> Legacy "Reviews" navigation was removed from header; review logic may be reintroduced later in a focused UX flow.

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

3. **Create environment file:** (the previous `.env.example` has been removed)
   Create a `.env` file in the project root:
   ```bash
   touch .env
   ```
   Add your TMDB API key (obtain from TMDB account settings):
   ```bash
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

## 🏗️ Project Structure (Key Paths)

```
src/
├── components/          # Reusable React components
│   ├── Header.js             # Navigation header (now includes People link)
│   ├── Hero.js               # Hero section (primary call to explore)
│   ├── WeeklyPicks.js        # Progressive multi-row movie showcase
│   ├── PopularCelebsSection.js # Progressive reveal celeb avatars
│   ├── PersonCard.js         # Circular celeb avatar card
│   ├── LiquidButton.js       # Reusable glassmorphic button
│   ├── FilterPopover.js      # Advanced filtering popover (genres/language/year/rating)
│   ├── MultiGenreFilter.js   # Internal multi-select genre control
│   ├── MoviesGrid.js         # Generic grid renderer
│   ├── MovieCard.js          # Movie/TV card with stable tmdbId
│   ├── MovieModal.js         # (Legacy / optional detail modal)
│   ├── StarRating.js         # Interactive rating display
│   └── Footer.js             # Footer component
├── pages/              # Page components for routing
│   ├── HomePage.js         # Home: Hero, Weekly Picks, Popular Celebs
│   ├── MoviesPage.js       # Movies listing with filters
│   ├── TvSeriesPage.js     # TV series listing
│   ├── TopRatedPage.js     # Top rated media
│   ├── NewReleasesPage.js  # Newly released / upcoming content
│   ├── PeoplePage.js       # Paginated grid of popular people
│   ├── PersonDetailPage.js # Biography + Known For credits
│   └── MovieDetailPage.js  # Detailed movie information
├── context/            # React Context for state management
│   └── MovieContext.js     # Global state: movies, tv, people, details
├── services/           # API service layer
│   ├── movieService.js     # Aggregated service (movies, tv, people)
│   └── tmdbService.js      # Low-level TMDB API integration
├── hooks/              # Custom React hooks
│   └── useLocalStorage.js # localStorage management
├── data/                   # Static/fallback data
│   └── moviesData.js       # Fallback movie sample data
├── utils/                  # Utility helpers
│   └── releaseMeta.js      # Release date -> badge/meta helpers
├── App.js              # Main app with routing
├── App.css             # Tailwind CSS and custom styles
└── index.js            # React entry point
```

## 🎯 Key Concepts & Components

### API & Data
- **movieService**: Consolidates fetch logic for movies, TV, trending, upcoming, people & person details
- **Stable IDs**: Transformer adds `tmdbId` to ensure consistent routing and key usage
- **Combined Credits**: Person detail page uses merged credits to power "Known For" section

### State Management
- **MovieContext**: Extended to include `popularPeople`, `personDetails`, plus existing movie & TV slices
- **Local Storage Hook**: Ready for persisting ratings/user preferences
- **Composable Filters**: Dynamic genre & language lists populated from API

### Routing & Navigation
- **Routes Added**: `/people`, `/person/:id`, `/tv-series`, `/top-rated`, `/new-releases`
- **Removed From Nav**: Legacy `/reviews` link (code retained for future iteration)
- **Deep Linking**: Stable detail page URLs using TMDB IDs

### User-Facing Features
- **Weekly Picks**: Curated section revealed row-by-row (5 items per expansion)
- **Popular Celebs**: Circular avatar grid with +5 reveal increments after first 10
- **Advanced Filters**: Multi-genre, language, year, and rating range (popover UI)
- **Glass UI Buttons**: `LiquidButton` variants (primary / ghost) unify CTAs
- **Movie & Person Detail**: Rich meta sections (biography, departments, known for)

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
REACT_APP_NAME=CineRank
REACT_APP_VERSION=2.0.0
```

### Tailwind Configuration
The project includes custom Tailwind configuration with:
- Extended color palette
- Custom animations
- Dark mode support
- Responsive breakpoints

## 🚀 Features in Detail (Expanded)

### TMDB & People Integration
- Popular, top-rated, trending (daily/weekly), upcoming, now-playing movies
- TV series category support
- Popular People list + individual person detail (bio, departments, known for credits)
- Stable link generation via `tmdbId`
- Poster/profile image handling with graceful fallback

### User Experience & UI
- **Progressive Reveal**: Incremental content avoids overwhelming the user
- **Glassmorphic Buttons**: Consistent interaction affordances
- **Responsive Grids**: Optimized layout at 2 / 3 / 5 column breakpoints
- **Hover Micro-interactions**: Subtle scale + ring effects on avatars/cards
- **Error & Empty States**: Safe-guards for missing profiles, ids, or data chunks

### Performance Considerations
- Chunked list rendering (rows of 5)
- Avoids unnecessary re-renders via memoized groups
- Minimal external dependencies (hand-rolled `cx` helper)
- Conditional feature rendering to reduce initial payload

## 🔮 Future Enhancements

- [ ] User authentication and profiles
- [ ] Movie watchlists and favorites
- [ ] Social features and friend recommendations
- [ ] Movie trailers and videos
- [ ] Advanced filtering (director, cast, etc.)
- [ ] Progressive Web App (PWA) features
- [ ] Movie recommendations based on ratings
- [ ] Export/import user data

## 🧭 Changelog (Recent)

### 2025-09 (People & UI Expansion)
- Added People module: `PeoplePage`, `PersonDetailPage`, `PersonCard`
- Added Popular Celebs progressive section on Home
- Added Weekly Picks progressive grid component
- Introduced `LiquidButton` for unified glassmorphic button styling
- Implemented advanced `FilterPopover` with multi-genre + language filters
- Stable `tmdbId` mapping for all media to fix incorrect detail navigations
- Removed legacy OMDb service & obsolete `.env.example`
- Spacing & typography refinements (section headings 3xl/4xl, consistent margins)
- Replaced ad-hoc buttons with `LiquidButton` variants
- Added `releaseMeta.js` utility for release labeling

### Earlier (Foundational)
- Core TMDB movie fetching, rating logic, base routing & theming
- Initial review scaffolding (currently hidden from navigation)

---

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
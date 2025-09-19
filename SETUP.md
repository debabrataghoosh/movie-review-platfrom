# Quick Setup Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Get TMDB API Key
1. Go to [The Movie Database](https://www.themoviedb.org/)
2. Create a free account
3. Navigate to Settings > API
4. Request an API key (it's free!)
5. Copy your API key

### 3. Setup Environment
```bash
# Create environment file
cp .env.example .env

# Edit .env and add your API key:
REACT_APP_TMDB_API_KEY=your_actual_api_key_here
```

### 4. Start Development Server
```bash
npm start
```

🎉 **That's it!** Your movie platform should now be running at `http://localhost:3000`

## 🛠️ Available Scripts

- `npm start` - Start development server
- `npm build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (⚠️ irreversible)

## 🎯 Key Features Working Out of the Box

✅ **Real Movie Data** - Powered by TMDB API  
✅ **Search & Filtering** - Find movies instantly  
✅ **User Ratings** - Rate movies with stars  
✅ **Reviews System** - Write and read reviews  
✅ **Dark/Light Mode** - Beautiful themes  
✅ **Mobile Responsive** - Works on all devices  
✅ **Fast Navigation** - React Router powered  

## 🔧 Troubleshooting

**No movies showing?**
- Check your TMDB API key in `.env`
- Make sure you have internet connection
- Check browser console for errors

**Styling looks broken?**
- Tailwind CSS should auto-compile
- Try restarting the development server

**Build errors?**
- Make sure all dependencies are installed
- Check Node.js version (should be 14+)

## 📚 Tech Stack Quick Reference

- **Frontend**: React 18 + Tailwind CSS
- **Routing**: React Router DOM
- **State**: Context API + Custom Hooks
- **API**: TMDB + Axios
- **Storage**: Browser LocalStorage

Need help? Check the main README.md for detailed documentation!
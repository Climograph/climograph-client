# 🌍 Climatica – Global Climate Explorer

<div align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDRhcDMxcjdodnJlNzF4d3A0aHRvNGFkOGlrdW1pd2ExaGdnbDZiayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o85xCVo1diTHyIoPC/giphy.gif" alt="Global Climate" width="300" />
</div>

**Climatica** is an interactive web application that allows you to explore, analyze, and compare climate data from around the world. Whether you're a student studying climate patterns, a researcher analyzing weather trends, or simply curious about climate statistics in different regions, Climatica provides powerful tools to visualize and understand global climate data.

## <span style="background-color: #0F6E56; padding: 5px 15px">Table of Contents</span>

- [Features](#-features)
- [Installation for Regular Users](#-installation-for-regular-users)
- [Installation for Developers](#-installation-for-developers)
- [Supported Languages](#-supported-languages)
- [System Requirements](#-system-requirements)
- [License](#-license)

---

## <span style="background-color: #1D9E75; padding: 5px 15px">Features</span>

### City Climate Statistics

- **Search for any city worldwide** and instantly see detailed climate information
- **Monthly temperature and precipitation charts** with visual graphs
- **Key statistics displayed**: Average high/low temperatures, total precipitation, data resolution
- **Interactive map** showing the selected city's location
- **One-click geolocation** – use your current location to see local climate data

### Compare Cities

- **Compare up to two cities side-by-side** to see climate differences
- **Statistical comparison cards** showing which city is warmer, wetter, etc.
- **Overlaid charts** for easy visual comparison of temperature and precipitation patterns
- **Monthly breakdown** to spot seasonal differences

### Regional Heatmap Analysis

- **Draw custom regions** (bounding boxes or polygons) on an interactive map
- **Heatmap visualization** showing temperature or precipitation distribution
- **Bulk statistics** for selected regions – minimum, maximum, and average values
- **Data density information** – see how many data points were analyzed

### Flexible Data Controls

- **Climate periods**: View historical climate data from different 30-year periods (1951–2020)
- **Weather data**: Access actual recorded weather data from 1951 to 2024
- **Multiple climate variables**: Temperature (max, min, average), Precipitation, Solar Radiation, Wind Speed, Vapor Pressure
- **Grid resolutions**: Choose data detail level (10m, 5m, 2.5m, 30s) based on your needs
- **Monthly filtering**: Analyze specific months or all months combined

### Multilingual Support

- **English, Spanish, and Ukrainian** – seamless language switching
- Entire interface translated – search, charts, statistics, buttons

### Export Your Analysis

- **Save climate charts as images** (PNG format)
- **Download statistical data** for further analysis in spreadsheets or analysis tools

---

## <span style="background-color: #0F6E56; padding: 5px 15px">Installation for Regular Userss</span>

This section is for people who just want to use the application. **No coding knowledge required!**

### Setup Instructions

#### Step 1: Install Node.js (One Time Only)

Node.js is software that runs the application on your computer. You only need to install it once.

1. Go to [nodejs.org](https://nodejs.org/)
2. Click the **LTS (Long Term Support)** button – the larger green button
3. Download and run the installer
4. Follow the installation wizard – just click "Next" for all defaults
5. Restart your computer after installation

**Verify it worked**: Open Terminal (Mac) or Command Prompt (Windows) and type:

```bash
node --version
```

You should see a version number like `v20.10.0`. If it works, move to Step 2!

#### Step 2: Get the Application Files

1. Download this project as a ZIP file from GitHub
2. Unzip it to a folder on your computer (e.g., `Desktop` or `Documents`)
3. Remember where you saved it

#### Step 3: Run the Application

1. **Open Terminal/Command Prompt**
   - **Mac**: Press `Cmd + Space`, type "terminal", press Enter
   - **Windows**: Press `Win + R`, type "cmd", press Enter

2. **Navigate to the application folder** by typing:

   ```bash
   cd path/to/climograph-client
   ```

   Replace `path/to/climograph-client` with your actual folder location

   Example on Mac:

   ```bash
   cd ~/Desktop/climograph-client
   ```

   Example on Windows:

   ```bash
   cd C:\Users\YourName\Downloads\climograph-client
   ```

3. **Install dependencies** (first time only, takes 1-2 minutes):

   ```bash
   npm install
   ```

4. **Start the application**:

   ```bash
   npm run dev
   ```

5. **Open in your browser**: You'll see a message like:
   ```
   Local:   http://localhost:5173
   ```
   Click that link or paste it in your browser. The application will open!

#### Step 4: Stop the Application

When you're done, press `Ctrl+C` (or `Cmd+C` on Mac) in Terminal/Command Prompt.

#### Running Again Next Time

Next time you want to use the application, just repeat Step 3 (the `npm run dev` part). You don't need to run `npm install` again.

### <mark style="padding: 2px 12px">Troubleshooting for Regular Users</mark>

**"Command not found"**  
Make sure you've installed Node.js and restarted your computer.

**"Port 5173 is already in use"**  
The application is already running elsewhere. Try again in 5 seconds or restart your computer.

**"npm: command not found"**  
Node.js didn't install correctly. Uninstall it and reinstall from [nodejs.org](https://nodejs.org/).

**"Nothing shows up in the browser"**  
Wait 10 seconds for the application to fully load, then refresh the browser (Cmd+R or Ctrl+R).

---

## <span style="background-color: #1D9E75; padding: 5px 15px">Installation for Developers</span>

This section is for developers who want to work on the code.

### Prerequisites

- **Node.js** v16+ ([nodejs.org](https://nodejs.org/))
- **npm** v8+ (comes with Node.js)
- **Git** (for cloning the repository)
- A code editor like [VS Code](https://code.visualstudio.com/)

### Setup Instructions

#### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd climograph-client
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Configure Environment Variables

Create a `.env` file in the root directory with your API keys:

```env
VITE_BASE_BACKEND_URL=http://localhost:4000
VITE_BASE_API_PREFIX=/api
VITE_WORLDCLIM_API_KEY=your-api-key-here
VITE_NODE_ENV=development
```

**Getting a WorldClim API Key**:

1. Visit [worldclim.org](https://www.worldclim.org/)
2. Register for an account
3. Copy your API key
4. Paste it in the `.env` file above

#### Step 4: Start Development

```bash
npm run dev
```

Development server runs at `http://localhost:5173` with hot reload enabled.

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Code formatting
npm run format

# Check everything (type-check + lint + format:check)
npm run check
```

### Project Structure

```
climograph-client/
├── src/
│   ├── api/                  # API services & axios configuration
│   │   ├── services/         # WorldClim & Wikidata service calls
│   │   └── axiosConfig.ts   # HTTP client setup
│   ├── components/           # React components
│   │   ├── Navbar/          # Top navigation
│   │   ├── Sidebar/         # Filter controls
│   │   ├── LeafletMap/      # Interactive map
│   │   └── ...              # Other UI components
│   ├── pages/               # Page containers (route-specific layouts)
│   │   ├── ClimateStatistics/
│   │   ├── CompareCities/
│   │   └── HeatMap/
│   ├── hooks/               # Custom React hooks
│   │   ├── data/            # Data fetching hooks
│   │   ├── persisted/       # localStorage persistence hooks
│   │   └── ui/              # UI state hooks
│   ├── stores/              # Zustand state management
│   │   ├── userStore.ts     # Authentication & user info
│   │   └── filtersStore.ts  # Filter selections
│   ├── constants/           # Static values
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Utility functions
│   ├── validators/          # Zod validation schemas
│   ├── i18n/                # Internationalization
│   ├── routes/              # React Router configuration
│   ├── env.ts               # Environment variable validation
│   ├── global-config.ts     # Centralized config access
│   ├── global.css           # Design tokens & global styles
│   └── main.tsx             # Application entry point
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── eslint.config.js         # ESLint configuration
├── prettier.config.js       # Prettier configuration
└── package.json             # Dependencies & scripts
```

### Key Technologies

| Technology                  | Purpose                 |
| --------------------------- | ----------------------- |
| **React 19**                | UI framework            |
| **Vite**                    | Build tool & dev server |
| **TypeScript**              | Type-safe JavaScript    |
| **TanStack Query**          | Data fetching & caching |
| **Zustand**                 | State management        |
| **React Router v7**         | Client-side routing     |
| **Tailwind CSS v4**         | Styling                 |
| **Leaflet + React Leaflet** | Interactive maps        |
| **Recharts**                | Data visualization      |
| **i18next**                 | Multilingual support    |
| **Axios**                   | HTTP client             |
| **Zod**                     | Schema validation       |

### Data Flow

```
Component
   ↓
Custom Hook (useQuery/useMutation)
   ↓
TanStack Query (caching & management)
   ↓
API Service (worldClimService, wikidataService)
   ↓
Axios HTTP Client
   ↓
WorldClim / Wikidata APIs
```

**Key Rules**:

- Components **never** import services directly – always use hooks
- All data fetching uses `useQuery` or `useMutation`
- Server state (TanStack Query), user state (Zustand), URL state (React Router)

### Code Standards

**Naming Conventions**:

- Types: `T` prefix (e.g., `TClimateData`)
- Component props: `Props` suffix (e.g., `SearchBarProps`)
- Enums: `E` prefix (e.g., `EDataset`)
- Files: PascalCase (components), camelCase (utilities)

**Quality Checks**:

```bash
npm run check   # Runs type-check, lint, format:check
```

**Git Commit Format**:

```
type(scope): message

Examples:
feat(sidebar): add precipitation toggle
fix(map): resolve marker offset
refactor(hooks): simplify useGetClimateData
```

### External APIs

**WorldClim Climate Data**

- Base: `https://scrapi.gsic.uva.es/apis/worldclim`
- Auth: Bearer token (`VITE_WORLDCLIM_API_KEY`)
- Data: Global climate & weather (1951–2024)

**Wikidata**

- Base: `https://query.wikidata.org/sparql`
- Auth: None needed
- Data: City search & reverse geocoding

### Developer Troubleshooting

**`npm install` fails**

```bash
npm cache clean --force
npm install
```

**Port 5173 already in use**

```bash
npm run dev -- --port 5174
```

**TypeScript errors**  
In VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"

**Browser cache issues**  
Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

## Supported Languages

The application supports three languages. Switch using the language selector in the top-right corner:

- English
- Spanish (Español)
- Ukrainian (Українська)

---

## License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.

---

## Author

**Andrii Kononenko** (wastardy)  
Email: wastardy.k@gmail.com

---

## Need Help?

### For Regular Users

- Check your internet connection
- Try restarting the application
- Make sure Node.js was installed correctly
- Clear your browser cache and refresh

### For Developers

- Check [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) for comprehensive development documentation
- Review browser console errors (F12)
- Verify environment variables in `.env` file
- Ensure internet connection for API calls
- Check that WorldClim API key is valid

---

**Last Updated**: May 2026  
**Current Version**: 1.0.0

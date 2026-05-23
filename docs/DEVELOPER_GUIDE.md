# <span style="background-color: #1D9E75; padding: 5px 15px">Developer Guide – Climatica</span>

A comprehensive guide for developers working on the Climatica climate data application.

## <span style="background-color: #0F6E56; padding: 5px 15px">Table of Contents</span>

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Project Architecture](#project-architecture)
4. [Code Standards & Conventions](#code-standards--conventions)
5. [File Organization](#file-organization)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Component Patterns](#component-patterns)
9. [Routing](#routing)
10. [Styling](#styling)
11. [Internationalization (i18n)](#internationalization-i18n)
12. [Error Handling](#error-handling)
13. [Git Workflow](#git-workflow)
14. [Common Patterns](#common-patterns)
15. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Climatica** is a React-based web application for exploring, analyzing, and comparing climate data from around the world using the WorldClim API.

### Tech Stack

| Layer                | Technology              | Version | Purpose                             |
| -------------------- | ----------------------- | ------- | ----------------------------------- |
| **UI Framework**     | React                   | 19      | Component-based UI                  |
| **Build Tool**       | Vite                    | Latest  | Fast dev server & production builds |
| **Language**         | TypeScript              | Latest  | Type safety                         |
| **Data Fetching**    | TanStack Query          | v4      | Server state & caching              |
| **State Management** | Zustand                 | v5      | Client state & auth                 |
| **Routing**          | React Router            | v7      | Client-side navigation              |
| **Styling**          | Tailwind CSS            | v4      | Utility-first CSS                   |
| **Maps**             | Leaflet + React Leaflet | Latest  | Interactive maps                    |
| **Charts**           | Recharts                | Latest  | Data visualization                  |
| **i18n**             | i18next                 | v26     | Multilingual support                |
| **HTTP Client**      | Axios                   | Latest  | API requests                        |
| **Validation**       | Zod                     | v4      | Schema validation                   |

### Key Features

- **City Climate Statistics** – Search cities and view detailed climate data
- **Compare Cities** – Side-by-side climate comparison
- **Regional Heatmap** – Draw regions and analyze bulk climate data
- **Flexible Filters** – Climate periods, weather years, variables, grid resolutions
- **Multilingual** – English, Spanish, Ukrainian
- **Export** – Save charts as images and data

---

## <span style="background-color: #1D9E75; padding: 5px 15px">Getting Started</span>

### Prerequisites

- Node.js v16+ (v18+ LTS recommended)
- npm v8+
- Git
- VS Code (recommended)

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd climograph-client

# Install dependencies
npm install

# Create .env file with your API keys
cat > .env << EOF
VITE_BASE_BACKEND_URL=http://localhost:4000
VITE_BASE_API_PREFIX=/api
VITE_WORLDCLIM_API_KEY=your-api-key-here
VITE_NODE_ENV=development
EOF

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Development Commands

```bash
npm run dev              # Start dev server with hot reload
npm run build            # Type-check + optimize production build
npm run preview          # Preview production build locally
npm run type-check       # TypeScript type checking
npm run lint             # ESLint code quality check
npm run format           # Auto-format code with Prettier
npm run format:check     # Check if code is formatted correctly
npm run check            # Run type-check + lint + format:check (CI gate)
```

### Getting a WorldClim API Key

1. Visit [worldclim.org](https://www.worldclim.org/)
2. Register for an account
3. Generate an API key from your account dashboard
4. Add it to your `.env` file as `VITE_WORLDCLIM_API_KEY`

---

## <span style="background-color: #1D9E75; padding: 5px 15px">Project Architecture</span>

### High-Level Data Flow

```
Component (UI)
    ↓
Custom Hook (useGetClimateData, useGetCompareData, etc.)
    ↓
TanStack Query (caching, refetch management)
    ↓
API Service (worldClimService, wikidataService)
    ↓
Axios HTTP Client (with auth interceptor)
    ↓
External APIs (WorldClim, Wikidata)
```

### Architectural Principles

1. **Separation of Concerns** – Components don't know about API details
2. **Hook-Based Data Fetching** – Services abstracted behind custom hooks
3. **Immutable Data** – No mutations of state; compute derived values
4. **Type Safety** – Strict TypeScript, no `any` types
5. **Single Responsibility** – Each file does one thing well

### Core Modules

#### `src/api/` – API Layer

```
api/
├── axiosConfig.ts         # Axios instance with auth interceptor
├── apiClient.ts           # Axios instance export
├── index.ts               # Barrel export
└── services/
    ├── worldClimService.ts   # WorldClim API queries
    ├── wikidataService.ts    # Wikidata city search & geocoding
    └── index.ts              # Barrel export
```

**Key Points**:

- Services are plain objects with async functions
- No React/hooks inside services
- All requests go through axios instance (auth injected automatically)

#### `src/hooks/` – Custom Hooks

```
hooks/
├── data/                  # Data fetching hooks (useQuery/useMutation)
│   ├── useGetClimateData.ts
│   ├── useGetCompareData.ts
│   ├── useGetCitySearch.ts
│   └── ...
├── persisted/             # localStorage persistence hooks
│   └── usePersistedCity.ts
├── ui/                    # UI state hooks
│   └── useDrawingMode.ts
└── index.ts               # Barrel export
```

**Key Points**:

- All data fetching uses `useQuery` or `useMutation`
- Hooks read from `useFiltersStore()` internally
- Query keys must include all params affecting results

#### `src/stores/` – State Management

```
stores/
├── filtersStore.ts        # Filter state (dataset, period, variables)
├── userStore.ts           # Auth state (persisted to localStorage)
└── index.ts               # Barrel export
```

**Key Points**:

- Zustand for lightweight, immutable state
- `userStore` persists to `localStorage` key `"user-storage"`
- Auth token auto-injected into axios requests

#### `src/components/` – React Components

```
components/
├── ComponentName/
│   ├── ComponentName.tsx     # Component logic
│   ├── ComponentName.type.ts # Props & internal types
│   ├── ComponentName.util.ts # Helper functions (optional)
│   ├── ComponentName.constant.ts # Constants (optional)
│   └── index.ts              # Barrel export
├── shared/                # Shared/generic components
├── svg/                   # SVG components
└── index.ts               # Barrel export
```

#### `src/pages/` – Page Containers

```
pages/
├── ClimateStatistics/
│   ├── ClimateStatistics.tsx      # Container (data + state)
│   ├── ClimateStatisticsView.tsx  # View (pure rendering)
│   └── ...
├── CompareCities/
├── HeatMap/
└── index.ts
```

**Page Pattern**:

- **Container** – Fetches data, manages events, resolves coordinates
- **View** – Receives all props, renders layout, no side effects

#### `src/constants/` – Static Configuration

```
constants/
├── worldclim.constant.ts   # Grid sizes, climate periods, weather years
├── coordinates.constant.ts # Default coordinates
├── error.constant.ts       # Error messages
├── navlink.constant.ts     # Navigation configuration
├── sidebar.constant.ts     # Filter UI config
└── index.ts                # Barrel export
```

#### `src/types/` – TypeScript Definitions

```
types/
├── api/                    # API response types
├── domain/                 # Business domain types
├── ui/                     # UI component types
└── index.ts
```

#### `src/utils/` – Utility Functions

```
utils/
├── worldclim.util.ts       # WorldClim API helpers
├── wikidata.util.ts        # Wikidata query builders
├── colorScale.util.ts      # Color mapping for heatmaps
├── walterLieth.util.ts     # Climate diagram calculations
├── export.util.ts          # Chart export helpers
├── cellCount.util.ts       # Grid cell calculations
└── index.ts
```

#### `src/validators/` – Zod Schemas

```
validators/
├── climate.validator.ts    # Climate data schemas
├── ...
└── index.ts
```

#### `src/i18n/` – Internationalization

```
i18n/
├── index.ts                # i18next config
└── locales/
    ├── en.json             # English translations
    ├── es.json             # Spanish translations
    └── uk.json             # Ukrainian translations
```

#### `src/routes/` – Routing Configuration

```
routes/
├── router.ts               # React Router v7 config
└── index.ts
```

---

## <span style="background-color: #1D9E75; padding: 5px 15px">Code Standards & Conventions</span>

### TypeScript Naming Conventions

Follow these naming patterns **strictly**:

| Element                          | Prefix  | Keyword     | Example                        |
| -------------------------------- | ------- | ----------- | ------------------------------ |
| Enum                             | `E`     | `enum`      | `EDataset`, `EClimateVariable` |
| Type (data shape)                | `T`     | `type`      | `TClimateData`, `TGridSize`    |
| Component props                  | `Props` | `type`      | `SearchBarProps`, `MapProps`   |
| Interface (class contracts only) | `I`     | `interface` | `ILogger`                      |

#### Type Definition Examples

```typescript
// ✅ Good: Derive from constants
export const GRID_SIZES = { TEN: "10m", FIVE: "5m", TWO_FIVE: "2.5m" } as const;
export type TGridSize = (typeof GRID_SIZES)[keyof typeof GRID_SIZES];

// ❌ Bad: Manually duplicated union
type TGridSize = "10m" | "5m" | "2.5m";

// ✅ Good: Enum for classification
export enum EDataset {
  CLIMATE = "climate",
  WEATHER = "weather",
}

// ✅ Good: Component props
type SearchBarProps = {
  onSearch: (query: string) => void;
  isLoading?: boolean;
};

// ❌ Bad: Inline object shapes
function handleSearch(props: { query: string; onComplete: () => void }) {}
// Should extract to named type instead
```

### Type Declaration Rules

1. **Types live in `*.type.ts` files** — never inline above components

   ```typescript
   // ✅ src/components/SearchBar/SearchBar.type.ts
   export type SearchBarProps = { ... };

   // ❌ Don't do this in component file
   type SearchBarProps = { ... };
   export function SearchBar(props: SearchBarProps) { ... }
   ```

2. **No `any` type** — ever. Use `unknown` for truly unknown types and type guard them

   ```typescript
   // ✅ Good
   function handleError(error: unknown) {
     if (error instanceof Error) {
       console.log(error.message);
     }
   }

   // ❌ Bad
   function handleError(error: any) { ... }
   ```

3. **No `as` type assertions** — use type guards or proper generics

   ```typescript
   // ✅ Good: Type guard
   if (typeof value === "string") {
     // value is string here
   }

   // ✅ Good: Generics
   function getValue<T>(data: unknown): T {
     return data as T; // ← acceptable only in utility functions
   }

   // ❌ Bad: Careless casting
   const count = apiResponse as number;
   ```

### File Naming Conventions

```
ComponentName.tsx          # React component
ComponentName.type.ts      # Component props & types
ComponentName.util.ts      # Helper functions
ComponentName.constant.ts  # Local constants
index.ts                   # Barrel export

myUtility.ts               # Utility functions (camelCase)
myService.ts               # Service functions (camelCase)
index.ts                   # Barrel export
```

### Code Organization

**Component Files**:

```typescript
// ✅ Good organization
import { FC } from 'react';
import { SearchBarProps } from './SearchBar.type';

export const SearchBar: FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

**Max Line Counts**:

- Components: ~100 lines (split if longer)
- Functions: ~30 lines (extract helper functions)
- Files: ~200 lines (consider splitting)

### Event Handlers

```typescript
// Props: use 'on' prefix
type ButtonProps = {
  onClick?: (event: React.MouseEvent) => void;
  onChange?: (value: string) => void;
};

// Implementation: use 'handle' prefix
const handleClick = () => {
  /* ... */
};
const handleSubmit = async () => {
  /* ... */
};
```

### Boolean Naming

```typescript
// ✅ Good prefixes for booleans
const isLoading = true;
const hasError = false;
const canSubmit = true;
const shouldRefresh = false;

// Props
type ButtonProps = {
  isDisabled?: boolean;
  isActive?: boolean;
  hasIcon?: boolean;
  canDelete?: boolean;
};
```

---

## <span style="background-color: #1D9E75; padding: 5px 15px">File Organization</span>

### Project Structure

```
climograph-client/
├── src/
│   ├── api/                        # API layer
│   │   ├── services/               # API service functions
│   │   ├── axiosConfig.ts
│   │   └── apiClient.ts
│   ├── components/                 # Reusable React components
│   │   ├── ComponentName/
│   │   │   ├── ComponentName.tsx
│   │   │   ├── ComponentName.type.ts
│   │   │   ├── ComponentName.util.ts
│   │   │   └── index.ts
│   │   ├── shared/                 # Generic/reusable components
│   │   ├── svg/                    # SVG components
│   │   └── index.ts
│   ├── pages/                      # Page containers
│   │   ├── ClimateStatistics/
│   │   ├── CompareCities/
│   │   ├── HeatMap/
│   │   └── index.ts
│   ├── hooks/                      # Custom React hooks
│   │   ├── data/                   # Data fetching hooks
│   │   ├── persisted/              # Persistence hooks
│   │   ├── ui/                     # UI state hooks
│   │   └── index.ts
│   ├── stores/                     # Zustand state stores
│   │   ├── filtersStore.ts
│   │   ├── userStore.ts
│   │   └── index.ts
│   ├── constants/                  # Static configuration
│   │   ├── worldclim.constant.ts
│   │   ├── error.constant.ts
│   │   └── index.ts
│   ├── types/                      # TypeScript definitions
│   │   ├── api/
│   │   ├── domain/
│   │   ├── ui/
│   │   └── index.ts
│   ├── utils/                      # Utility functions
│   │   ├── worldclim.util.ts
│   │   ├── wikidata.util.ts
│   │   └── index.ts
│   ├── validators/                 # Zod schemas
│   │   └── index.ts
│   ├── i18n/                       # Internationalization
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── en.json
│   │       ├── es.json
│   │       └── uk.json
│   ├── routes/                     # React Router config
│   │   ├── router.ts
│   │   └── index.ts
│   ├── enums/                      # TypeScript enums
│   │   └── index.ts
│   ├── App.tsx                     # Root component
│   ├── main.tsx                    # Entry point
│   ├── env.ts                      # Environment validation
│   ├── global-config.ts            # Config access
│   └── global.css                  # Global styles & tokens
├── public/                         # Static assets
├── docs/                           # Documentation
├── index.html                      # HTML entry
├── vite.config.ts                  # Vite config
├── tsconfig.json                   # TypeScript config
├── eslint.config.js                # ESLint config
├── prettier.config.js              # Prettier config
├── package.json                    # Dependencies
└── README.md                       # User documentation
```

### Barrel Exports

Always create `index.ts` files to export from directories:

```typescript
// ✅ src/hooks/data/index.ts
export { useGetClimateData } from "./useGetClimateData";
export { useGetCompareData } from "./useGetCompareData";
export { useGetCitySearch } from "./useGetCitySearch";

// Usage in components
import { useGetClimateData } from "@/hooks/data";
```

---

## <span style="background-color: #1D9E75; padding: 5px 15px">State Management</span>

### TanStack Query – Server State

**Purpose**: Remote data, caching, synchronization

```typescript
// ✅ Good: useQuery for data fetching
import { useQuery } from "@tanstack/react-query";
import { useFiltersStore } from "@/stores/filtersStore";

export function useGetClimateData(lat: number, lng: number, gridSize: TGridSize) {
  const { dataset, climatePeriod, weatherYear } = useFiltersStore();

  return useQuery({
    queryKey: ["climate", lat, lng, gridSize, dataset, climatePeriod, weatherYear],
    queryFn: () =>
      dataset === "climate"
        ? getClimateDataForPoint(lat, lng, gridSize, climatePeriod)
        : getWeatherDataForPoint(lat, lng, gridSize, weatherYear),
    staleTime: Infinity, // WorldClim data doesn't change
  });
}

// Usage in component
const { data: climateData, isLoading, error } = useGetClimateData(lat, lng, gridSize);
```

**Query Key Pattern**:

```
['climate', lat, lng, gridSize, climatePeriod | weatherYear]
```

**Must include all params that affect the result**. If missing, stale data may be returned.

### Zustand – Client State

**Purpose**: User state, auth, application configuration

```typescript
// ✅ Good: Zustand store
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TUserStore = {
  token: string | null;
  userId: string | null;
  setUser: (token: string, userId: string) => void;
  clearUser: () => void;
};

export const useUserStore = create<TUserStore>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      setUser: (token, userId) => set({ token, userId }),
      clearUser: () => set({ token: null, userId: null }),
    }),
    {
      name: "user-storage", // localStorage key
    },
  ),
);

// Usage in component
const { token, setUser } = useUserStore();
```

### URL State – Filters & Navigation

**Purpose**: Sync filters with URL (shareable links, browser back/forward)

```typescript
// ✅ Use URL search params for filters
import { useSearchParams } from 'react-router-dom';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const city = searchParams.get('city');

  const handleSearch = (newCity: string) => {
    setSearchParams({ city: newCity });
  };

  return <SearchBar value={city} onSearch={handleSearch} />;
}
```

### Local useState – UI Only

**Purpose**: Temporary UI state (modals, dropdowns, hover)

```typescript
// ✅ useState for UI-only state
const [isMenuOpen, setIsMenuOpen] = useState(false);
const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
```

### Rules

1. **Never store derived data in state** – compute from existing state

   ```typescript
   // ❌ Bad
   const [total, setTotal] = useState(0);
   const handleAdd = (value) => setTotal(total + value); // Derive, don't store

   // ✅ Good
   const [items, setItems] = useState<number[]>([]);
   const total = items.reduce((a, b) => a + b, 0); // Derive
   ```

2. **Query keys must include all affecting params**

   ```typescript
   // ❌ Bad: Query depends on year but key doesn't include it
   const query = useQuery({
     queryKey: ["weather", lat, lng], // Missing year!
     queryFn: () => getWeather(lat, lng, year),
   });

   // ✅ Good
   const query = useQuery({
     queryKey: ["weather", lat, lng, year],
     queryFn: () => getWeather(lat, lng, year),
   });
   ```

---

## <span style="background-color: #1D9E75; padding: 5px 15px">API Integration</span>

### Services (src/api/services/)

Services are plain objects with async functions — **no React hooks inside**:

```typescript
// ✅ Good: Plain service
export const worldClimService = {
  async getClimateDataForPoint(
    lat: number,
    lng: number,
    gridSize: TGridSize,
    period: TClimatePeriod,
  ) {
    const response = await axiosInstance.get("/worldclim/climate", {
      params: { lat, lng, grid: gridSize, period },
    });
    return response.data;
  },
};

// ❌ Bad: Don't use hooks in services
export function useClimateData() {
  // ← No hooks!
  const query = useQuery({
    /* ... */
  });
  return query;
}
```

### Using Services in Hooks

```typescript
// ✅ Hooks wrap services with useQuery/useMutation
import { useQuery } from "@tanstack/react-query";
import { worldClimService } from "@/api/services";

export function useGetClimateData(lat: number, lng: number, gridSize: TGridSize) {
  const { climatePeriod } = useFiltersStore();

  return useQuery({
    queryKey: ["climate", lat, lng, gridSize, climatePeriod],
    queryFn: () => worldClimService.getClimateDataForPoint(lat, lng, gridSize, climatePeriod),
  });
}
```

### Never Import Services in Components

```typescript
// ❌ Bad: Components never call services directly
import { worldClimService } from '@/api/services';

export function ClimateChart() {
  const [data, setData] = useState(null);

  useEffect(() => {
    worldClimService.getClimateDataForPoint(...).then(setData);
  }, []);
}

// ✅ Good: Use hooks instead
import { useGetClimateData } from '@/hooks/data';

export function ClimateChart({ lat, lng, gridSize }) {
  const { data, isLoading } = useGetClimateData(lat, lng, gridSize);
  return <div>{/* ... */}</div>;
}
```

### Axios Configuration

Auth token is automatically injected via interceptor:

```typescript
// ✅ src/api/axiosConfig.ts
export const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: GLOBAL_CONFIG.BASE_BACKEND_URL,
    timeout: 10000,
  });

  // Auth token injected here
  instance.interceptors.request.use((config) => {
    const token = useUserStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};
```

### Environment Variables

Use `GLOBAL_CONFIG` — **never** `import.meta.env` directly:

```typescript
// ✅ Good
import { GLOBAL_CONFIG } from "@/global-config";
const apiUrl = GLOBAL_CONFIG.BASE_BACKEND_URL;

// ❌ Bad
const apiUrl = import.meta.env.VITE_BASE_BACKEND_URL;
```

---

## <span style="background-color: #1D9E75; padding: 5px 15px">Component Patterns</span>

### Container + View Pattern

Split components into data-loading container and pure-rendering view:

```typescript
// ✅ Container: Fetches data, manages state
// src/pages/ClimateStatistics/ClimateStatistics.tsx
import { useGetClimateData } from '@/hooks/data';
import { ClimateStatisticsView } from './ClimateStatisticsView';

export function ClimateStatistics() {
  const { lat, lng } = getCoordinates(); // Resolve coordinates
  const { data: climate, isLoading } = useGetClimateData(lat, lng, '10m');

  return <ClimateStatisticsView climate={climate} isLoading={isLoading} />;
}

// ✅ View: Pure rendering, receives all props
// src/pages/ClimateStatistics/ClimateStatisticsView.tsx
type ClimateStatisticsViewProps = {
  climate: TClimateData | null;
  isLoading: boolean;
};

export function ClimateStatisticsView({ climate, isLoading }: ClimateStatisticsViewProps) {
  if (isLoading) return <LoadingSpinner />;
  if (!climate) return <ErrorMessage />;

  return (
    <div>
      {/* Pure rendering – no side effects */}
      <TemperatureChart data={climate} />
    </div>
  );
}
```

### Presentational Components

Presentational components **never** have side effects:

```typescript
// ✅ Good: Presentational component
type StatCardProps = {
  label: string;
  value: number;
  unit: string;
  color?: string;
};

export function StatCard({ label, value, unit, color = 'blue' }: StatCardProps) {
  return (
    <div className={`bg-${color}-100`}>
      <h3>{label}</h3>
      <p>{value} {unit}</p>
    </div>
  );
}

// ❌ Bad: Contains side effects
export function StatCard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData); // ← Side effect in presentational component
  }, []);

  return <div>{data}</div>;
}
```

### Component Size

```typescript
// Max ~100 lines per component
// If exceeding, split into smaller components

// ✅ Good: Break into smaller pieces
export function Dashboard() {
  return (
    <div>
      <Header />
      <Sidebar />
      <MainContent />
      <Footer />
    </div>
  );
}

// ❌ Bad: All in one component (200+ lines)
export function Dashboard() {
  return (
    <div>
      <div>{/* Header code */}</div>
      <div>{/* Sidebar code */}</div>
      <div>{/* Main content code */}</div>
      <div>{/* Footer code */}</div>
    </div>
  );
}
```

---

## <span style="background-color: #1D9E75; padding: 5px 15px">Routing</span>

### React Router v7

Routing configured in `src/routes/router.ts`:

```typescript
// ✅ All routes are children of Layout
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'climate-statistics',
        element: <ClimateStatistics />,
        children: [
          { path: 'search', element: <ClimateSearch /> },
        ],
      },
      {
        path: 'compare-cities',
        element: <CompareCities />,
      },
      {
        path: 'heatmap',
        element: <HeatMap />,
      },
    ],
    errorElement: <ErrorPage />,
  },
]);
```

### Navigation with URL State

```typescript
// ✅ Use search params for filter persistence
import { useNavigate, useSearchParams } from 'react-router-dom';

export function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSearch = (city: string) => {
    navigate(`/climate-statistics/search?city=${encodeURIComponent(city)}`);
  };

  return <input onChange={(e) => handleSearch(e.target.value)} />;
}
```

### Default Routes

- Root `/` redirects to `/climate-statistics/search`
- Unknown paths redirect to search page
- All pages accessible through Layout wrapper

---

## <span style="background-color: #1D9E75; padding: 5px 15px">Styling</span>

### Tailwind CSS v4 + CSS Custom Properties

No `tailwind.config.*` file — configured via `@tailwindcss/vite` plugin.

**Design tokens as CSS custom properties** in `src/global.css`:

```css
:root {
  --color-primary: #1d9e75;
  --color-secondary: #5dcaa5;
  --color-light: #9fe1cb;
  --color-dark: #0f6e56;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
}
```

### Using Tokens in Components

```typescript
// ✅ Use CSS custom properties
const styles = `
  background-color: var(--color-primary);
  padding: var(--spacing-md);
`;

// Or with Tailwind (extends custom properties)
<div className="bg-primary p-md">...</div>

// ❌ Never hardcode hex values
<div style={{ backgroundColor: '#1D9E75' }}>...</div>
```

### Color Palette

```
Primary:    #1D9E75
Secondary:  #5DCAA5
Light:      #9FE1CB
Dark:       #0F6E56
Chip Active: bg #E1F5EE, text #0F6E56, border #5DCAA5
```

---

## <span style="background-color: #1D9E75; padding: 5px 15px">Internationalization (i18n)</span>

### Three Supported Locales

- English (`en`)
- Spanish (`es`)
- Ukrainian (`uk`)

Translation files in `src/i18n/locales/`:

```
locales/
├── en.json
├── es.json
└── uk.json
```

### Using Translations in Components

```typescript
// ✅ Always use i18n hook
import { useTranslation } from 'react-i18next';

export function SearchBar() {
  const { t } = useTranslation();

  return (
    <input
      placeholder={t('search.placeholder')}
      aria-label={t('search.label')}
    />
  );
}

// ❌ Never hardcode user-facing strings
<input placeholder="Search for a city..." />
```

### Adding New UI Text

1. Add key to **all three** locale files:

```json
// src/i18n/locales/en.json
{
  "myFeature": {
    "title": "My New Feature",
    "description": "This is a new feature"
  }
}
```

```json
// src/i18n/locales/es.json
{
  "myFeature": {
    "title": "Mi Nueva Característica",
    "description": "Esta es una característica nueva"
  }
}
```

```json
// src/i18n/locales/uk.json
{
  "myFeature": {
    "title": "Моя нова функція",
    "description": "Це нова функція"
  }
}
```

2. Use in component:

```typescript
const { t } = useTranslation();
<h1>{t('myFeature.title')}</h1>
```

### Rules

- **Never restructure existing translation files** – only extend
- **Never add keys to just one locale** – update all three
- **Group related keys logically** (e.g., `search.placeholder`, `search.label`)

---

## <span style="background-color: #1D9E75; padding: 5px 15px">Error Handling</span>

### Async Errors

Always handle promise rejections:

```typescript
// ✅ Good: Handle async errors
async function fetchData() {
  try {
    const response = await api.get("/data");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    throw new Error("Data fetch failed");
  }
}

// ❌ Bad: Unhandled rejection
async function fetchData() {
  return api.get("/data").then((r) => r.data);
  // If promise rejects, it's unhandled!
}
```

### Type Error Handling

Always type caught errors as `unknown`:

```typescript
// ✅ Good: Type as unknown and guard
try {
  // ...
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown error:', error);
  }
}

// ❌ Bad: Don't assume error shape
catch (error: Error) {
  console.error(error.message); // May not be Error!
}
```

### Error Boundaries

Use Error Boundaries for component tree errors:

```typescript
// src/components/shared/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Error Boundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>
```

---

## <span style="background-color: #1D9E75; padding: 5px 15px">Git Workflow</span>

### Commit Convention

Format: `type(scope): message`

```
feat(sidebar): add precipitation variable toggle
fix(map): resolve marker position offset
refactor(hooks): simplify useGetClimateData
chore(deps): update react-query to v5
docs(guide): add component patterns section
perf(chart): memoize chart rendering
style(format): apply prettier formatting
```

### Commit Types

| Type       | When                               |
| ---------- | ---------------------------------- |
| `feat`     | New feature                        |
| `fix`      | Bug fix                            |
| `refactor` | Code reorganization (not a fix)    |
| `chore`    | Dependencies, tooling, config      |
| `docs`     | Documentation only                 |
| `perf`     | Performance improvement            |
| `style`    | Formatting only (Prettier, ESLint) |

### Rules

- Use **lowercase** and **imperative mood** (present tense)
- Include scope in parentheses
- Be specific about what changed

### Pre-Commit Checks

Always run before committing:

```bash
npm run check   # Runs type-check + lint + format:check
```

This is the CI gate — if it fails locally, it fails in CI.

---

## <span style="background-color: #1D9E75; padding: 5px 15px">Common Patterns</span>

### Data Fetching with Filters

```typescript
// Hook reads filters from store internally
export function useGetClimateData(lat: number, lng: number, gridSize: TGridSize) {
  const { dataset, climatePeriod, weatherYear } = useFiltersStore();

  return useQuery({
    queryKey: ['climate', lat, lng, gridSize, dataset, climatePeriod, weatherYear],
    queryFn: () => {
      if (dataset === 'climate') {
        return worldClimService.getClimateDataForPoint(
          lat,
          lng,
          gridSize,
          climatePeriod
        );
      } else {
        return worldClimService.getWeatherDataForPoint(lat, lng, gridSize, weatherYear);
      }
    },
    staleTime: Infinity,
  });
}

// Component just passes coordinates
function ClimateChart({ lat, lng, gridSize }: Props) {
  const { data, isLoading } = useGetClimateData(lat, lng, gridSize);
  return <Chart data={data} isLoading={isLoading} />;
}
```

### Conditional Rendering

```typescript
// ✅ Good: Clear loading/error/success states
function DataDisplay({ data, isLoading, error }: Props) {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;

  return <Chart data={data} />;
}
```

### Form Handling

```typescript
// ✅ Use useMutation for form submission
import { useMutation } from '@tanstack/react-query';

function SearchForm() {
  const { mutate: search, isPending } = useMutation({
    mutationFn: (city: string) => wikidataService.searchCity(city),
    onSuccess: (result) => {
      // Handle success
    },
    onError: (error) => {
      // Handle error
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const city = new FormData(e.currentTarget).get('city') as string;
    search(city);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="city" />
      <button disabled={isPending}>{isPending ? 'Searching...' : 'Search'}</button>
    </form>
  );
}
```

### Constants from Objects

```typescript
// ✅ Derive types from constants to avoid duplication
export const GRID_SIZES = {
  TEN: "10m",
  FIVE: "5m",
  TWO_FIVE: "2.5m",
  THIRTY_S: "30s",
} as const;

export type TGridSize = (typeof GRID_SIZES)[keyof typeof GRID_SIZES];

// Types are always in sync with constants
```

---

## <span style="background-color: #1D9E75; padding: 5px 15px">Troubleshooting</span>

### TypeScript Errors

**Problem**: "Type X is not assignable to type Y"

```bash
# Restart TS server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

**Problem**: "Cannot find module '@/hooks'"

```bash
# Check vite.config.ts path alias
# Should have: '@': path.resolve(__dirname, './src')
```

### Build Errors

**Problem**: `npm run build` fails with type errors

```bash
npm run type-check  # See detailed type errors
# Fix types, then rebuild
npm run build
```

### Development Server

**Problem**: Port 5173 already in use

```bash
npm run dev -- --port 5174  # Use different port
```

**Problem**: Hot reload not working

```bash
# Restart dev server
Ctrl+C
npm run dev
```

### API Integration Issues

**Problem**: 401 Unauthorized on API requests

```typescript
// Check that auth token is present in store
console.log(useUserStore.getState().token);

// Check .env file has correct API URL
// Check network tab in DevTools for request headers
```

**Problem**: CORS errors

```typescript
// WorldClim API must have CORS enabled
// Check browser console for specific error
// Verify API endpoint is correct
```

### Performance Issues

**Problem**: Slow component renders

```typescript
// Use React DevTools Profiler
// Check for unnecessary re-renders
// Memoize expensive computations

// ✅ Use memo for expensive components
export const Chart = memo(ChartComponent);

// ✅ Use useMemo for derived data
const memoizedData = useMemo(() => expensiveTransform(data), [data]);
```

**Problem**: Too many API requests

```typescript
// Check query keys include all affecting params
// Verify staleTime is set appropriately
// Check for duplicate requests in DevTools Network tab

const query = useQuery({
  queryKey: ["climate", lat, lng, gridSize, period], // All params
  queryFn: () => fetchData(),
  staleTime: Infinity, // Don't refetch unnecessarily
});
```

---

## <span style="background-color: #1D9E75; padding: 5px 15px">Quick Reference</span>

### Essential Commands

```bash
npm run dev           # Development server
npm run build         # Production build
npm run type-check    # Type checking
npm run lint          # Code quality
npm run format        # Auto-format
npm run check         # All checks (CI gate)
```

### Key Files

| File                         | Purpose                |
| ---------------------------- | ---------------------- |
| `src/routes/router.ts`       | Route definitions      |
| `src/global-config.ts`       | Config access          |
| `src/env.ts`                 | Environment validation |
| `src/global.css`             | Global styles & tokens |
| `src/stores/userStore.ts`    | Auth state             |
| `src/stores/filtersStore.ts` | Filter state           |
| `CLAUDE.md`                  | Technical reference    |
| `docs/DEVELOPER_GUIDE.md`    | This guide             |

### Important Patterns

```typescript
// Data fetching
const { data, isLoading, error } = useGetClimateData(lat, lng, gridSize);

// State management
const { token, setUser } = useUserStore();
const { dataset, climatePeriod } = useFiltersStore();

// Translations
const { t } = useTranslation();
<h1>{t('key.subkey')}</h1>

// Types
export const SIZES = { SMALL: 's', LARGE: 'l' } as const;
export type TSize = (typeof SIZES)[keyof typeof SIZES];
```

---

## Resources

- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [React Router Docs](https://reactrouter.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [i18next Guide](https://www.i18next.com/)
- [Zod Docs](https://zod.dev)

---

**Last Updated**: May 2026  
**Version**: 1.0

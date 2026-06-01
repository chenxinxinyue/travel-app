# 旅行小助手 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建移动端优先的旅行规划网页应用，支持行程管理、地图景点搜索、账单记录。

**Architecture:** React SPA with Vite, 高德地图作为地图和 POI 搜索引擎，Supabase 作为实时后端。三个页面通过 React Router 路由，TripContext 管理全局行程状态。

**Tech Stack:** React 18 + Vite + Tailwind CSS + Supabase + 高德地图 JS API 2.0 + react-router-dom v6

**前提条件：**
- 注册 Supabase 账号并创建项目
- 注册高德开放平台账号，获取 JS API Key（Web 端）

---

## 文件结构

```
Travel/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env
├── .env.example
├── supabase-migration.sql
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── lib/
│   │   └── supabase.js
│   ├── contexts/
│   │   └── TripContext.jsx
│   ├── hooks/
│   │   ├── useAmap.js
│   │   ├── useSpots.js
│   │   └── useBills.js
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── TripPage.jsx
│   │   └── BillsPage.jsx
│   └── components/
│       ├── Layout.jsx
│       ├── TripCard.jsx
│       ├── CreateTripModal.jsx
│       ├── JoinTripModal.jsx
│       ├── MapView.jsx
│       ├── SpotSearch.jsx
│       ├── SpotList.jsx
│       ├── Timeline.jsx
│       ├── AddBillModal.jsx
│       └── BillItem.jsx
```

---

### Task 1: 项目脚手架

**Files:**
- Create: `Travel/package.json`, `Travel/vite.config.js`, `Travel/tailwind.config.js`, `Travel/postcss.config.js`, `Travel/index.html`, `Travel/.env.example`, `Travel/src/main.jsx`, `Travel/src/App.jsx`, `Travel/src/index.css`

- [ ] **Step 1: 创建 package.json**

```bash
cd Travel
```

```json
{
  "name": "travel-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.10",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: 安装依赖**

```bash
npm install
```

- [ ] **Step 3: 创建 vite.config.js**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
});
```

- [ ] **Step 4: 创建 tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

- [ ] **Step 5: 创建 postcss.config.js**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: 创建 src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root {
  height: 100%;
  margin: 0;
  overscroll-behavior: none;
}
```

- [ ] **Step 7: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>旅行小助手</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 8: 创建 src/main.jsx**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 9: 创建最小 src/App.jsx**

```jsx
export default function App() {
  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      加载中...
    </div>
  );
}
```

- [ ] **Step 10: 验证脚手架**

```bash
npm run dev
```

打开 http://localhost:3000，应看到"加载中..."。

- [ ] **Step 11: 创建 .env.example**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_AMAP_KEY=your-amap-js-api-key
VITE_AMAP_SECRET=your-amap-secret
```

- [ ] **Step 12: 提交**

```bash
git add Travel/
git commit -m "feat: 项目脚手架 — Vite + React + Tailwind"
```

---

### Task 2: Supabase 客户端与数据库建表

**Files:**
- Create: `Travel/src/lib/supabase.js`, `Travel/supabase-migration.sql`
- Create: `Travel/.env`

- [ ] **Step 1: 创建 Supabase 客户端**

`Travel/src/lib/supabase.js`:

```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 2: 创建数据库迁移 SQL**

`Travel/supabase-migration.sql`:

```sql
create table trips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  invite_code text unique not null,
  created_at timestamptz default now()
);

create table participants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips on delete cascade not null,
  nickname text not null,
  color text not null,
  created_at timestamptz default now()
);

create table spots (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips on delete cascade not null,
  day_number int not null,
  name text not null,
  address text,
  lat float not null,
  lng float not null,
  poi_id text,
  created_at timestamptz default now()
);

create table locations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips on delete cascade not null,
  participant_id uuid references participants on delete cascade not null,
  lat float not null,
  lng float not null,
  updated_at timestamptz default now()
);

create table bills (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips on delete cascade not null,
  participant_id uuid references participants on delete cascade not null,
  item text not null,
  amount float not null,
  created_at timestamptz default now()
);

-- 禁止匿名读写，限制参与者只能访问自己行程的数据
alter table trips enable row level security;
alter table participants enable row level security;
alter table spots enable row level security;
alter table locations enable row level security;
alter table bills enable row level security;

-- 简化版 RLS：允许所有认证操作（后续可收紧）
create policy "allow all" on trips for all using (true);
create policy "allow all" on participants for all using (true);
create policy "allow all" on spots for all using (true);
create policy "allow all" on locations for all using (true);
create policy "allow all" on bills for all using (true);
```

> 在 Supabase 控制台的 SQL Editor 中执行上述 SQL。

- [ ] **Step 3: 创建 .env 文件**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_AMAP_KEY=your-amap-key
VITE_AMAP_SECRET=your-amap-secret
```

> 提示用户通过 `/config` 或在 shell 中设置环境变量。

- [ ] **Step 4: 提交**

```bash
git add Travel/src/lib/ Travel/supabase-migration.sql Travel/.env.example
git commit -m "feat: Supabase 客户端与数据库建表"
```

---

### Task 3: 路由与底部 Tab 布局

**Files:**
- Modify: `Travel/src/App.jsx`
- Create: `Travel/src/components/Layout.jsx`
- Create: `Travel/src/pages/HomePage.jsx` (占位)
- Create: `Travel/src/pages/TripPage.jsx` (占位)
- Create: `Travel/src/pages/BillsPage.jsx` (占位)

- [ ] **Step 1: 修改 App.jsx 加入路由**

`Travel/src/App.jsx`:

```jsx
import { Routes, Route } from 'react-router-dom';
import { TripProvider } from './contexts/TripContext';
import HomePage from './pages/HomePage';
import TripPage from './pages/TripPage';
import BillsPage from './pages/BillsPage';
import Layout from './components/Layout';

export default function App() {
  return (
    <TripProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<Layout />}>
          <Route path="/trip/:id" element={<TripPage />} />
          <Route path="/trip/:id/bills" element={<BillsPage />} />
        </Route>
      </Routes>
    </TripProvider>
  );
}
```

- [ ] **Step 2: 创建 Layout 组件**

`Travel/src/components/Layout.jsx`:

```jsx
import { Outlet, NavLink, useParams } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  `flex-1 text-center py-3 text-sm ${isActive ? 'text-blue-500 font-semibold' : 'text-gray-400'}`;

export default function Layout() {
  const { id } = useParams();

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <nav className="flex border-t bg-white">
        <NavLink to={`/trip/${id}`} end className={linkClass}>地图</NavLink>
        <NavLink to={`/trip/${id}/bills`} className={linkClass}>账单</NavLink>
      </nav>
    </div>
  );
}
```

- [ ] **Step 3: 创建占位页面**

`Travel/src/pages/HomePage.jsx`:

```jsx
export default function HomePage() {
  return <div className="p-4">行程列表</div>;
}
```

`Travel/src/pages/TripPage.jsx`:

```jsx
export default function TripPage() {
  return <div className="p-4">地图主页</div>;
}
```

`Travel/src/pages/BillsPage.jsx`:

```jsx
export default function BillsPage() {
  return <div className="p-4">账单页</div>;
}
```

- [ ] **Step 4: 验证路由**

```bash
npm run dev
```

访问 `/`、`/trip/test/map`、`/trip/test/bills` 确认路由和底部 Tab 正常。

- [ ] **Step 5: 提交**

```bash
git add Travel/src/
git commit -m "feat: 路由与底部 Tab 布局"
```

---

### Task 4: TripContext 行程状态管理

**Files:**
- Create: `Travel/src/contexts/TripContext.jsx`

- [ ] **Step 1: 创建 TripContext**

`Travel/src/contexts/TripContext.jsx`:

```jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const TripContext = createContext(null);

const COLORS = ['#4C8BF5', '#F5A623', '#7ED321', '#E94F4F', '#9B59B6', '#1ABC9C'];

function getStoredIdentity() {
  try {
    return JSON.parse(localStorage.getItem('travel_identity') || 'null');
  } catch { return null; }
}

function storeIdentity(tripId, participantId, nickname) {
  const identity = getStoredIdentity() || {};
  identity[tripId] = { participantId, nickname };
  localStorage.setItem('travel_identity', JSON.stringify(identity));
}

export function TripProvider({ children }) {
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [spots, setSpots] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  // 加载所有行程
  const loadTrips = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('trips').select('*').order('created_at', { ascending: false });
    if (data) setTrips(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadTrips(); }, [loadTrips]);

  // 加载单次行程的全部数据
  const loadTrip = useCallback(async (tripId) => {
    setLoading(true);
    const [tripRes, partRes, spotRes, billRes] = await Promise.all([
      supabase.from('trips').select('*').eq('id', tripId).single(),
      supabase.from('participants').select('*').eq('trip_id', tripId),
      supabase.from('spots').select('*').eq('trip_id', tripId).order('day_number'),
      supabase.from('bills').select('*, participants(nickname)').eq('trip_id', tripId).order('created_at', { ascending: false }),
    ]);
    if (tripRes.data) setCurrentTrip(tripRes.data);
    if (partRes.data) setParticipants(partRes.data);
    if (spotRes.data) setSpots(spotRes.data);
    if (billRes.data) setBills(billRes.data);
    setLoading(false);
  }, []);

  // 创建行程
  const createTrip = async ({ title, destination, startDate, endDate, nickname }) => {
    const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const { data: trip } = await supabase.from('trips').insert({
      title, destination,
      start_date: startDate, end_date: endDate,
      invite_code: inviteCode,
    }).select().single();

    if (!trip) throw new Error('创建行程失败');

    const color = COLORS[0];
    const { data: participant } = await supabase.from('participants').insert({
      trip_id: trip.id, nickname, color,
    }).select().single();

    if (participant) {
      storeIdentity(trip.id, participant.id, nickname);
    }

    await loadTrips();
    return trip;
  };

  // 加入行程
  const joinTrip = async (inviteCode, nickname) => {
    const { data: trip } = await supabase.from('trips').select('*').eq('invite_code', inviteCode.toUpperCase()).single();
    if (!trip) throw new Error('邀请码无效');

    const identity = getStoredIdentity();
    if (identity && identity[trip.id]) throw new Error('你已经在这个行程中了');

    const color = COLORS[(trip.id.length + nickname.length) % COLORS.length];
    const { data: participant } = await supabase.from('participants').insert({
      trip_id: trip.id, nickname, color,
    }).select().single();

    if (participant) {
      storeIdentity(trip.id, participant.id, nickname);
    }

    await loadTrips();
    return trip;
  };

  // 获取当前用户在该行程中的 participant 信息
  const getMyParticipant = (tripId) => {
    const identity = getStoredIdentity();
    return identity?.[tripId] || null;
  };

  // 删除行程
  const deleteTrip = async (tripId) => {
    await supabase.from('trips').delete().eq('id', tripId);
    await loadTrips();
  };

  const value = {
    trips, currentTrip, participants, spots, bills, loading,
    loadTrips, loadTrip, createTrip, joinTrip, deleteTrip, getMyParticipant,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within TripProvider');
  return ctx;
}
```

- [ ] **Step 2: 验证 Context 挂载**

`npm run dev` 确认无报错，页面正常渲染。

- [ ] **Step 3: 提交**

```bash
git add Travel/src/contexts/
git commit -m "feat: TripContext 行程与身份状态管理"
```

---

### Task 5: 行程列表页

**Files:**
- Modify: `Travel/src/pages/HomePage.jsx`
- Create: `Travel/src/components/TripCard.jsx`
- Create: `Travel/src/components/CreateTripModal.jsx`
- Create: `Travel/src/components/JoinTripModal.jsx`

- [ ] **Step 1: 创建 TripCard 组件**

`Travel/src/components/TripCard.jsx`:

```jsx
import { useNavigate } from 'react-router-dom';

export default function TripCard({ trip, onDelete }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-xl shadow-sm border p-4 mb-3 active:bg-gray-50"
      onClick={() => navigate(`/trip/${trip.id}`)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{trip.title}</h3>
          <p className="text-gray-400 text-sm mt-1">{trip.destination}</p>
          <p className="text-gray-300 text-xs mt-0.5">
            {trip.start_date} ~ {trip.end_date}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(trip.id); }}
          className="text-gray-300 text-xs active:text-red-400"
        >
          删除
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        邀请码: <span className="font-mono text-blue-400">{trip.invite_code}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 CreateTripModal 组件**

`Travel/src/components/CreateTripModal.jsx`:

```jsx
import { useState } from 'react';
import { useTrip } from '../contexts/TripContext';

export default function CreateTripModal({ open, onClose }) {
  const { createTrip } = useTrip();
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title || !destination || !startDate || !endDate || !nickname) {
      setError('请填写所有字段'); return;
    }
    setSubmitting(true);
    try {
      await createTrip({ title, destination, startDate, endDate, nickname });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <form
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold">创建行程</h2>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="我的昵称" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="行程标题，如「火锅特种兵」" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="目的地，如「成都」" value={destination} onChange={(e) => setDestination(e.target.value)} />
        <div className="flex gap-3">
          <input type="date" className="flex-1 border rounded-lg px-3 py-2 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" className="flex-1 border rounded-lg px-3 py-2 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <button type="submit" disabled={submitting}
          className="w-full bg-blue-500 text-white rounded-lg py-2.5 font-semibold disabled:opacity-50">
          {submitting ? '创建中...' : '创建行程'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: 创建 JoinTripModal 组件**

`Travel/src/components/JoinTripModal.jsx`:

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';

export default function JoinTripModal({ open, onClose }) {
  const { joinTrip } = useTrip();
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!inviteCode || !nickname) { setError('请填写所有字段'); return; }
    setSubmitting(true);
    try {
      const trip = await joinTrip(inviteCode, nickname);
      onClose();
      navigate(`/trip/${trip.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <form
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold">加入行程</h2>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="你的昵称" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <input className="w-full border rounded-lg px-3 py-2 text-sm uppercase" placeholder="邀请码" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} maxLength={6} />
        <button type="submit" disabled={submitting}
          className="w-full bg-blue-500 text-white rounded-lg py-2.5 font-semibold disabled:opacity-50">
          {submitting ? '加入中...' : '加入行程'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: 完善 HomePage**

`Travel/src/pages/HomePage.jsx`:

```jsx
import { useState } from 'react';
import { useTrip } from '../contexts/TripContext';
import TripCard from '../components/TripCard';
import CreateTripModal from '../components/CreateTripModal';
import JoinTripModal from '../components/JoinTripModal';

export default function HomePage() {
  const { trips, deleteTrip } = useTrip();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <header className="bg-white px-4 py-4 border-b">
        <h1 className="text-xl font-bold text-center">旅行小助手</h1>
      </header>

      <div className="flex-1 overflow-auto p-4">
        {trips.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg mb-2">还没有行程</p>
            <p className="text-sm">创建一个行程，邀请朋友一起规划吧</p>
          </div>
        )}
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} onDelete={deleteTrip} />
        ))}
      </div>

      <div className="p-4 flex gap-3 bg-white border-t">
        <button onClick={() => setShowCreate(true)}
          className="flex-1 bg-blue-500 text-white rounded-lg py-3 font-semibold">
          创建行程
        </button>
        <button onClick={() => setShowJoin(true)}
          className="flex-1 border border-blue-500 text-blue-500 rounded-lg py-3 font-semibold">
          加入行程
        </button>
      </div>

      <CreateTripModal open={showCreate} onClose={() => setShowCreate(false)} />
      <JoinTripModal open={showJoin} onClose={() => setShowJoin(false)} />
    </div>
  );
}
```

- [ ] **Step 5: 验证**

打开首页，点击"创建行程"填写表单，确认行程卡片出现且显示邀请码。

- [ ] **Step 6: 提交**

```bash
git add Travel/src/pages/HomePage.jsx Travel/src/components/
git commit -m "feat: 行程列表页 — 创建/加入/删除行程"
```

---

### Task 6: 高德地图集成

**Files:**
- Create: `Travel/src/hooks/useAmap.js`
- Create: `Travel/src/components/MapView.jsx`

- [ ] **Step 1: 创建 useAmap hook**

`Travel/src/hooks/useAmap.js`:

```js
import { useEffect, useRef, useState, useCallback } from 'react';

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY;
const AMAP_SECRET = import.meta.env.VITE_AMAP_SECRET;

// 动态加载高德地图 JS
function loadAmapScript(key, secret) {
  return new Promise((resolve, reject) => {
    if (window.AMap) { resolve(window.AMap); return; }
    const script = document.createElement('script');
    const secretParam = secret ? `&jscode=${secret}` : '';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}${secretParam}`;
    script.onload = () => resolve(window.AMap);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function useAmap(containerRef) {
  const [map, setMap] = useState(null);
  const [AMap, setAMap] = useState(null);
  const [ready, setReady] = useState(false);
  const markersRef = useRef([]);
  const currentMarkerRef = useRef(null);

  // 初始化地图
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    loadAmapScript(AMAP_KEY, AMAP_SECRET).then((amap) => {
      if (cancelled) return;
      setAMap(amap);

      const mapInstance = new amap.Map(containerRef.current, {
        zoom: 12,
        center: [116.397428, 39.90923], // 默认北京，后续定位覆盖
      });

      // 添加比例尺和缩放控件
      mapInstance.addControl(new amap.Scale());
      mapInstance.addControl(new amap.ToolBar({ position: 'RT' }));

      setMap(mapInstance);
      setReady(true);
    });

    return () => { cancelled = true; };
  }, [containerRef]);

  // 定位当前位置
  const locateMe = useCallback(() => {
    if (!AMap || !map) return;
    AMap.plugin('AMap.Geolocation', () => {
      const geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      map.addControl(geolocation);
      geolocation.getCurrentPosition((status, result) => {
        if (status === 'complete') {
          map.setCenter([result.position.lng, result.position.lat]);
          if (currentMarkerRef.current) {
            map.remove(currentMarkerRef.current);
          }
          currentMarkerRef.current = new AMap.Marker({
            position: [result.position.lng, result.position.lat],
            icon: new AMap.Icon({
              size: new AMap.Size(24, 24),
              image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
              imageSize: new AMap.Size(24, 24),
            }),
            zIndex: 100,
          });
          map.add(currentMarkerRef.current);
        }
      });
    });
  }, [AMap, map]);

  // 添加标记到地图
  const addMarker = useCallback((lng, lat, options = {}) => {
    if (!AMap || !map) return null;
    const marker = new AMap.Marker({
      position: [lng, lat],
      ...options,
    });
    map.add(marker);
    markersRef.current.push(marker);
    return marker;
  }, [AMap, map]);

  // 清除所有标记（保留当前位置标记）
  const clearMarkers = useCallback(() => {
    if (!map) return;
    markersRef.current.forEach((m) => map.remove(m));
    markersRef.current = [];
  }, [map]);

  // 适配视野以包含所有标记
  const fitView = useCallback((positions) => {
    if (!map || positions.length === 0) return;
    map.setFitView(positions.map((p) => new AMap.LngLat(p.lng, p.lat)));
  }, [map, AMap]);

  // POI 搜索
  const searchPOI = useCallback(async (keyword, city) => {
    if (!AMap) return [];
    return new Promise((resolve) => {
      AMap.plugin('AMap.PlaceSearch', () => {
        const search = new AMap.PlaceSearch({
          city,
          pageSize: 20,
          extensions: 'all',
        });
        search.search(keyword, (status, result) => {
          if (status === 'complete' && result.poiList) {
            resolve(result.poiList.pois);
          } else {
            resolve([]);
          }
        });
      });
    });
  }, [AMap]);

  return { map, AMap, ready, locateMe, addMarker, clearMarkers, fitView, searchPOI, currentMarkerRef };
}
```

- [ ] **Step 2: 创建 MapView 组件**

`Travel/src/components/MapView.jsx`:

```jsx
import { useRef, useEffect } from 'react';
import useAmap from '../hooks/useAmap';

export default function MapView({ spots, participants, onMapReady }) {
  const containerRef = useRef(null);
  const { map, AMap, ready, locateMe, addMarker, clearMarkers, fitView } = useAmap(containerRef);
  const firstLocateRef = useRef(false);

  // 首次加载后自动定位
  useEffect(() => {
    if (ready && !firstLocateRef.current) {
      firstLocateRef.current = true;
      locateMe();
    }
  }, [ready, locateMe]);

  // 通知父组件地图就绪
  useEffect(() => {
    if (ready && map) onMapReady?.({ map, AMap, locateMe, addMarker, clearMarkers, fitView });
  }, [ready, map, AMap]);

  // 当 spots 变化时，更新地图标记
  useEffect(() => {
    if (!ready || !AMap) return;
    clearMarkers();

    const positions = [];

    spots.forEach((spot) => {
      addMarker(spot.lng, spot.lat, {
        title: spot.name,
        label: { content: spot.name, direction: 'top', offset: new AMap.Pixel(0, -10) },
      });
      positions.push({ lng: spot.lng, lat: spot.lat });
    });

    if (positions.length > 0) fitView(positions);
  }, [spots, ready]);

  return (
    <div ref={containerRef} className="w-full h-full" />
  );
}
```

- [ ] **Step 4: 在 TripPage 中集成 MapView（最小版本，后续任务扩展）**

修改 `Travel/src/pages/TripPage.jsx`:

```jsx
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import MapView from '../components/MapView';

export default function TripPage() {
  const { id } = useParams();
  const { loadTrip, spots, participants } = useTrip();
  const mapRef = useRef(null);

  useEffect(() => { loadTrip(id); }, [id, loadTrip]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-[0.55]">
        <MapView spots={spots} participants={participants} onMapReady={(api) => { mapRef.current = api; }} />
      </div>
      <div className="flex-[0.45] flex items-center justify-center text-gray-300 text-sm">
        景点搜索和时间线（即将实现）
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 验证**

```bash
npm run dev
```

进入一个行程，确认地图加载、显示高德地图、点击定位按钮可定位。

> 注意：浏览器需要允许位置权限。本地开发时定位可能不准，使用 HTTPS 或 localhost 即可。

- [ ] **Step 6: 提交**

```bash
git add Travel/src/hooks/useAmap.js Travel/src/components/MapView.jsx Travel/src/pages/TripPage.jsx
git commit -m "feat: 高德地图集成 — 地图显示与定位"
```

---

### Task 7: 景点搜索与列表

**Files:**
- Create: `Travel/src/components/SpotSearch.jsx`
- Create: `Travel/src/components/SpotList.jsx`
- Create: `Travel/src/hooks/useSpots.js`
- Modify: `Travel/src/pages/TripPage.jsx`

- [ ] **Step 1: 创建 useSpots hook**

`Travel/src/hooks/useSpots.js`:

```js
import { supabase } from '../lib/supabase';

export function useSpots() {
  const addSpot = async (tripId, spot, dayNumber) => {
    const { data, error } = await supabase.from('spots').insert({
      trip_id: tripId,
      day_number: dayNumber,
      name: spot.name,
      address: spot.address || '',
      lat: spot.lat || spot.location.lat,
      lng: spot.lng || spot.location.lng,
      poi_id: spot.id || null,
    }).select().single();

    if (error) throw error;
    return data;
  };

  const removeSpot = async (spotId) => {
    await supabase.from('spots').delete().eq('id', spotId);
  };

  const loadSpots = async (tripId) => {
    const { data } = await supabase.from('spots').select('*').eq('trip_id', tripId).order('day_number');
    return data || [];
  };

  return { addSpot, removeSpot, loadSpots };
}
```

- [ ] **Step 2: 创建 SpotSearch 组件**

`Travel/src/components/SpotSearch.jsx`:

```jsx
import { useState } from 'react';

export default function SpotSearch({ onResults, city, mapRef }) {
  const [keyword, setKeyword] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim() || !mapRef.current) return;
    setSearching(true);
    const results = await mapRef.current.searchPOI(keyword, city || '全国');
    onResults(results);
    setSearching(false);

    // 搜索结果在地图上打点
    if (results.length > 0) {
      const { AMap } = mapRef.current;
      mapRef.current.clearMarkers();
      results.forEach((poi) => {
        const [lng, lat] = [poi.location.lng, poi.location.lat];
        const marker = new AMap.Marker({
          position: [lng, lat],
          title: poi.name,
        });
        mapRef.current.map.add(marker);
        mapRef.current.markersRef.current.push(marker);
      });
      mapRef.current.fitView(results.map((p) => ({ lng: p.location.lng, lat: p.location.lat })));
    }
  };

  return (
    <div className="px-3 py-2 bg-white border-b flex gap-2">
      <input
        className="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50"
        placeholder={`搜索${city ? city + '的' : ''}景点...`}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button onClick={handleSearch} disabled={searching}
        className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
        {searching ? '搜索中' : '搜索'}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: 创建 SpotList 组件**

`Travel/src/components/SpotList.jsx`:

```jsx
import { useState } from 'react';
import { useSpots } from '../hooks/useSpots';
import { useTrip } from '../contexts/TripContext';

export default function SpotList({ results, tripId, spots }) {
  const { addSpot } = useSpots();
  const { loadTrip } = useTrip();
  const [dayPicker, setDayPicker] = useState(null); // { spot: poi }
  const [adding, setAdding] = useState(false);

  const spotPoiIds = new Set(spots.map((s) => s.poi_id));

  const handleAdd = async (dayNumber) => {
    if (!dayPicker) return;
    setAdding(true);
    try {
      await addSpot(tripId, dayPicker, dayNumber);
      await loadTrip(tripId);
      setDayPicker(null);
    } finally {
      setAdding(false);
    }
  };

  if (results.length === 0) {
    return <div className="p-6 text-center text-gray-400 text-sm">搜索景点来添加</div>;
  }

  return (
    <div className="divide-y">
      {results.map((poi, i) => {
        const added = spotPoiIds.has(poi.id);
        return (
          <div key={poi.id || i} className="px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{poi.name}</p>
              <p className="text-xs text-gray-400 truncate">{poi.address || poi.pname}</p>
            </div>
            {added ? (
              <span className="text-xs text-green-400 shrink-0">已添加</span>
            ) : (
              <button onClick={() => setDayPicker(poi)}
                className="text-xs bg-blue-500 text-white rounded-full px-3 py-1 shrink-0">
                想去
              </button>
            )}
          </div>
        );
      })}

      {/* Day 选择弹窗 */}
      {dayPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setDayPicker(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-xs p-6" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold mb-1">{dayPicker.name}</p>
            <p className="text-xs text-gray-400 mb-4">添加到哪一天？</p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((d) => (
                <button key={d} onClick={() => handleAdd(d)} disabled={adding}
                  className="border rounded-lg py-2 text-sm font-medium active:bg-blue-50 disabled:opacity-50">
                  Day {d}
                </button>
              ))}
            </div>
            <button onClick={() => setDayPicker(null)}
              className="w-full mt-3 text-gray-400 text-sm py-2">取消</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 更新 TripPage 接入搜索和列表**

修改 `Travel/src/pages/TripPage.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import MapView from '../components/MapView';
import SpotSearch from '../components/SpotSearch';
import SpotList from '../components/SpotList';

export default function TripPage() {
  const { id } = useParams();
  const { loadTrip, spots, participants, currentTrip } = useTrip();
  const mapRef = useRef(null);
  const [tab, setTab] = useState('list');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => { loadTrip(id); }, [id, loadTrip]);

  return (
    <div className="h-full flex flex-col">
      <SpotSearch onResults={setSearchResults} city={currentTrip?.destination} mapRef={mapRef} />
      <div className="flex-[0.55]">
        <MapView spots={spots} participants={participants} onMapReady={(api) => { mapRef.current = api; }} />
      </div>
      <div className="flex-[0.45] flex flex-col">
        <div className="flex border-b">
          <button onClick={() => setTab('list')}
            className={`flex-1 py-2.5 text-sm ${tab === 'list' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}>
            景点列表
          </button>
          <button onClick={() => setTab('timeline')}
            className={`flex-1 py-2.5 text-sm ${tab === 'timeline' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}>
            时间线
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {tab === 'list'
            ? <SpotList results={searchResults} tripId={id} spots={spots} />
            : <div className="flex items-center justify-center h-full text-gray-300 text-sm">即将实现</div>
          }
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 提交**

```bash
git add Travel/src/components/SpotSearch.jsx Travel/src/components/SpotList.jsx Travel/src/hooks/useSpots.js Travel/src/pages/TripPage.jsx
git commit -m "feat: 景点搜索与列表 — POI 搜索 + 添加到日程"
```

---

### Task 8: 时间线（日程视图）

**Files:**
- Create: `Travel/src/components/Timeline.jsx`
- Modify: `Travel/src/pages/TripPage.jsx`

- [ ] **Step 1: 创建 Timeline 组件**

`Travel/src/components/Timeline.jsx`:

```jsx
import { useSpots } from '../hooks/useSpots';
import { useTrip } from '../contexts/TripContext';

export default function Timeline({ spots, tripId, currentTrip, participants }) {
  const { removeSpot } = useSpots();
  const { loadTrip } = useTrip();

  if (!currentTrip) return null;

  const start = new Date(currentTrip.start_date);
  const end = new Date(currentTrip.end_date);
  const dayCount = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

  const grouped = {};
  for (let d = 1; d <= dayCount; d++) {
    grouped[d] = spots.filter((s) => s.day_number === d);
  }

  const handleRemove = async (spotId) => {
    await removeSpot(spotId);
    await loadTrip(tripId);
  };

  return (
    <div className="divide-y">
      {Array.from({ length: dayCount }, (_, i) => i + 1).map((day) => (
        <div key={day} className="px-4 py-3">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Day {day}</h4>
          {grouped[day]?.length === 0 && (
            <p className="text-xs text-gray-300 pl-2">暂无安排</p>
          )}
          {grouped[day]?.map((spot) => (
            <div key={spot.id} className="flex items-center gap-2 pl-2 py-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{spot.name}</p>
                {spot.address && <p className="text-xs text-gray-400 truncate">{spot.address}</p>}
              </div>
              <button onClick={() => handleRemove(spot.id)}
                className="text-xs text-gray-300 active:text-red-400 shrink-0">移除</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 更新 TripPage 接入 Timeline**

修改 `Travel/src/pages/TripPage.jsx` 中的时间线 Tab 部分，将占位的 `<div>即将实现</div>` 替换为：

```jsx
<Timeline spots={spots} tripId={id} currentTrip={currentTrip} participants={participants} />
```

同时在文件顶部添加 import：
```jsx
import Timeline from '../components/Timeline';
```

- [ ] **Step 3: 提交**

```bash
git add Travel/src/components/Timeline.jsx Travel/src/pages/TripPage.jsx
git commit -m "feat: 时间线组件 — 按天展示已选景点"
```

---

### Task 9: 账单页

**Files:**
- Modify: `Travel/src/pages/BillsPage.jsx`
- Create: `Travel/src/components/AddBillModal.jsx`
- Create: `Travel/src/components/BillItem.jsx`
- Create: `Travel/src/hooks/useBills.js`

- [ ] **Step 1: 创建 useBills hook**

`Travel/src/hooks/useBills.js`:

```js
import { supabase } from '../lib/supabase';

export function useBills() {
  const addBill = async (tripId, participantId, item, amount) => {
    const { data, error } = await supabase.from('bills').insert({
      trip_id: tripId,
      participant_id: participantId,
      item,
      amount: parseFloat(amount),
    }).select().single();

    if (error) throw error;
    return data;
  };

  const deleteBill = async (billId) => {
    await supabase.from('bills').delete().eq('id', billId);
  };

  return { addBill, deleteBill };
}
```

- [ ] **Step 2: 创建 BillItem 组件**

`Travel/src/components/BillItem.jsx`:

```jsx
export default function BillItem({ bill, onDelete }) {
  const payer = bill.participants?.nickname || '未知';

  return (
    <div className="flex items-center px-4 py-3 gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{bill.item}</p>
        <p className="text-xs text-gray-400">{payer} 支付</p>
      </div>
      <p className="text-sm font-semibold text-orange-500 shrink-0">¥{bill.amount.toFixed(2)}</p>
      <button onClick={() => onDelete(bill.id)}
        className="text-xs text-gray-300 active:text-red-400 shrink-0">删除</button>
    </div>
  );
}
```

- [ ] **Step 3: 创建 AddBillModal 组件**

`Travel/src/components/AddBillModal.jsx`:

```jsx
import { useState } from 'react';
import { useTrip } from '../contexts/TripContext';
import { useBills } from '../hooks/useBills';

export default function AddBillModal({ open, onClose }) {
  const { currentTrip, participants, loadTrip, getMyParticipant } = useTrip();
  const { addBill } = useBills();
  const tripId = currentTrip?.id;
  const myInfo = getMyParticipant(tripId);

  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState(myInfo?.participantId || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!item || !amount || !payerId) { setError('请填写所有字段'); return; }
    setSubmitting(true);
    setError('');
    try {
      await addBill(currentTrip.id, payerId, item, amount);
      await loadTrip(currentTrip.id);
      setItem(''); setAmount(''); onClose();
    } catch (err) {
      setError(err.message);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <form
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold">添加开销</h2>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="花在什么地方" value={item} onChange={(e) => setItem(e.target.value)} />
        <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="金额" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" />
        <select className="w-full border rounded-lg px-3 py-2 text-sm" value={payerId} onChange={(e) => setPayerId(e.target.value)}>
          <option value="">谁付的</option>
          {participants.map((p) => (
            <option key={p.id} value={p.id}>{p.nickname}</option>
          ))}
        </select>
        <button type="submit" disabled={submitting}
          className="w-full bg-blue-500 text-white rounded-lg py-2.5 font-semibold disabled:opacity-50">
          {submitting ? '添加中...' : '添加'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: 完善 BillsPage**

`Travel/src/pages/BillsPage.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import BillItem from '../components/BillItem';
import AddBillModal from '../components/AddBillModal';
import { useBills } from '../hooks/useBills';

export default function BillsPage() {
  const { id } = useParams();
  const { bills, loadTrip, currentTrip } = useTrip();
  const { deleteBill } = useBills();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { if (id) loadTrip(id); }, [id, loadTrip]);

  const total = bills.reduce((sum, b) => sum + b.amount, 0);

  const handleDelete = async (billId) => {
    await deleteBill(billId);
    await loadTrip(id);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <header className="bg-white px-4 py-4 border-b flex justify-between items-center">
        <h1 className="font-bold text-lg">{currentTrip?.title || '账单'}</h1>
        <button onClick={() => setShowAdd(true)}
          className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl">
          +
        </button>
      </header>

      <div className="flex-1 overflow-auto">
        {bills.length === 0 ? (
          <div className="text-center text-gray-400 mt-20 text-sm">还没有记账</div>
        ) : (
          <div className="bg-white mt-2 divide-y">
            {bills.map((bill) => (
              <BillItem key={bill.id} bill={bill} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {bills.length > 0 && (
        <div className="bg-white border-t px-4 py-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">总花销</span>
          <span className="text-lg font-bold text-orange-500">¥{total.toFixed(2)}</span>
        </div>
      )}

      <AddBillModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
```

- [ ] **Step 5: 验证**

进入一个行程，切到账单页，添加几笔开销，确认列表和总花销正确。

- [ ] **Step 6: 提交**

```bash
git add Travel/src/pages/BillsPage.jsx Travel/src/components/AddBillModal.jsx Travel/src/components/BillItem.jsx Travel/src/hooks/useBills.js
git commit -m "feat: 账单页 — 添加/删除开销 + 总花销"
```

---

### Task 10: 位置共享与朋友标记

**Files:**
- Modify: `Travel/src/hooks/useAmap.js`
- Modify: `Travel/src/components/MapView.jsx`
- Modify: `Travel/src/pages/TripPage.jsx`

- [ ] **Step 1: useAmap hook 添加参与者标记方法**

在 `Travel/src/hooks/useAmap.js` 的 return 前添加：

```js
// 添加参与者位置标记
const addParticipantMarker = useCallback((lng, lat, nickname, color) => {
  if (!AMap || !map) return null;
  const marker = new AMap.Marker({
    position: [lng, lat],
    icon: new AMap.Icon({
      size: new AMap.Size(20, 20),
      image: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='8' fill='${encodeURIComponent(color)}' stroke='white' stroke-width='2'/%3E%3C/svg%3E`,
      imageSize: new AMap.Size(20, 20),
    }),
    title: nickname,
    zIndex: 90,
  });
  map.add(marker);
  return marker;
}, [AMap, map]);
```

并在 return 中导出 `addParticipantMarker`。

- [ ] **Step 2: MapView 中支持参与者标记与位置更新**

修改 `Travel/src/components/MapView.jsx`，在 spots 的 useEffect 之后添加参与者标记逻辑：

```jsx
const participantMarkersRef = useRef([]);

useEffect(() => {
  if (!ready || !AMap) return;

  // 清除旧的参与者标记
  participantMarkersRef.current.forEach((m) => map.remove(m));
  participantMarkersRef.current = [];

  participants.forEach((p) => {
    if (p._location) {
      const marker = addParticipantMarker(p._location.lng, p._location.lat, p.nickname, p.color);
      if (marker) participantMarkersRef.current.push(marker);
    }
  });
}, [participants, ready]);
```

同时需要在 MapView 的 props 解构中添加 `addParticipantMarker`，并在 onMapReady 回调中暴露。

- [ ] **Step 3: TripPage 中处理位置上报**

修改 `Travel/src/pages/TripPage.jsx`，添加位置上报按钮：

在 SpotSearch 下方添加位置共享按钮：

```jsx
const [sharingLocation, setSharingLocation] = useState(false);

const shareLocation = async () => {
  if (!mapRef.current) return;
  setSharingLocation(true);
  try {
    const { AMap, map } = mapRef.current;
    AMap.plugin('AMap.Geolocation', () => {
      const geolocation = new AMap.Geolocation({ enableHighAccuracy: true, timeout: 10000 });
      geolocation.getCurrentPosition(async (status, result) => {
        if (status === 'complete') {
          const myInfo = getMyParticipant(id);
          if (myInfo) {
            await supabase.from('locations').upsert({
              trip_id: id,
              participant_id: myInfo.participantId,
              lat: result.position.lat,
              lng: result.position.lng,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'participant_id' });
            await loadTrip(id);
          }
        }
        setSharingLocation(false);
      });
    });
  } catch { setSharingLocation(false); }
};
```

- [ ] **Step 4: 提交**

```bash
git add Travel/src/
git commit -m "feat: 位置共享 — 参与者位置标记与上报"
```

---

### Task 11: 收尾 — 部署到 Vercel

- [ ] **Step 1: 构建验证**

```bash
cd Travel && npm run build
```

修复所有构建错误（如有）。

- [ ] **Step 2: 创建 vercel.json**

`Travel/vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 3: 部署**

```bash
cd Travel && npx vercel --prod
```

按提示登录 Vercel，配置环境变量（同 .env）。

- [ ] **Step 4: 提交**

```bash
git add Travel/vercel.json
git commit -m "chore: Vercel 部署配置"
```

---

## 实现顺序建议

按 Task 1 → 11 顺序执行。每个 Task 独立可验证：

1. 脚手架 → `npm run dev` 正常
2. Supabase → 表建好、客户端可连接
3. 路由 + Layout → 三个页面可以切换
4. TripContext → Context 挂载无报错
5. 行程列表 → 创建/加入/删除行程可用
6. 地图集成 → 地图加载 + 定位
7. 景点搜索 → 搜索 POI + 添加景点
8. 时间线 → 按天展示景点
9. 账单页 → 记账 + 总花销
10. 位置共享 → 朋友位置显示
11. 部署 → 线上可访问

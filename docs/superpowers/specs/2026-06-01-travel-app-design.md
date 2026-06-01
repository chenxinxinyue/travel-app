# 旅行小助手 — 设计文档

## 概述

一个移动端优先的网页应用，供三五好友在旅行规划中使用。用户创建行程、邀请朋友加入、在地图上搜索和标注景点、以及记录花销。核心目标是比微信群聊更高效地协同规划。

## 技术栈

| 层 | 选型 | 原因 |
|---|---|---|
| 前端框架 | React 18+ | 状态管理自然，生态丰富 |
| 地图 | 高德地图 JS API 2.0 | 国内 POI 搜索和定位精度最佳，个人开发免费 |
| 后端/数据库 | Supabase | 免费层够用，自带实时同步和 Row Level Security |
| 部署 | Vercel | 免费，push 自动部署，链接发群即用 |
| 样式 | Tailwind CSS | 快速出雏形，移动端适配方便 |

## 页面结构

三个页面，移动端单列布局：

### 1. 行程列表页 `/`

- 已有行程以卡片列表展示（标题、目的地、日期、参与者头像）
- "创建行程"按钮 → 弹出表单（标题、目的地、日期范围）
- 创建后生成 6 位邀请码，展示在卡片上供分享
- "加入行程"→ 输入邀请码 + 自己的昵称

### 2. 地图主页 `/trip/:id`

顶部搜索框，下方地图占 55-60% 屏幕高度，下半屏 Tab 切换：

```
搜索框（高德 POI 搜索）
────────────────────
    地图区域
  ● 朋友位置
  📍 景点标记
────────────────────
[景点列表] [时间线]   ← Tab
────────────────────
  列表内容（可滚动）
```

**地图交互：**
- 定位当前用户位置，显示为彩色圆点
- 其他参与者位置显示为不同颜色圆点
- 景点以标记点展示，点击弹出信息窗（名称、地址、照片）
- 搜索结果自动缩放到视野内

**景点列表 Tab：**
- 搜索结果列表，每项含景点名、地址、缩略图
- 每个结果可"想去"→ 弹窗选择加到哪一天
- 已加入日程的景点有勾选标识

**时间线 Tab：**
- 按 Day 1 / Day 2 / … 分组
- 显示每天已选的景点列表
- 可删除某天的景点

### 3. 账单页 `/trip/:id/bills`

```
┌──────────────────────┐
│ 添加一笔开销  [+按钮]  │
├──────────────────────┤
│ 🍲 火锅  ¥320  小王   │
│ 🚕 打车   ¥45  小李   │
│ 🎫 门票  ¥120  小张   │
├──────────────────────┤
│ 总花销: ¥485         │
└──────────────────────┘
```

- 添加开销：项目名、金额、付款人（从参与者中选择）
- 列表按时间倒序
- 底部固定栏显示总花销
- 支持滑动删除一笔记录

## 数据模型

### Supabase 表结构

```sql
-- 行程
trips (
  id uuid primary key,
  title text,
  destination text,
  start_date date,
  end_date date,
  invite_code text unique,  -- 6位随机字符
  created_at timestamptz
)

-- 参与者（当前用户也作为一条记录）
participants (
  id uuid primary key,
  trip_id uuid references trips,
  nickname text,
  color text,  -- 地图上标记的颜色，随机分配
  created_at timestamptz
)

-- 景点
spots (
  id uuid primary key,
  trip_id uuid references trips,
  day_number int,  -- 1, 2, 3... null 表示收藏池
  name text,
  address text,
  lat float,
  lng float,
  poi_id text,  -- 高德 POI ID
  created_at timestamptz
)

-- 位置共享（按需更新，非实时追踪）
locations (
  id uuid primary key,
  trip_id uuid references trips,
  participant_id uuid references participants,
  lat float,
  lng float,
  updated_at timestamptz
)

-- 账单
bills (
  id uuid primary key,
  trip_id uuid references trips,
  participant_id uuid references participants,  -- 付款人
  item text,
  amount float,
  created_at timestamptz
)
```

### 前端状态（React Context）

- `TripContext`：当前行程数据、景点列表、参与者
- `MapContext`：地图实例、当前位置、标记点集合
- 行程和账单通过 Supabase 实时订阅同步

## 路由设计

| 路径 | 页面 |
|------|------|
| `/` | 行程列表 |
| `/trip/:id` | 地图主页 |
| `/trip/:id/bills` | 账单页 |

底部 Tab 栏在地图主页和账单页之间切换，行程列表为独立入口。

## 登录/身份流

1. 用户打开应用 → 行程列表页
2. 创建行程时输入自己的昵称 → 系统在 participants 表创建记录，存入 localStorage 关联
3. 生成邀请码
4. 朋友打开链接 → 点击"加入行程"→ 输入邀请码 + 昵称 → 加入成功
5. 身份通过 `localStorage` 保存 `participant_id`，无需密码

## 地图搜索流程

1. 用户在搜索框输入关键词
2. 调用高德 POI 搜索 API（`AutoSearch` 或 `PlaceSearch`），限定目的地城市范围
3. 下拉展示结果列表（景点列表 Tab）
4. 点击"想去"→ 弹窗选择 Day N → 写入 spots 表
5. 地图上对应标记更新，时间线同步刷新

## 部署与使用流程

1. 开发完成后部署到 Vercel，获得 `https://xxx.vercel.app` 地址
2. 创建者打开链接，创建行程，获得邀请码
3. 把链接 + 邀请码发到微信群
4. 朋友打开链接输入邀请码加入
5. 每个人都可以搜索景点、添加想去、记账

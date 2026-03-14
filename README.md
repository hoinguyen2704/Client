# Hozitech E-Commerce Client

> Frontend cho nền tảng thương mại điện tử Hozitech — xây dựng bằng React, TypeScript và Vite.

## 🛠️ Tech Stack

- **React 19** + **TypeScript**
- **Vite** — build tool nhanh
- **Tailwind CSS 4** — styling
- **React Router v7** — routing
- **Zustand** — state management
- **Axios** — HTTP client
- **Recharts** — biểu đồ & dashboard
- **Framer Motion** — animations
- **Lucide React** + **React Icons** — icons

## 📁 Cấu trúc dự án

```
src/
├── apis/            # API services & Axios config
├── assets/          # Static assets (images, fonts...)
├── components/      # Reusable UI components
├── helpers/         # Utility functions & constants
├── layouts/         # Page layouts
├── middlewares/     # Auth guards & route protection
├── pages/           # Page components (admin, user, public)
├── plugins/         # Third-party integrations
├── routers/         # Route definitions
├── styles/          # Global CSS & variables
├── types/           # TypeScript type definitions
├── utils/           # Utility modules
└── views/           # View components
```

## 🚀 Bắt đầu

### Yêu cầu

- **Node.js** >= 18
- **npm** >= 9

### Cài đặt

```bash
# Clone repo
git clone git@github.com:hoinguyen2704/Client.git
cd Client

# Cài dependencies
npm install

# Tạo file environment
cp .env.example .env
```

### Chạy development server

```bash
npm run dev
```

Truy cập tại: [http://localhost:3000](http://localhost:3000)

### Build production

```bash
npm run build
npm run preview
```

## 📜 Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy dev server (port 3000) |
| `npm run build` | Build production |
| `npm run preview` | Preview bản build |
| `npm run clean` | Xoá thư mục dist |
| `npm run lint` | Kiểm tra TypeScript |

## 📄 License

Private — © 2026 Hozitech

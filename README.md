# Hozitech E-Commerce Client

> Frontend của Hozitech: storefront, checkout, account, admin, chatbot và hỗ trợ đa ngôn ngữ.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- React Router v7
- Zustand
- React Query
- Axios
- i18next
- Framer Motion
- Recharts

## Cấu Trúc

```
src/
├── apis/        # Axios config và service gọi API
├── components/  # UI dùng lại
├── constants/   # Hằng số dùng chung
├── hooks/       # Custom hooks
├── locales/     # EN/VI i18n
├── routers/     # Route definitions
├── stores/      # Zustand stores
├── styles/      # Global styles
├── types/       # TypeScript types
├── utils/       # Helper functions
├── views/pages/ # Luồng client
└── views/admin/ # Luồng admin
```

## Bắt Đầu

### Yêu cầu

- Node.js >= 18
- npm >= 9

### Cài đặt

```bash
git clone <repo-url>
cd Client
npm install
```

### Chạy local

```bash
npm run dev
```

Mở: `http://localhost:3000`

### Build

```bash
npm run build
npm run preview
```

## Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production |
| `npm run preview` | Preview bản build |
| `npm run clean` | Xoá `dist` |
| `npm run lint` | TypeScript check (`tsc --noEmit`) |
| `npm run audit:react-types` | Audit type React |
| `npm run audit:slate-text` | Audit nội dung slate text |
| `npm run audit:i18n-literals` | Audit literal i18n |

## License

Private — © 2026 Hoi Nguyen

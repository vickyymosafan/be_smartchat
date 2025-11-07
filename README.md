# Express N8N Backend

Backend API tanpa database yang dibangun dengan Express.js dan TypeScript untuk meneruskan request chat dari frontend ke webhook n8n. Sistem ini dirancang dengan Clean Architecture dan prinsip SOLID, dapat berjalan lokal dan di-deploy ke Vercel sebagai serverless function.

## 🏗️ Arsitektur

Aplikasi menggunakan **Clean Architecture** dengan pemisahan layer yang jelas:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Routes, Controllers, Middlewares)     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Application Layer               │
│         (Services, Schemas)             │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Domain Layer                    │
│      (Core Interfaces)                  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│      Infrastructure Layer               │
│  (HTTP Client, Logger, Config)          │
└─────────────────────────────────────────┘
```

### Prinsip SOLID

- **Single Responsibility**: Setiap class fokus pada satu tanggung jawab
- **Open/Closed**: Mudah extend tanpa modifikasi existing code
- **Liskov Substitution**: Interface dapat diganti implementasinya
- **Interface Segregation**: Interface kecil dan fokus
- **Dependency Inversion**: Depend pada abstraksi, bukan konkret

## 📁 Struktur Folder

```
backend/
├── src/
│   ├── config/          # Konfigurasi environment variables
│   ├── core/            # Interface dan abstraksi
│   ├── infra/           # Implementasi infrastructure (HTTP, Logger)
│   ├── middlewares/     # Express middlewares (CORS, Rate Limit, Error Handler)
│   ├── routes/          # Definisi routes
│   ├── controllers/     # HTTP request/response handling
│   ├── services/        # Business logic
│   ├── schemas/         # Validasi input dengan Zod
│   └── server/          # Express app initialization
├── api/                 # Vercel serverless handler
├── dist/                # Compiled JavaScript (generated)
├── .env                 # Environment variables (local)
├── .env.example         # Template environment variables
├── package.json         # Dependencies dan scripts
├── tsconfig.json        # TypeScript configuration
└── vercel.json          # Vercel deployment configuration
```

## 🚀 Setup Lokal

### Requirements

- Node.js 20 atau lebih tinggi
- npm atau yarn

### Langkah-langkah

1. **Clone repository dan masuk ke folder backend**

```bash
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
cp .env.example .env
```

Edit file `.env` dan isi dengan values yang sesuai:

```env
# N8n Webhook Configuration
N8N_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/xxx/chat

# Frontend Origins (comma-separated)
FRONTEND_ORIGINS=http://localhost:3000,http://localhost:5173

# Server Configuration
PORT=3001
N8N_TIMEOUT_MS=15000

# Logging
LOG_LEVEL=info

# Environment
NODE_ENV=development
```

4. **Jalankan development server**

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3001`

5. **Build untuk production**

```bash
npm run build
```

6. **Jalankan production build**

```bash
npm start
```

## 🌐 Deployment ke Vercel

### Requirements

- Akun Vercel
- Repository sudah di-push ke GitHub/GitLab/Bitbucket

### Langkah-langkah

1. **Login ke Vercel Dashboard**

Buka [vercel.com](https://vercel.com) dan login

2. **Import Project**

- Klik "Add New Project"
- Pilih repository Anda
- Set **Root Directory** ke `backend`

3. **Configure Build Settings**

Vercel akan otomatis detect settings, tapi pastikan:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

4. **Set Environment Variables**

Di Vercel Dashboard, tambahkan environment variables:

```
N8N_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/xxx/chat
FRONTEND_ORIGINS=https://your-frontend.vercel.app,https://www.yourdomain.com
N8N_TIMEOUT_MS=15000
LOG_LEVEL=info
NODE_ENV=production
```

5. **Deploy**

Klik "Deploy" dan tunggu proses selesai

6. **Test Deployment**

Setelah deploy sukses, test endpoint:

```bash
curl https://your-backend.vercel.app/health
```

## 📡 API Endpoints

### Health Check

**GET** `/health`

Cek status kesehatan server

**Response:**

```json
{
  "ok": true,
  "uptime": 123.45
}
```

### Chat

**POST** `/api/chat`

Forward pesan chat ke n8n webhook

**Request Body:**

```json
{
  "message": "Hello, this is a test message",
  "userId": "user-123",
  "metadata": {
    "source": "web",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

**Response (Success):**

```json
{
  "ok": true,
  "data": {
    // Response dari n8n webhook
  }
}
```

**Response (Error):**

```json
{
  "ok": false,
  "code": "VALIDATION_ERROR",
  "message": "Message tidak boleh kosong",
  "details": [
    {
      "path": ["message"],
      "message": "Message tidak boleh kosong"
    }
  ]
}
```

## 🧪 Testing

### Manual Testing dengan Script

Untuk Windows (PowerShell):

```powershell
.\test-endpoints.ps1
```

Untuk Linux/Mac (Bash):

```bash
chmod +x test-endpoints.sh
./test-endpoints.sh
```

### Manual Testing dengan curl

**Test Health Check:**

```bash
curl http://localhost:3001/health
```

**Test Chat dengan Valid Payload:**

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "message": "Hello, this is a test",
    "userId": "test-user-123"
  }'
```

**Test Chat dengan Invalid Payload:**

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "message": ""
  }'
```

## 🔒 Security Features

### CORS Protection

- Whitelist specific origins dari environment variable
- Tidak menggunakan wildcard (*)
- Support credentials untuk cookies

### Rate Limiting

- Maksimal 60 requests per menit per IP
- Mencegah brute force dan DDoS
- In-memory store (reset on restart)

### Input Validation

- Validasi semua input dengan Zod schema
- Size limit 1MB untuk request body
- Sanitize error messages (no stack trace di production)

### Security Headers

- Helmet middleware untuk security headers
- Disable x-powered-by header
- Content-Type validation

## 🔄 Retry Mechanism

Request ke n8n webhook menggunakan retry logic:

- **Maksimal 2 retry** untuk network errors atau 5xx responses
- **Exponential backoff**: 2s, 4s
- **Tidak retry** untuk 4xx errors (client errors)

## 📝 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `N8N_WEBHOOK_URL` | ✅ Yes | - | URL webhook n8n untuk forward chat |
| `FRONTEND_ORIGINS` | ✅ Yes | - | Daftar origin yang diizinkan (CSV) |
| `PORT` | ❌ No | 3001 | Port untuk local development |
| `N8N_TIMEOUT_MS` | ❌ No | 15000 | Timeout request ke n8n (ms) |
| `LOG_LEVEL` | ❌ No | info | Level logging (error, warn, info, debug) |
| `NODE_ENV` | ❌ No | development | Environment (development, production) |

## 🐛 Troubleshooting

### Port sudah digunakan

```
Error: Port 3001 sudah digunakan
```

**Solusi**: Ubah PORT di `.env` atau stop aplikasi yang menggunakan port tersebut

### CORS Error

```
Error: Origin tidak diizinkan oleh CORS policy
```

**Solusi**: Tambahkan origin frontend ke `FRONTEND_ORIGINS` di `.env`

### N8N Webhook Error

```
Error: Request ke n8n gagal
```

**Solusi**: 
- Pastikan `N8N_WEBHOOK_URL` benar
- Cek n8n workflow sudah aktif
- Cek network connectivity

### Rate Limit Exceeded

```
Error: Terlalu banyak request, coba lagi nanti
```

**Solusi**: Tunggu 60 detik atau kurangi frekuensi request

## 📚 Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js 5
- **Language**: TypeScript 5
- **Validation**: Zod
- **HTTP Client**: Axios
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Morgan
- **Deployment**: Vercel (Serverless)

## 🤝 Contributing

Untuk kontribusi:

1. Pastikan semua komentar dalam bahasa Indonesia
2. Pastikan semua error messages dalam bahasa Indonesia
3. Follow Clean Architecture dan SOLID principles
4. Tambahkan tests jika menambah fitur baru
5. Update dokumentasi jika diperlukan

## 📄 License

MIT License - lihat file LICENSE untuk detail

## 👨‍💻 Author

Developed with ❤️ using Clean Architecture and SOLID principles

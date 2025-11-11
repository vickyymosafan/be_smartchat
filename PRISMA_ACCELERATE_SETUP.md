# Prisma Accelerate Setup Guide

## Overview
Backend ini menggunakan Prisma Accelerate untuk:
- Connection pooling di serverless environment
- Query caching dengan TTL
- Edge runtime compatibility
- Global database access

## Prerequisites
- Prisma Accelerate API key (sudah ada di `.env`)
- PostgreSQL database (Supabase)
- Node.js >= 20.0.0

## Installation

Semua dependencies sudah terinstall:
```bash
npm install @prisma/client@latest @prisma/extension-accelerate
```

## Generate Prisma Client

**PENTING:** Gunakan flag `--no-engine` untuk Accelerate:

```bash
npm run prisma:generate
# atau
npx prisma generate --no-engine
```

Flag `--no-engine` diperlukan karena:
- Accelerate tidak memerlukan query engine lokal
- Semua query diproses melalui Accelerate API
- Menghasilkan client yang lebih kecil dan edge-compatible

## Environment Variables

File `.env` harus memiliki:

```env
# Prisma Accelerate connection string
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"

# Direct database URL (untuk migrations)
DIRECT_URL="postgresql://user:password@host:5432/database"
```

## Cache Configuration

Cache strategies sudah dikonfigurasi di `src/infra/db/cache-config.ts`:

```typescript
// Session data - 30 detik cache
CACHE_STRATEGIES.SESSION

// Message history - 60 detik cache
CACHE_STRATEGIES.MESSAGES

// Chat history - 60 detik cache
CACHE_STRATEGIES.CHAT_HISTORY
```

## Usage Example

### Query dengan caching:

```typescript
// Otomatis menggunakan cache strategy yang sudah dikonfigurasi
const session = await sessionRepository.findBySessionId(sessionId);

// Messages dengan cache 60 detik
const messages = await messageRepository.findBySessionId(sessionId);
```

### Custom cache strategy:

```typescript
import { createCacheStrategy } from '../infra/db/cache-config';

const data = await prisma.model.findMany({
  cacheStrategy: createCacheStrategy(120, 30), // 120s TTL, 30s SWR
});
```

## Development Workflow

1. **Modify schema:**
   ```bash
   # Edit prisma/schema.prisma
   ```

2. **Generate client:**
   ```bash
   npm run prisma:generate
   ```

3. **Push changes to database:**
   ```bash
   npm run db:push
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

## Production Deployment

### Vercel

Build command sudah dikonfigurasi:
```bash
npm run vercel-build
```

Ini akan:
1. Generate Prisma Client dengan `--no-engine`
2. Compile TypeScript

### Environment Variables di Vercel

Set di Vercel dashboard:
- `DATABASE_URL` - Accelerate connection string
- `DIRECT_URL` - Direct database URL
- `N8N_WEBHOOK_URL`
- `FRONTEND_ORIGINS`

## Troubleshooting

### Error: "Cannot find module '@prisma/client'"

Solution:
```bash
npm run prisma:generate
```

### Error: "PrismaClient is unable to run in this browser environment"

Pastikan menggunakan `--no-engine` flag:
```bash
npx prisma generate --no-engine
```

### Cache tidak bekerja

Periksa:
1. DATABASE_URL menggunakan `prisma://` protocol
2. API key valid
3. Cache strategy sudah ditambahkan ke query

## Cache Strategy Guidelines

| Data Type | TTL | Reasoning |
|-----------|-----|-----------|
| Session | 30s | Changes frequently with user activity |
| Messages | 60s | Append-only, rarely changes |
| Chat History | 60s | Rarely modified after creation |
| Health Check | 5s | Quick validation |

## Performance Benefits

Dengan Accelerate:
- ✅ Cold start < 100ms (vs 2-3s tanpa Accelerate)
- ✅ Query latency < 50ms (dengan cache hit)
- ✅ No connection pool exhaustion
- ✅ Global CDN caching

## Monitoring

Accelerate dashboard: https://console.prisma.io/

Monitor:
- Cache hit rate
- Query performance
- Connection usage
- API usage

## References

- [Prisma Accelerate Docs](https://www.prisma.io/docs/accelerate)
- [Edge Runtime Guide](https://www.prisma.io/docs/accelerate/getting-started)
- [Caching Strategies](https://www.prisma.io/docs/accelerate/caching)

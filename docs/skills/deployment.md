# Skill: Deployment (All-in VPS)

**Context:** Ludes deploys entirely on one VPS (43.129.58.137). Frontend static files + Hono backend behind nginx reverse proxy. SSL via certbot/Let's Encrypt. LLM endpoint is local (Tailscale network).

## Key Rules

1. All-in-one VPS. No Vercel, no separate frontend hosting.
2. nginx serves frontend static + proxies `/api/*` to Hono on port 3001.
3. SSL certificate via certbot (Let's Encrypt).
4. Backend runs via PM2 or systemd for process management.
5. LLM endpoint reachable because VPS is on same Tailscale network.
6. Frontend build output goes to `apps/web/dist/`.

## Infrastructure

```
Internet → ludes.camuscleansheet.com (A record → 43.129.58.137)
                │
                ▼
           nginx (port 80 → 301 → 443)
                │
          ┌─────┴─────┐
          │           │
     Static files   /api/*
     (Vite build)   proxy_pass
          │           │
          │      localhost:3001
          │           │
          │       Hono (Node.js)
          │           │
          │     ┌─────┼─────┐
          │     │     │     │
          │  Supabase 9router
          │  (cloud)  (local)
```

## Deployment Steps

### 1. Build

```bash
cd /home/ubuntu/ludes
pnpm install
pnpm build
```

Frontend outputs to `apps/web/dist/`.
Backend outputs to `apps/api/dist/`.

### 2. SSL Certificate (First Time)

```bash
sudo certbot --nginx -d ludes.camuscleansheet.com
```

### 3. Nginx Config

File: `/etc/nginx/sites-available/ludes.camuscleansheet.com`

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name ludes.camuscleansheet.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name ludes.camuscleansheet.com;

    ssl_certificate /etc/letsencrypt/live/ludes.camuscleansheet.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ludes.camuscleansheet.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Frontend static files
    root /home/ubuntu/ludes/apps/web/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support (future)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # File upload size limit (for food photos)
    client_max_body_size 10M;
}
```

### 4. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/ludes.camuscleansheet.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Backend Process (PM2)

```bash
cd /home/ubuntu/ludes/apps/api
pm2 start "node dist/index.js" --name ludes-api
pm2 save
pm2 startup  # if not already configured
```

Or systemd service:

```ini
# /etc/systemd/system/ludes-api.service
[Unit]
Description=Ludes API Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/ludes/apps/api
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable ludes-api
sudo systemctl start ludes-api
```

### 6. Environment Variables (Production)

Backend `.env`:
```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://sduynedhiwwsqkfsydyx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<set in server>
SUPABASE_JWKS_URL=https://sduynedhiwwsqkfsydyx.supabase.co/auth/v1/.well-known/jwks.json
LLM_API_BASE_URL=http://127.0.0.1:20128/v1
LLM_API_KEY=<set in server>
LLM_MODEL=cheapest
CORS_ORIGIN=https://ludes.camuscleansheet.com
```

## Redeploy (After Code Changes)

```bash
cd /home/ubuntu/ludes
pnpm build
pm2 restart ludes-api
# Frontend: nginx auto-serves updated static files
# Backend: PM2 restarts with new code
```

## Verification Checklist

- [ ] `https://ludes.camuscleansheet.com` loads frontend
- [ ] SSL padlock icon visible
- [ ] `https://ludes.camuscleansheet.com/api/auth/me` returns 401
- [ ] Register flow works end-to-end
- [ ] Login flow works
- [ ] AI listing generation works (calls 9router endpoint)
- [ ] Food browse works
- [ ] WA order link works

## Related Files

- `apps/web/vite.config.ts` — frontend build config
- `apps/api/src/index.ts` — Hono app entry
- `/etc/nginx/sites-available/ludes.camuscleansheet.com` — nginx config

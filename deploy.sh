#!/bin/bash

# Deploy script untuk Camp Bebas Riba Indonesia
# Tested di Ubuntu/Debian VPS

set -e

echo "=== Camp Bebas Riba - Deploy Script ==="
echo ""

# Input dari user
read -p "Domain atau IP VPS: " DOMAIN
read -p "MySQL root password: " MYSQL_PASS
read -p "JWT Secret (random string): " JWT_SECRET
read -p "Google Client ID: " GOOGLE_CLIENT_ID
read -p "Brevo SMTP Login [92826b001@smtp-brevo.com]: " SMTP_USER
SMTP_USER=${SMTP_USER:-92826b001@smtp-brevo.com}
read -s -p "Brevo SMTP Key: " SMTP_PASS
echo ""
read -s -p "Brevo API Key: " BREVO_API_KEY
echo ""
read -p "SMTP From email: " SMTP_FROM_EMAIL
read -p "R2 Endpoint (https://<accountid>.r2.cloudflarestorage.com): " R2_ENDPOINT
read -p "R2 Access Key ID: " R2_ACCESS_KEY_ID
read -s -p "R2 Secret Access Key: " R2_SECRET_ACCESS_KEY
echo ""
read -p "R2 Bucket name [campbebasriba-uploads]: " R2_BUCKET
R2_BUCKET=${R2_BUCKET:-campbebasriba-uploads}
read -p "R2 Public URL (https://pub-<hash>.r2.dev): " R2_PUBLIC_URL

# Install dependencies
echo ""
echo ">>> Installing Node.js, Nginx, MySQL..."
apt update && apt upgrade -y
apt install -y curl nginx mysql-server certbot python3-certbot-nginx

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Setup MySQL
echo ""
echo ">>> Setting up MySQL database..."
mysql -u root -p"$MYSQL_PASS" -e "CREATE DATABASE IF NOT EXISTS campbebasriba;"

# Create .env file
echo ""
echo ">>> Creating .env file..."
cat > .env << EOF
DATABASE_URL="mysql://root:${MYSQL_PASS}@localhost:3306/campbebasriba"
JWT_SECRET="${JWT_SECRET}"
PORT=4000
VITE_API_URL="http://${DOMAIN}/api"
APP_URL="http://${DOMAIN}"
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID}"
VITE_GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID}"
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_TLS_REJECT_UNAUTHORIZED=false
SMTP_USER="${SMTP_USER}"
SMTP_PASS="${SMTP_PASS}"
SMTP_FROM="Camp Bebas Riba <${SMTP_FROM_EMAIL}>"
BREVO_API_KEY="${BREVO_API_KEY}"
R2_ENDPOINT="${R2_ENDPOINT}"
R2_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID}"
R2_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY}"
R2_BUCKET="${R2_BUCKET}"
R2_PUBLIC_URL="${R2_PUBLIC_URL}"
EOF

# Install project dependencies
echo ""
echo ">>> Installing project dependencies..."
npm install

# Generate Prisma client
echo ""
echo ">>> Generating Prisma client..."
npx prisma generate

# Run migrations
echo ""
echo ">>> Running database migrations..."
npx prisma migrate deploy

# Seed admin user
echo ""
echo ">>> Seeding admin user..."
npx tsx server/seed-admin.ts

# Build frontend
echo ""
echo ">>> Building frontend..."
npm run build

# Setup Nginx
echo ""
echo ">>> Configuring Nginx..."
cat > /etc/nginx/sites-available/cbr << EOF
server {
    listen 80;
    server_name ${DOMAIN};

    root /var/www/cbr/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/cbr /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Start backend with PM2
echo ""
echo ">>> Starting backend server..."
pm2 delete cbr-api 2>/dev/null || true
pm2 start server/index.ts --name cbr-api --interpreter tsx
pm2 save

# Setup PM2 startup
pm2 startup systemd -u root --hp /root

# Setup SSL (optional)
echo ""
read -p "Setup SSL dengan Certbot? (y/n): " SETUP_SSL
if [ "$SETUP_SSL" = "y" ]; then
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@"$DOMAIN"
fi

echo ""
echo "=== Deploy Selesai! ==="
echo ""
echo "Backend:  pm2 logs cbr-api"
echo "Status:   pm2 status"
echo "Restart:  pm2 restart cbr-api"
echo ""
echo "Admin login:"
echo "  Email:    cbradmin2026@gmail.com"
echo "  Password: Admin@CBR2026"

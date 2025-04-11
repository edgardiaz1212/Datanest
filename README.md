# Movement Colocation Management System

## Project Overview
Web application for managing equipment colocation with:
- Equipment tracking (RackDetails, EquipmentDetails components)
- PDF document handling
- User management system
- Data visualization tables

## System Architecture
**Frontend:**
- React.js with Webpack
- State management via Flux
- Component-based UI

**Backend:**
- Flask REST API
- SQLAlchemy ORM
- JWT Authentication

## Development Setup
### Prerequisites
- Python 3.10+
- Node.js 14+
- PostgreSQL

### Installation
1. Clone repository
2. Backend:
   ```bash
   pipenv install
   cp .env.example .env
   pipenv run init
   pipenv run migrate
   pipenv run upgrade
   pipenv run start
   ```
3. Frontend:
   ```bash
   npm install
   npm run start
   ```

## Production Deployment (Debian)
### Requirements
- Nginx
- Supervisor
- PostgreSQL
- Python 3.10
- Node.js 14+

### Steps
1. Install dependencies:
   ```bash
   sudo apt update
   sudo apt install -y nginx supervisor postgresql python3.10 nodejs
   ```

2. Configure PostgreSQL:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE colocation;
   CREATE USER colocation_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE colocation TO colocation_user;
   ```

3. Set up application:
   ```bash
   git clone https://github.com/your-repo/movementColocationPageV2.git
   cd movementColocationPageV2
   pipenv install --deploy
   npm install --production
   npm run build
   ```

4. Configure Nginx:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           root /path/to/movementColocationPageV2/public;
           try_files $uri /index.html;
       }

       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
       }
   }
   ```

5. Configure Supervisor:
   ```ini
   [program:colocation_api]
   command=pipenv run gunicorn -w 4 -b 127.0.0.1:5000 src.app:app
   directory=/path/to/movementColocationPageV2
   user=www-data
   autostart=true
   autorestart=true
   ```

## API Documentation
Key endpoints:
- `/api/racks` - Rack management
- `/api/equipment` - Equipment tracking
- `/api/users` - User administration

## Maintenance
### Backup
```bash
pg_dump -U colocation_user -h localhost colocation > backup.sql
```

### Updates
1. Pull latest changes
2. Run migrations if needed
3. Restart services:
   ```bash
   sudo supervisorctl restart colocation_api
   sudo systemctl restart nginx
   ```

## Troubleshooting
- Check logs:
  ```bash
  journalctl -u nginx -f
  sudo supervisorctl tail colocation_api stderr
  ```

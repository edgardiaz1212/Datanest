DATAnest
Project Overview
Web application for managing equipment colocation with:

Equipment tracking (RackDetails, EquipmentDetails components)
PDF document handling
User management system
Data visualization tables
Features
This project includes the following key functionalities:

User Authentication and Management: Secure login, registration, profile update, and password management.
Equipment Management: Add, edit, delete racks and equipment, with detailed descriptions.
Aires (Air Conditioning Units): Manage air conditioning units including adding, updating, deleting, and fetching details.
Umbrales (Thresholds): Define and manage environmental thresholds for temperature and humidity, with notifications.
Otros Equipos (Other Equipment): Manage other types of equipment with full CRUD operations.
Mantenimientos (Maintenance): Track maintenance records for equipment, including image uploads and deletions.
Lecturas (Readings): Record and manage environmental readings such as temperature and humidity.
Estadisticas (Statistics): View general and specific statistics, including dashboard summaries and detailed charts.
Tracker User Management: Special user roles for tracking with login, registration, and administrative user management.
System Architecture
Frontend:

React.js with Webpack
State management via Flux
Component-based UI
Backend:

Flask REST API
SQLAlchemy ORM
JWT Authentication
Development Setup
Prerequisites
Python 3.10+
Node.js 14+
PostgreSQL
Installation
Clone repository
Backend:
pipenv install
cp .env.example .env
pipenv run init
pipenv run migrate
pipenv run upgrade
pipenv run start
Frontend:
npm install
npm run start
Production Deployment (Debian)
Requirements
Nginx
Supervisor
PostgreSQL
Python 3.10
Node.js 14+
Steps
Install dependencies:

sudo apt update
sudo apt install -y nginx supervisor postgresql python3.10 nodejs
Configure PostgreSQL:

sudo -u postgres psql
CREATE DATABASE datanest;
CREATE USER datanest_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE datanest TO datanest_user;
Set up application:

git clone https://github.com/your-repo/datanest.git
cd datanest
pipenv install --deploy
npm install --production
npm run build
Configure Nginx:

server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/datanest/public;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }
}
Configure Supervisor:

[program:datanest_api]
command=pipenv run gunicorn -w 4 -b 127.0.0.1:5000 src.app:app
directory=/path/to/datanest
user=www-data
autostart=true
autorestart=true
API Documentation
Key endpoints:

/api/racks - Rack management
/api/equipment - Equipment tracking
/api/users - User administration
Maintenance
Backup
pg_dump -U datanest_user -h localhost datanest > backup.sql
Updates
Pull latest changes
Run migrations if needed
Restart services:
sudo supervisorctl restart datanest_api
sudo systemctl restart nginx
Troubleshooting
Check logs:
journalctl -u nginx -f
sudo supervisorctl tail datanest_api stderr
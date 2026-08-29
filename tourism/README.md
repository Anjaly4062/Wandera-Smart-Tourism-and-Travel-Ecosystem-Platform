# Wandera - Smart Tourism Web Platform

Wandera is a comprehensive smart tourism web application designed to connect tourists with destinations, local service providers (hotels, restaurants, transportation, activities), and customized multi-service travel itineraries.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), React Router, Axios, CSS3
- **Backend**: Python, Django, Django REST Framework, Django CORS Headers
- **Database**: MySQL
- **Authentication**: Role-based access (Tourists, Service Providers, Admin)

---

## 📁 Project Structure

```text
├── backend/
│   ├── backend/             # Django core project configuration (settings, urls, wsgi)
│   ├── tourism/             # Main tourism app (models, views, serializers, migrations)
│   ├── manage.py            # Django CLI management script
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Template for backend environment variables
│   └── media/               # Uploaded media files (ignored by Git)
├── frontend/
│   ├── src/                 # React source code (Components, Pages, Services, styles)
│   ├── public/              # Static assets
│   ├── package.json         # Node.js dependencies & scripts
│   ├── .env.example         # Template for frontend environment variables
│   └── vite.config.js       # Vite configuration
├── requirements.txt         # Root Python dependencies
├── .env.example             # Root environment template
└── .gitignore               # Git ignore rules for public repository safety
```

---

## 🚀 Getting Started Locally

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- MySQL Server (running locally or remotely)

---

### 1. Backend Setup (Django)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - On Windows (PowerShell):
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - On macOS/Linux:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your local MySQL database credentials and settings:
   ```env
   DJANGO_SECRET_KEY=your-local-secret-key
   DJANGO_DEBUG=True
   DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

   DB_ENGINE=django.db.backends.mysql
   DB_NAME=wanderadb
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   DB_PORT=3306

   CORS_ALLOWED_ORIGINS=http://localhost:5173
   ```

5. **Create MySQL Database & Apply Migrations**:
   Ensure your MySQL database (e.g. `wanderadb`) exists, then run:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Start the Django Development Server**:
   ```bash
   python manage.py runserver
   ```
   The backend API will run at `http://127.0.0.1:8000/`.

---

### 2. Frontend Setup (React + Vite)

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **(Optional) Configure Frontend Environment**:
   Copy `.env.example` to `.env` if custom API base URL is needed:
   ```bash
   cp .env.example .env
   ```

4. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   The frontend application will be accessible at `http://localhost:5173/`.

---

## 🔒 Security & Environment Configuration

- **Never commit `.env` files**: All local secrets, passwords, tokens, and database credentials are kept exclusively in `.env`, which is strictly ignored by Git.
- **Templates**: Always use `.env.example` for environment variable templates with placeholder values only.
- **Uploaded Media**: User-uploaded media in `backend/media/` is excluded from version control to prevent repository bloat and data leakage.

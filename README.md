# SkillSwap Platform

A peer-to-peer skill exchange platform where users offer skills they have and request skills they want to learn — completely free!

## 🚀 One-Command Setup

**Requirements:** Just Python 3.8+ installed

### Fresh Laptop Setup
```bash
git clone https://github.com/yourusername/skillswap-platform.git
cd skillswap-platform
python start.py
```

That's it! 🎉

## 📱 Access After Setup

- **Frontend**: http://localhost:8000/
- **Backend API**: http://127.0.0.1:8001/api/
- **Django Admin**: http://127.0.0.1:8001/admin/

## 👤 Default Login

- **Email**: admin@skillswap.com
- **Password**: admin123

## ✨ Features

- 🔐 User authentication & profiles
- 🔍 Browse and search users by skills
- 💬 Send skill swap requests
- 📱 Real-time notifications
- 👨‍💼 Admin dashboard
- 📊 Platform statistics

## 🛠️ Manual Setup (If Needed)

```bash
# Clone repository
git clone https://github.com/yourusername/skillswap-platform.git
cd skillswap-platform

# Setup backend
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
pip install -r requirements_simple.txt
python setup.py

# Mac/Linux
source venv/bin/activate
pip install -r requirements_simple.txt
python setup.py
```

## 🏗️ Tech Stack

- **Backend**: Django + Django REST Framework
- **Frontend**: React (CDN) + Tailwind CSS
- **Database**: SQLite
- **Auth**: JWT tokens

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup/` | Register user |
| POST | `/api/auth/login/` | User login |
| GET | `/api/users/` | Browse users |
| POST | `/api/requests/` | Create swap request |
| GET | `/api/notifications/` | Get notifications |

## 🚨 Troubleshooting

**Port in use?**
```bash
cd backend
python manage.py runserver 8002
```

**Database issues?**
```bash
cd backend
rm db.sqlite3
python manage.py migrate
python seed_database.py
```

**Frontend not loading?**
- Clear browser cache (Ctrl+F5)
- Check both servers are running

## 📄 License

MIT License - Free to use and modify!

---

**Made with ❤️ for skill sharing**

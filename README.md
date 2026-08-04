# MAGIC Youth Digital Platform

A complete dynamic organization management platform for **MAGIC Youth** at Andhra Loyola Institute of Engineering and Technology, Vijayawada.

---

## ✨ Features

- **Public website** with Events, Gallery, Programs, Documents archive, Timeline/Journey
- **Admin dashboard** for managing all content without touching source code
- **Session-based authentication** with bcrypt-encrypted passwords
- **SQLite database** — portable, zero configuration required
- **File uploads** for event posters, gallery photos, PDFs, team photos
- **Activity Timeline** — full organizational history archive

---

## 🚀 Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org) v18 or higher
- npm (comes with Node.js)

### Steps

```bash
# 1. Navigate to the project folder
cd "path/to/magicyouth-main"

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

The server will start at **http://localhost:3000**

---

## 🔐 Admin Access

| URL | Purpose |
|-----|---------|
| `http://localhost:3000` | Public website |
| `http://localhost:3000/admin/login.html` | Admin login |
| `http://localhost:3000/admin/dashboard.html` | Admin dashboard |

### Default Credentials

```
Username: admin
Password: MagicYouth@2025
```

> ⚠️ **IMPORTANT**: Change the password immediately after first login!
> Go to Dashboard → Change Password section

---

## 📁 Project Structure

```
magicyouth-main/
├── server.js              ← Main server (start here)
├── package.json
├── database/
│   └── db.js              ← SQLite setup & schema
├── middleware/
│   └── auth.js            ← Session authentication guards
├── routes/
│   ├── auth.js            ← Login/logout/password
│   ├── events.js          ← Events CRUD API
│   ├── gallery.js         ← Gallery CRUD API
│   ├── documents.js       ← Documents CRUD API
│   ├── team.js            ← Team members CRUD API
│   ├── announcements.js   ← Announcements CRUD API
│   ├── timeline.js        ← Timeline/history API
│   └── contact.js         ← Contact form handler
├── admin/
│   ├── login.html         ← Admin login page
│   ├── dashboard.html     ← Main dashboard
│   ├── events.html        ← Manage events
│   ├── gallery.html       ← Manage gallery
│   ├── documents.html     ← Manage documents
│   ├── team.html          ← Manage team members
│   ├── announcements.html ← Manage announcements
│   ├── timeline.html      ← Manage activity timeline
│   ├── admin.js           ← Shared admin utilities
│   └── _sidebar.html      ← Sidebar component
├── uploads/               ← All uploaded files (auto-created)
│   ├── events/            ← Event poster images
│   ├── gallery/           ← Event photo galleries
│   ├── documents/         ← PDFs and documents
│   └── team/              ← Team member photos
├── data/                  ← Database files (auto-created)
│   ├── magicyouth.db      ← Main SQLite database
│   └── sessions.db        ← Session storage
├── index.html             ← Homepage
├── events.html            ← Public events page
├── gallery.html           ← Public gallery page
├── documents.html         ← Public documents archive
├── timeline.html          ← Public journey/timeline page
├── about.html
├── mission.html
├── programs.html
├── contact.html
└── JoinMagic.html
```

---

## 🔑 Changing Admin Password

**Method 1: Via Dashboard (Recommended)**
1. Login to admin panel
2. Go to Dashboard
3. Scroll to "Change Password" section
4. Enter current password and new password
5. Click "Update Password"

**Method 2: Via API**
```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"MagicYouth@2025","newPassword":"YourNewSecurePassword"}'
```

---

## 💾 Taking a Backup

### Backup the Database
```bash
# Copy the database file — that's all you need!
copy "data\magicyouth.db" "backup\magicyouth_backup_YYYY-MM-DD.db"
```

### Backup Uploaded Files
```bash
# Copy the entire uploads folder
xcopy "uploads" "backup\uploads_backup_YYYY-MM-DD" /E /I
```

### Full Backup (Windows)
```powershell
$date = Get-Date -Format "yyyy-MM-dd"
New-Item -ItemType Directory -Path "backup\$date" -Force
Copy-Item "data\magicyouth.db" "backup\$date\"
Copy-Item "uploads" "backup\$date\uploads" -Recurse
Write-Host "Backup complete: backup\$date"
```

---

## 🔄 Restoring from Backup

```bash
# Stop the server first, then:
copy "backup\magicyouth_backup_2025-01-01.db" "data\magicyouth.db"
xcopy "backup\uploads_backup_2025-01-01" "uploads" /E /I /Y
# Restart the server
npm start
```

---

## 🌐 Deploying to Production

### Environment Variables (optional)

Create a `.env` file:
```env
PORT=3000
SESSION_SECRET=your-very-long-secret-key-here
```

### Recommended Hosting
- **Railway** — free tier, supports Node.js
- **Render** — free tier with persistent disk
- **VPS (Ubuntu)** — full control with PM2 process manager

### Running with PM2 (Production)
```bash
npm install -g pm2
pm2 start server.js --name "magic-youth"
pm2 startup  # Auto-start on system reboot
pm2 save
```

---

## 📊 API Reference

All APIs return `{ success: true/false, data: {...}, message: "..." }`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | No | Admin login |
| `/api/auth/logout` | POST | Yes | Logout |
| `/api/auth/status` | GET | No | Check login status |
| `/api/auth/change-password` | POST | Yes | Change password |
| `/api/events` | GET | No | List all events |
| `/api/events` | POST | Yes | Create event |
| `/api/events/:id` | PUT | Yes | Update event |
| `/api/events/:id` | DELETE | Yes | Delete event |
| `/api/gallery` | GET | No | List photos |
| `/api/gallery/albums` | GET | No | List albums |
| `/api/gallery` | POST | Yes | Upload photos |
| `/api/documents` | GET | No | List documents |
| `/api/documents` | POST | Yes | Upload document |
| `/api/team` | GET | No | List team members |
| `/api/team/current` | GET | No | Current team only |
| `/api/team` | POST | Yes | Add team member |
| `/api/announcements` | GET | No | Active announcements |
| `/api/timeline` | GET | No | Activity timeline |
| `/api/stats` | GET | Yes | Dashboard statistics |

---

## 🔮 Future Enhancements (Planned)

The codebase is structured for easy addition of:

- [ ] Member registration portal
- [ ] Volunteer management system
- [ ] Event registration & ticketing
- [ ] QR-based attendance tracking
- [ ] Certificate generation (PDF)
- [ ] Email notification system
- [ ] Analytics dashboard
- [ ] Membership database
- [ ] Multi-admin support with roles

---

## 👥 Team Year Archives

MAGIC Youth leadership archives are maintained automatically.
- When adding a new team, set `is_current = 1` for new members
- Old team members can be archived (set `is_current = 0`) without deletion
- Filter by academic year (e.g., `2025-26`) to view any year's team

---

## 🛠️ For Future Technical Teams

1. **Read this README fully** before making changes
2. **Never delete the `data/` folder** — it contains all your data
3. **Always backup before updates** to the server or database
4. **The admin password is stored encrypted** — it cannot be read, only reset
5. **Add new features as new route files** in `routes/` — don't modify existing ones
6. **API pattern**: All routes follow the same pattern — refer to `routes/events.js` as a template

---

*Built with ❤️ for MAGIC Youth — Andhra Loyola Institute of Engineering and Technology*

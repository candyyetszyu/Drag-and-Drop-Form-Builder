# 🚀 Simplified Marketing Campaign Form Builder

## Quick Start (2 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
npm start
# OR
node simple-server.js
```

### 3. Open Form Builder
```
http://localhost:3001/form-builder.html
```

### 4. Test System
```bash
node test-system.js
```

## ✨ Features

- ✅ **Drag-and-Drop Form Builder** - Intuitive interface
- ✅ **Automatic Link Generation** - Get shareable URLs instantly
- ✅ **Multiple Field Types** - Text, dropdown, file upload
- ✅ **Form Preview** - Test before saving
- ✅ **In-Memory Storage** - No database setup required
- ✅ **Responsive Design** - Works on all devices

## 🎯 Perfect For

- Quick prototypes
- Small teams
- Internal tools
- Event registration
- Contact forms
- Simple surveys

## 📝 How It Works

1. **Create** forms with drag-and-drop interface
2. **Get** automatic shareable link: `http://localhost:3001/form/[ID]`
3. **Share** link with your audience
4. **Collect** responses automatically

## 🔧 API Endpoints

- `GET /api/health` - Server status
- `GET /api/forms` - List all forms
- `POST /api/forms` - Create new form (returns shareUrl)
- `POST /api/forms/:id/submit` - Submit form data
- `GET /form/:id` - Access form via generated link

## 🚀 Ready to Go!

No database, no complex setup - just install and start building forms!

---

For advanced features (themes, database, authentication), see the enhanced version in `../enhanced/` 
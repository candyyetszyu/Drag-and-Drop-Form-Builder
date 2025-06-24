# 🚀 Enhanced Marketing Campaign Form Builder

## Full-Featured Version with Advanced Capabilities

## Quick Start (10 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup (Optional)
```bash
# MySQL setup (optional - will fallback to in-memory)
npm run init-db
```

### 3. Environment Configuration
```bash
# Copy and edit environment file
cp .env.example .env
# Edit .env with your settings
```

### 4. Start Server
```bash
npm start
# OR
node enhanced-server.js
```

### 5. Login & Create Forms
- Visit: `http://localhost:3001/form-builder.html`
- Login: `admin` / `admin123`

### 6. Test System
```bash
node test-enhanced-system.js
```

## ✨ Enhanced Features

### 🔐 **Authentication System**
- JWT token authentication
- Session management
- Role-based access (Admin/User)
- User registration system

### 🎨 **Theme Customization**
- **5 Built-in Themes**: Professional Blue, Modern Green, Elegant Purple, Warm Orange, Dark Mode
- Custom theme creation
- Real-time theme preview

### 🔄 **Conditional Logic**
- Dynamic field visibility
- Smart form flows
- Conditional validation
- Message triggers

### 🗄️ **Database Integration**
- MySQL support with automatic fallback
- Schema management
- Data analytics and tracking

### 🔗 **Advanced Features**
- Automatic link generation (like simplified version)
- File upload support
- Form analytics
- Admin user management

## 🎯 Perfect For

- Enterprise applications
- Client projects
- Complex surveys
- Multi-tenant systems
- Production applications
- Marketing campaigns

## 🎨 Using Themes

```javascript
// When creating a form
{
  "title": "Themed Survey",
  "theme": {
    "id": "elegant",
    "name": "Elegant Purple",
    "primaryColor": "#7c3aed",
    // ... more theme properties
  },
  "fields": [...]
}
```

## 🔄 Conditional Logic Example

```javascript
{
  "id": "customer_type",
  "type": "dropdown",
  "conditions": [
    {
      "optionValue": "new",
      "action": "show",
      "targetId": "how_did_you_hear"
    }
  ]
}
```

## 🗄️ Database Schema

The system automatically creates these tables:
- `users` - User management
- `forms` - Form definitions with themes
- `form_submissions` - Response data
- `form_analytics` - Usage tracking

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Themes
- `GET /api/themes` - List all themes
- `GET /api/themes/:id` - Get specific theme

### Forms (Enhanced)
- All simplified endpoints PLUS:
- Advanced form creation with themes
- Conditional logic validation
- User management features

### Admin
- `GET /api/admin/users` - Manage users
- `GET /api/admin/analytics` - View analytics

## 🚀 Production Ready

This version includes:
- Security features
- Database persistence
- User management
- Analytics tracking
- Professional themes

## 🔧 Environment Variables

```env
PORT=3001
SKIP_DATABASE=false
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=marketing_campaign_advanced
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
```

## 🚀 Ready for Enterprise!

Full-featured form builder with database, authentication, themes, and conditional logic!

---

For a simpler version without database setup, see `../simple/` 
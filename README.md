# Marketing Campaign Drag-and-Drop Form Builder

A comprehensive form building solution with **automatic link generation** - available in two clean, organized versions with **complete virtual environment support** and **interactive API documentation**.

## 📖 **Interactive API Documentation**

**🌐 Access the complete user manual and API documentation website:**

```bash
npm run docs        # Serves documentation at http://localhost:3003
npm run docs:open   # Opens documentation automatically
npm run serve-all   # Runs API + Documentation together
```

**📋 Features of the Documentation Website:**
- ✅ **Interactive API Testing** - Try endpoints directly from the browser
- ✅ **Complete User Manual** - Step-by-step guides for all features
- ✅ **Code Examples** - Copy-paste ready code snippets
- ✅ **Theme Gallery** - Visual preview of all 5 built-in themes
- ✅ **Troubleshooting Guide** - Solutions for common issues
- ✅ **Authentication Guide** - Complete security documentation

## 🎯 Choose Your Version

| Feature | Simplified Version | Enhanced Version |
|---------|-------------------|------------------|
| **Setup Time** | 2 minutes | 10 minutes |
| **Dependencies** | 2 (express, cors) | 8+ (includes MySQL, JWT, etc.) |
| **Form Creation** | ✅ Drag & Drop | ✅ Drag & Drop |
| **Automatic Links** | ✅ Instant URLs | ✅ Instant URLs |
| **Database** | In-Memory Only | MySQL + In-Memory Fallback |
| **Authentication** | ❌ | ✅ JWT + Sessions |
| **Themes** | ❌ | ✅ 5 Built-in + Custom |
| **Conditional Logic** | ❌ | ✅ Advanced Form Flows |
| **User Management** | ❌ | ✅ Role-based Access |
| **Virtual Environment** | ✅ Local + Docker | ✅ Local + Docker |
| **API Documentation** | ✅ Interactive Website | ✅ Interactive Website |
| **Best For** | Quick prototypes, small teams | Enterprise, production apps |

## 🚀 Quick Start Options

### Option 1: With Documentation (Recommended)
```bash
# Start API server and documentation together
npm run serve-all

# Access:
# - Form Builder: http://localhost:3001/form-builder.html
# - API Documentation: http://localhost:3003
```

### Option 2: Simplified Version (2 minutes)
```bash
# Navigate to simplified version
cd versions/simple

# Install and start
npm install
npm start

# Open form builder
open http://localhost:3001/form-builder.html
```

### Option 3: Enhanced Version (10 minutes)
```bash
# Navigate to enhanced version
cd versions/enhanced

# Install dependencies
npm install

# Optional: Setup database
npm run init-db

# Start server
npm start

# Login: admin/admin123
open http://localhost:3001/form-builder.html
```

### Option 4: Virtual Environment (Isolated & Secure)
```bash
# Local virtual environment
npm run venv:setup
npm run venv:simple       # Run simple version in virtual env
npm run venv:enhanced     # Run enhanced version in virtual env

# Docker containers (production ready)
npm run docker:simple     # Run simple version in Docker
npm run docker:enhanced   # Run enhanced with MySQL in Docker
```

### Option 5: Use Root Commands
```bash
# From project root - choose your version
npm start                    # Shows available options
npm run simple              # Start simplified version
npm run enhanced            # Start enhanced version
npm run setup-simple        # Install & start simplified
npm run setup-enhanced      # Install & start enhanced
```

## 🔒 Virtual Environment Support

This project includes comprehensive virtual environment support for complete isolation and reproducible deployments.

### 🎯 Virtual Environment Options

| Method | Setup | Use Case | Isolation |
|--------|-------|----------|-----------|
| **Local Virtual Env** | `npm run venv:setup` | Development | Process + Data |
| **Docker Containers** | `npm run docker:simple` | Production | Complete System |

### 🚀 Quick Virtual Environment Start
```bash
# Setup and run simple version
npm run venv:setup && npm run venv:simple

# Run enhanced version with Docker + MySQL
npm run docker:enhanced
```

**📖 Full Documentation**: See [VIRTUAL-ENVIRONMENT.md](VIRTUAL-ENVIRONMENT.md) for complete setup guide.

## ✨ Core Features (Both Versions)

### 🎨 **Drag-and-Drop Form Builder**
- Intuitive interface to design custom forms
- Real-time preview and editing
- Multiple field types with configuration options

### 🔗 **Automatic Link Generation**  
Every form gets an instant shareable URL:
- **Format**: `http://localhost:3001/form/[ID]`
- **Copy to clipboard** functionality
- **Direct access** for respondents
- **No setup required** - works immediately

### 📝 **Multiple Field Types**
- **Text Inputs** - Single line text entry
- **Dropdowns** - Multiple choice selections  
- **File Uploads** - Document and image uploads
- **Checkboxes** - Multiple selections

### 📱 **Responsive Design**
- Works perfectly on desktop and mobile
- Touch-friendly interface
- Automatic responsive layouts

## 📁 Project Structure

```
Marketing Campaign/
├── README.md                     # This guide
├── package.json                  # Root commands for easy management
├── 
├── 📁 docs/
│   └── index.html                # Interactive API Documentation Website
├── 
├── 📁 versions/
│   ├── 📁 simple/                # Simplified Version (2-minute setup)
│   │   ├── simple-server.js      # Single-file server
│   │   ├── package.json          # Minimal dependencies
│   │   ├── README.md             # Quick setup guide
│   │   ├── .nvmrc                # Node version specification
│   │   └── public/               # Form builder interface
│   │
│   └── 📁 enhanced/              # Enhanced Version (Full features)
│       ├── enhanced-server.js    # Full-featured server
│       ├── package.json          # Complete dependencies
│       ├── README.md             # Detailed setup guide
│       ├── env.example           # Environment configuration
│       ├── .nvmrc                # Node version specification
│       └── public/               # Enhanced form builder
├── 
├── 📁 Virtual Environment Files
├── .venv/                        # Local virtual environment
├── volumes/                      # Docker persistent storage
├── Dockerfile.simple             # Simple version container
├── Dockerfile.enhanced           # Enhanced version container
├── docker-compose.yml            # Multi-container orchestration
├── scripts/setup-virtualenv.sh   # Virtual environment setup
├── 
├── 📁 legacy/                    # Original complex architecture
└── 📁 public-shared/             # Shared assets (internal use)
```

## 🎨 Enhanced Features (Enhanced Version Only)

### 🔐 **Authentication System**
- **JWT Token Authentication** - Secure token-based auth
- **Session Management** - Persistent user sessions
- **Role-Based Access** - Admin and user roles
- **User Registration** - Create new accounts

### 🎨 **Theme Customization**
Choose from 5 professional themes:
- **Professional Blue** - Clean, corporate styling
- **Modern Green** - Fresh, contemporary look
- **Elegant Purple** - Sophisticated design
- **Warm Orange** - Friendly, approachable feel
- **Dark Mode** - Easy on the eyes

### 🔄 **Conditional Logic**
- **Dynamic Field Visibility** - Show/hide based on answers
- **Smart Form Flows** - Guide users through complex forms
- **Conditional Validation** - Context-aware requirements
- **Message Triggers** - Helpful guidance messages

### 🗄️ **Database Integration**
- **MySQL Support** - Full database persistence
- **Automatic Fallback** - Works without database setup
- **Schema Management** - Automatic table creation
- **Data Analytics** - Track usage and submissions

## 🎯 Use Cases

### Simplified Version Perfect For:
- **Rapid Prototyping** - Quick form creation
- **Small Teams** - Minimal setup overhead  
- **Internal Tools** - Company surveys and feedback
- **Event Registration** - Simple sign-up forms
- **Contact Forms** - Basic lead capture
- **Quick Surveys** - Fast data collection

### Enhanced Version Ideal For:
- **Enterprise Applications** - Full user management
- **Client Projects** - Professional theming
- **Complex Surveys** - Conditional logic flows
- **Multi-tenant Systems** - Role-based access
- **Production Apps** - Database persistence
- **Marketing Campaigns** - Advanced analytics

## 🚀 Migration Guide

### From Simplified to Enhanced
1. **Keep simple version running** for reference
2. **Navigate to enhanced**: `cd versions/enhanced`
3. **Install dependencies**: `npm install`
4. **Start enhanced server**: `npm start`
5. **Configure as needed** (database, themes, etc.)

### From Legacy Complex Version
1. **All complex components** moved to `legacy/` folder
2. **Choose new version** (simple or enhanced)
3. **Follow quick start** guide above
4. **Migrate forms** via API or manual recreation

### To Virtual Environment
1. **Setup virtual environment**: `npm run venv:setup`
2. **Test local virtual env**: `npm run venv:simple`
3. **Try Docker environment**: `npm run docker:simple`
4. **For production**: Use Docker with `npm run docker:enhanced`

## 🔧 API Reference

**📖 Complete Interactive API Documentation: `npm run docs`**

### Core Endpoints (Both Versions)
- `GET /api/health` - Server status
- `GET /api/forms` - List all forms
- `POST /api/forms` - Create form (returns automatic shareUrl)
- `POST /api/forms/:id/submit` - Submit form data
- `GET /form/:id` - Access form via generated link

### Enhanced Endpoints (Enhanced Version Only)
- `POST /api/auth/login` - User authentication
- `GET /api/themes` - Available themes
- `GET /api/admin/users` - User management (admin)

**💡 Tip**: Use the interactive documentation website to test all endpoints with real examples!

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process
lsof -i :3001
kill -9 [PID]

# Or use different port
PORT=3002 npm start
```

### Virtual Environment Issues
```bash
# Reset virtual environment
npm run venv:reset

# Clean Docker environment
npm run docker:down
docker system prune -f
```

### Documentation Issues
```bash
# Try alternative documentation serving
npm run docs

# Or use Python directly
python3 -m http.server 3003 --directory docs
```

### Version-Specific Issues
- **Simplified**: Check `versions/simple/README.md`
- **Enhanced**: Check `versions/enhanced/README.md`
- **Virtual Environment**: Check [VIRTUAL-ENVIRONMENT.md](VIRTUAL-ENVIRONMENT.md)
- **API Issues**: Use the interactive documentation at `http://localhost:3003`

## 🎉 Ready to Get Started?

### For Quick Setup with Documentation (2 minutes):
```bash
npm run serve-all
# Opens API at :3001 and Docs at :3003
```

### For Simplified Version Only:
```bash
cd versions/simple
npm install && npm start
open http://localhost:3001/form-builder.html
```

### For Enhanced Version:
```bash
cd versions/enhanced
npm install && npm start
open http://localhost:3001/form-builder.html
# Login: admin / admin123
```

### For Virtual Environment (Isolated):
```bash
# Local virtual environment
npm run venv:setup && npm run venv:simple

# Docker environment (production ready)
npm run docker:simple
```

### For API Documentation:
```bash
npm run docs:open    # Opens interactive documentation
```

**🚀 Start building forms with automatic link generation today!**

---

## 📄 License

MIT License - Feel free to use in your projects!

## 🙏 Acknowledgements

Special thanks to:
- **Claude 3.5 Sonnet** - Code implementation and architecture
- **Open-source community** - For the amazing frameworks and libraries

*📖 Access the complete interactive API documentation and user manual at `http://localhost:3003` - choose the version that fits your needs and scale up when ready!*

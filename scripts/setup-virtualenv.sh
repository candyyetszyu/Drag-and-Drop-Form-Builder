#!/bin/bash

# Marketing Campaign Form Builder - Virtual Environment Setup
# This script creates isolated environments for both versions

set -e

echo "🚀 Marketing Campaign Form Builder - Virtual Environment Setup"
echo "============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "versions" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Function to check Node.js version
check_node_version() {
    print_info "Checking Node.js version..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18.20.0 or higher"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="18.20.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
        print_status "Node.js version $NODE_VERSION is compatible"
    else
        print_warning "Node.js version $NODE_VERSION detected. Recommended: $REQUIRED_VERSION or higher"
    fi
}

# Function to setup virtual environment directory structure
setup_env_structure() {
    print_info "Setting up virtual environment structure..."
    
    # Create virtual environment directories
    mkdir -p .venv/simple
    mkdir -p .venv/enhanced
    mkdir -p .venv/shared
    
    # Create data directories
    mkdir -p .venv/data/simple
    mkdir -p .venv/data/enhanced
    mkdir -p .venv/logs
    
    print_status "Virtual environment directories created"
}

# Function to create environment activation scripts
create_activation_scripts() {
    print_info "Creating environment activation scripts..."
    
    # Simple version activation script
    cat > .venv/activate-simple.sh << 'EOF'
#!/bin/bash
export VENV_NAME="Marketing Campaign - Simple"
export VENV_VERSION="simple"
export NODE_ENV="development"
export PORT="3001"
export VENV_PATH="$(pwd)/.venv/simple"
export DATA_PATH="$(pwd)/.venv/data/simple"

echo "🟢 Activated: $VENV_NAME"
echo "📁 Virtual Environment: $VENV_PATH"
echo "💾 Data Path: $DATA_PATH"
echo "🌐 Port: $PORT"
echo ""
echo "Commands:"
echo "  npm run start-simple     # Start simple server"
echo "  npm run test-simple      # Run simple tests"
echo "  npm run clean-simple     # Clean simple data"
echo ""
EOF

    # Enhanced version activation script
    cat > .venv/activate-enhanced.sh << 'EOF'
#!/bin/bash
export VENV_NAME="Marketing Campaign - Enhanced"
export VENV_VERSION="enhanced"
export NODE_ENV="development"
export PORT="3001"
export VENV_PATH="$(pwd)/.venv/enhanced"
export DATA_PATH="$(pwd)/.venv/data/enhanced"

# Database settings for virtual environment
export DB_HOST="localhost"
export DB_USER="root"
export DB_PASSWORD=""
export DB_NAME="marketing_campaign_venv"
export SKIP_DATABASE="true"

# Security settings
export JWT_SECRET="venv-jwt-secret-development-only"
export SESSION_SECRET="venv-session-secret-development-only"

echo "🟡 Activated: $VENV_NAME"
echo "📁 Virtual Environment: $VENV_PATH"
echo "💾 Data Path: $DATA_PATH"
echo "🌐 Port: $PORT"
echo "🗄️  Database: In-memory (SKIP_DATABASE=true)"
echo ""
echo "Commands:"
echo "  npm run start-enhanced    # Start enhanced server"
echo "  npm run test-enhanced     # Run enhanced tests"
echo "  npm run clean-enhanced    # Clean enhanced data"
echo ""
EOF

    chmod +x .venv/activate-simple.sh
    chmod +x .venv/activate-enhanced.sh
    
    print_status "Activation scripts created"
}

# Function to setup package.json scripts for virtual environment
setup_venv_scripts() {
    print_info "Adding virtual environment scripts to package.json..."
    
    # Check if jq is available for JSON manipulation
    if command -v jq &> /dev/null; then
        # Use jq to add scripts
        cat package.json | jq '.scripts += {
            "venv:setup": "scripts/setup-virtualenv.sh",
            "venv:simple": "source .venv/activate-simple.sh && cd versions/simple && npm install && npm start",
            "venv:enhanced": "source .venv/activate-enhanced.sh && cd versions/enhanced && npm install && npm start",
            "venv:clean": "rm -rf .venv/data/* .venv/logs/*",
            "venv:reset": "rm -rf .venv && scripts/setup-virtualenv.sh"
        }' > package.json.tmp && mv package.json.tmp package.json
        print_status "Virtual environment scripts added to package.json"
    else
        print_warning "jq not found. Virtual environment scripts need to be added manually"
        echo ""
        echo "Add these scripts to package.json:"
        echo '  "venv:setup": "scripts/setup-virtualenv.sh",'
        echo '  "venv:simple": "source .venv/activate-simple.sh && cd versions/simple && npm install && npm start",'
        echo '  "venv:enhanced": "source .venv/activate-enhanced.sh && cd versions/enhanced && npm install && npm start",'
        echo '  "venv:clean": "rm -rf .venv/data/* .venv/logs/*",'
        echo '  "venv:reset": "rm -rf .venv && scripts/setup-virtualenv.sh"'
    fi
}

# Function to create virtual environment isolation
create_isolation() {
    print_info "Creating environment isolation..."
    
    # Create package-lock isolation for simple version
    if [ -f "versions/simple/package-lock.json" ]; then
        cp "versions/simple/package-lock.json" ".venv/simple/package-lock.json.backup"
    fi
    
    # Create package-lock isolation for enhanced version
    if [ -f "versions/enhanced/package-lock.json" ]; then
        cp "versions/enhanced/package-lock.json" ".venv/enhanced/package-lock.json.backup"
    fi
    
    print_status "Environment isolation configured"
}

# Function to test virtual environment
test_venv() {
    print_info "Testing virtual environment setup..."
    
    # Test simple version activation
    if source .venv/activate-simple.sh; then
        print_status "Simple version activation script works"
    else
        print_error "Simple version activation script failed"
    fi
    
    # Test enhanced version activation
    if source .venv/activate-enhanced.sh; then
        print_status "Enhanced version activation script works"
    else
        print_error "Enhanced version activation script failed"
    fi
}

# Main setup process
main() {
    echo ""
    print_info "Starting virtual environment setup..."
    echo ""
    
    check_node_version
    setup_env_structure
    create_activation_scripts
    setup_venv_scripts
    create_isolation
    test_venv
    
    echo ""
    print_status "Virtual Environment Setup Complete!"
    echo ""
    print_info "Usage:"
    echo "  source .venv/activate-simple.sh     # Activate simple version environment"
    echo "  source .venv/activate-enhanced.sh   # Activate enhanced version environment"
    echo ""
    echo "  npm run venv:simple                 # Run simple version in virtual environment"
    echo "  npm run venv:enhanced               # Run enhanced version in virtual environment"
    echo "  npm run venv:clean                  # Clean virtual environment data"
    echo "  npm run venv:reset                  # Reset entire virtual environment"
    echo ""
    print_info "Data will be isolated in .venv/data/ directory"
    print_info "Logs will be stored in .venv/logs/ directory"
    echo ""
}

# Run main function
main "$@" 
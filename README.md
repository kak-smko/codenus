# Codenus

**Codenus** is a modern, full-stack web application framework built on top of [Renus](https://github.com/kak-smko/renus) (Python backend) and [Renusify](https://github.com/kak-smko/renusify) (Vue 3 UI components). It provides a modular, extensible architecture for building scalable web applications with separate admin and user-facing interfaces.

## Overview

Codenus combines the power of Python's async capabilities with Vue 3's reactive frontend, offering a complete solution for building modern web applications. The framework emphasizes:

- **Separation of Concerns**: Distinct admin and public frontends
- **Extensibility**: Plugin-based extension system
- **Modern Stack**: API backend with Vue 3 + Vite frontend
- **Developer Experience**: Hot-reloading, TypeScript support, and modern tooling
- **Security**: Built-in encryption support and security headers
- **Performance**: ASGI server with worker process support

## Architecture

### Backend
- **Framework**: [Renus](https://github.com/kak-smko/renus) - A python-based framework
- **Server**: Uvicorn (ASGI) with multi-worker support
- **Database**: Configurable database layer
- **Extensions**: Modular plugin system
- **Jobs**: Background job processing
- **Storage**: File storage management

### Frontend
- **Framework**: Vue 3 with Composition API
- **UI Library**: [Renusify](https://github.com/kak-smko/renusify) - Vue 3 component library
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **PWA Support**: Progressive Web App capabilities (public interface)

### Two Frontend Applications

1. **Admin Interface** (`frontend/admin`)
   - Port: 8081
   - Administrative dashboard and management tools
   - Full CRUD operations

2. **Public Interface** (`frontend/index`)
   - Port: 8080
   - User-facing application
   - PWA-enabled for offline support

## Project Structure

```
codenus/
├── app/                    # Application logic
├── commands/               # CLI commands
├── config/                 # Configuration files
│   ├── app.py             # Application settings
│   └── database.py        # Database configuration
├── extension/             # Extension system
│   └── install.py         # Extension installer
├── frontend/              # Frontend applications
│   ├── admin/             # Admin interface (Vue 3 + Vite)
│   └── index/             # Public interface (Vue 3 + Vite + PWA)
├── job/                   # Background jobs
├── public/                # Public assets
├── routes/                # API routes
│   ├── index.py           # Route entry point
│   └── web.py             # Web routes
├── storage/               # File storage
├── main.py                # Application entry point
└── requirements.txt       # Python dependencies
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python**: 3.8 or higher
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **pip**: Latest version
- **Git**: For cloning the repository

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/kak-smko/codenus
cd codenus
```

### 2. Backend Setup

Install Python dependencies:

```bash
pip install -r requirements.txt
```

The main dependencies include:
- `renus` - Backend framework
- `uvicorn[standard]` - ASGI server
- `Pillow` - Image processing
- `cryptography` - Encryption support

### 3. Frontend Setup

Install dependencies for both frontend applications:

```bash
# Install admin interface dependencies
cd frontend/admin
npm install

# Install public interface dependencies
cd ../index
npm install
cd ../..
```

### 4. Configuration

Configure your application by editing the files in the `config/` directory:

- `config/app.py` - Application settings, environment variables
- `config/database.py` - Database connection and settings

### 5. Install Extensions

Codenus uses an extension system for modular functionality. Install the core extensions:

```bash
renus extension codenus/user      # User authentication and management
renus extension codenus/translate # Internationalization support
```

## Running the Application

### Development Mode

**Start the Backend Server:**

```bash
python main.py
```

The backend will run on `http://127.0.0.1:4000` with:
- 8 worker processes
- Hot-reloading enabled
- CORS headers configured

**Start the Admin Frontend:**

```bash
cd frontend/admin
npm run dev
```

Access the admin interface at `http://localhost:8081`

**Start the Public Frontend:**

```bash
cd frontend/index
npm run dev
```

Access the public interface at `http://localhost:8080`

### Production Build

**Build Frontend Applications:**

```bash
# Build admin interface
cd frontend/admin
npm run build

# Build public interface
cd frontend/index
npm run build
```

**Run Backend in Production:**

Modify `main.py` to disable reload and adjust worker count:

```python
if __name__ == "__main__":
    uvicorn.run("main:app", 
                host="0.0.0.0",
                port=4000,
                server_header=False,
                workers=8,
                reload=False,  # Disable for production
                log_level="warning")
```

## Features

### Extension System

Codenus provides a modular extension system allowing you to add functionality without modifying core code. Extensions can:

- Add new routes and endpoints
- Extend database models
- Provide middleware
- Add background jobs
- Integrate third-party services

### Encryption Support

Enable end-to-end encryption by uncommenting the crypto configuration in `main.py`:

```python
from extension.codenus.user.crypt import Crypto

JsonResponse.cryptor = Crypto
Request.cryptor = Crypto
```


### Progressive Web App

The public interface (`frontend/index`) supports PWA features:
- Offline functionality
- Install to home screen
- Service worker caching
- App manifest

## Development

### Code Quality Tools

Both frontend applications include:

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **EditorConfig**: Consistent coding styles

Run linting:

```bash
npm run lint      # Lint and auto-fix
npm run format    # Format code with Prettier
```

### Hot Module Replacement

Both backend and frontend support hot-reloading during development for immediate feedback.

## Contributing

We welcome contributions from the community! Whether it's:

- Bug reports and fixes
- Feature requests and implementations
- Documentation improvements
- Extension development
- Performance optimizations

Please feel free to open issues or submit pull requests. We'd be very happy to have you join us.

## Resources

- **Renus Framework**: [github.com/kak-smko/renus](https://github.com/kak-smko/renus)
- **Renusify UI Library**: [github.com/kak-smko/renusify](https://github.com/kak-smko/renusify)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or discussions:

- Open an issue on GitHub
- Check the documentation of [Renus](https://github.com/kak-smko/renus) and [Renusify](https://github.com/kak-smko/renusify)
- Review existing issues and pull requests

---

Built with ❤️ using Renus and Renusify

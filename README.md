# Codenus V2.0.0

Codenus is a full-stack Python and Vue starter framework for building web applications. It pairs the [Renus](https://github.com/kak-smko/renus) ASGI framework with two Vue 3 frontends powered by [Renusify](https://github.com/kak-smko/renusify): an admin application and a public-facing application.

The repository provides a starting architecture—not a finished product. Add your own routes, models, authentication, and application-specific configuration before deploying it.

## Features

- **Async Python backend** built on Renus and ASGI
- **Separate admin and public frontends** built with Vue 3, Vue Router, and Vite
- **Flexible database support** through Renus's adapter-based data layer, including SQLite, MySQL, and MongoDB
- **Extension support** with dependencies declared in `extension/extension.json`
- **API development proxy** from each Vite server to the backend
- **PWA tooling** configured for the public frontend

## Architecture

| Area | Location | Development URL | Purpose |
| --- | --- | --- | --- |
| Backend | `main.py`, `routes/` | `http://127.0.0.1:4000` | Renus application, routes, database lifecycle |
| Admin frontend | `frontend/admin/` | `http://localhost:8081` | Administrative UI |
| Public frontend | `frontend/index/` | `http://localhost:8080` | Public UI and PWA configuration |

Both Vite development servers proxy `/api` requests to the backend at `http://localhost:4000`.

## Requirements

- Python 3.11 or newer
- Node.js 18 or newer and npm
- A database server appropriate to the adapter you configure; MongoDB is the starter's default

## Getting started

Use the Renus CLI to generate a Codenus project. The `mvp` template provides this full-stack starter; it is fetched from the repository's `master` branch, so generated projects use the latest template rather than a pinned release.

### 1. Install Renus and generate a project

```bash
python3 -m pip install renus
renus create my-app mvp
cd my-app
```

You can also run `renus create` without arguments to select a project name and template interactively. Renus offers `api`, `mvp`, and `extension` templates. The optional database selection is used by the `api` template; `mvp` and `extension` use their own configuration. See the [Renus repository](https://github.com/kak-smko/renus) for CLI details.

### 2. Install project dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Install the frontend dependencies:

```bash
cd frontend/admin && npm ci
cd ../index && npm ci
cd ../..
```

### 3. Configure the database

Renus supports multiple database backends, including SQLite, MySQL, and MongoDB, and supports configuring multiple named connections. This Codenus starter defaults to MongoDB at `mongodb://127.0.0.1:27017` and selects the `codenus_test` database. Start MongoDB locally, or change `config/database.py` to use another supported adapter.

The starter's `main.py` currently creates `Database` from the single `adapter` exported by `config/database.py`. To use multiple named connections, configure the adapters and update the application's database wiring accordingly. The app connects the database on startup, disconnects on shutdown, and makes it available through `app.state["db"]`.

### 4. Install the declared extensions

`main.py` imports the activity and tracker extensions at startup. Install the extensions declared in `extension/extension.json` with the Renus CLI:

```bash
renus extension 'codenus/kit==1.*'
renus extension 'codenus/activity==2.*'
renus extension 'codenus/tracker==2.*'
```

This step requires network access. Consult the [Renus documentation](https://github.com/kak-smko/renus) for extension management options.

### 5. Start the application

Run the backend in one terminal, with the virtual environment activated:

```bash
python main.py
```

Run the admin frontend in a second terminal:

```bash
cd frontend/admin
npm run dev
```

Run the public frontend in a third terminal:

```bash
cd frontend/index
npm run dev
```

Open the admin app at [http://localhost:8081](http://localhost:8081) and the public app at [http://localhost:8080](http://localhost:8080). The backend listens on port `4000`.

The default `config/app.py` sets `debug = True`, which enables the development server's reload mode. `main.py` selects its non-debug server settings when `debug` is disabled; review those settings and your deployment architecture before using them in production.

## Configuration

- `config/app.py` contains application settings, including the debug flag, public directory, and host-related options.
- `config/database.py` exports the Renus database `adapter` and the `ID` type used by the application.
- `extension/extension.json` lists the Codenus extensions expected by this project.

Do not deploy the sample configuration unchanged. In particular, replace development credentials and keys, configure a production database, and review trusted proxy and security settings. Keep production secrets out of source control.

## Project layout

```text
codenus/
├── app/                 # Application package and extension integration
├── commands/            # Project-specific CLI commands
├── config/              # Application and database settings
├── extension/           # Extension manifest
├── frontend/
│   ├── admin/            # Vue admin application
│   └── index/            # Vue public application
├── job/                 # Background job code
├── routes/
│   ├── index.py          # Frontend/static routes
│   ├── api.py            # API route registrations
│   └── web.py            # Web route registrations
├── storage/              # Application storage
├── tests/                # Test suite
├── main.py               # Backend entry point
└── requirements.txt      # Python dependencies
```

## Frontend commands

Run development, build, and preview commands from either frontend directory (`frontend/admin` or `frontend/index`):

```bash
npm run dev      # Start the Vite development server
npm run build    # Build the frontend
npm run preview  # Preview a production build
```



The admin build writes to `public/admin`; the public build writes to `public/index`. The backend's frontend routes in `routes/index.py` currently look for `public/index.html` and `public/admin.html`, so configure your deployment or static-file integration to serve the built frontend entry points correctly.

## Extending the application

- Add API endpoints in `routes/api.py` and web routes in `routes/web.py`, then register them through `routes/index.py`.
- Add project settings in `config/` and keep environment-specific secrets out of tracked files.
- Declare Renus extensions in `extension/extension.json` and use the Renus CLI to manage installed extensions.
- Add or update tests under `tests/` as application behavior grows.

For Renus application and database APIs, see the [Renus repository](https://github.com/kak-smko/renus). For UI components, see [Renusify](https://github.com/kak-smko/renusify).

## Contributing

Bug reports, fixes, and documentation improvements are welcome. Please open an issue to discuss larger changes before submitting a pull request.

## License

Codenus is distributed under the BSD 3-Clause License. See [LICENSE](LICENSE) for the full text.

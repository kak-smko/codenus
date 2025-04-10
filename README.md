# Codenus

**Codenus** is a web application designed to provide a seamless experience for both users and administrators. This project features a backend built with Python and a frontend developed using modern JavaScript frameworks. The application is structured to facilitate easy configuration, installation, and deployment.

## Key Features

- **Modular Architecture:** Organized into distinct backend and frontend components for easy maintenance and updates.
- **Customizable Configuration:** Modify configuration files to tailor the application to your specific needs.
- **User-Friendly Interface:** Intuitive design ensures a smooth experience for both general users and administrators.
- **Real-Time Development:** Supports hot-reloading in the frontend for immediate feedback during development.

## Installation and Setup

To get started with Codenus, follow these steps:

### 1. Clone the Repository

Download the project files from GitHub:

git clone https://github.com/kak-smko/codenus


### 2. Install Dependencies

Navigate to the project directory and install the required dependencies:

```bash
cd codenus
# For backend
pip install -r requirements.txt
# For frontend
cd frontend/admin
npm install
cd frontend/index
npm install
```

### 3. Configure the Application

Modify the configuration files located in the `config` directory to suit your environment.

### 4. Run the Application

Start the backend server and the frontend development server:

```bash
# Start backend
python main.py

# Start frontend
cd frontend/admin
npm run dev
cd frontend/index
npm run dev
```

## Contributing

We welcome contributions! We would be very happy to have you join us.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
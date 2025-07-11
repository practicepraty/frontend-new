# Frontend Application

A React application built with Vite, featuring a medical platform with doctor registration and audio upload capabilities.

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **ESLint** - Code linting

## Getting Started

### Prerequisites

Make sure you have Node.js installed on your machine (version 16 or higher recommended).

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Development Mode
Start the development server with hot module replacement:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

#### Other Available Scripts

- **Build for production:**
  ```bash
  npm run build
  ```

- **Preview production build:**
  ```bash
  npm run preview
  ```

- **Run ESLint:**
  ```bash
  npm run lint
  ```

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── AuthPages.jsx   # Authentication pages
│   ├── DoctorRegistration.jsx
│   ├── DoctorAudioUpload.jsx
│   └── ...
├── assets/             # Static assets
├── App.jsx            # Main application component
└── main.jsx           # Application entry point
```

## Features

- Doctor registration system
- Audio upload functionality
- Responsive design with Tailwind CSS
- Modern React with hooks and functional components

## Development Notes

This project uses Vite for fast development and building. The setup includes:
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) for Fast Refresh
- ESLint configuration for code quality
- Tailwind CSS for styling
- PostCSS for CSS processing

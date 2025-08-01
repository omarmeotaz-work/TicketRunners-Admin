# Ticket Runners Admin Dashboard

This is the separate admin application for the Ticket Runners platform. It provides a comprehensive dashboard for managing events, users, tickets, NFC cards, and platform operations.

## Features

- **Admin Authentication**: Secure login system for admin users
- **Event Management**: Create, edit, and manage events
- **Ticket Management**: Monitor ticket sales and usage
- **NFC Card Management**: Manage NFC cards and their status
- **Customer Management**: View and manage customer accounts
- **User Management**: Admin user management with role-based permissions
- **Analytics Dashboard**: Comprehensive analytics and reporting
- **Multi-language Support**: English and Arabic support
- **Dark/Light Theme**: Toggle between dark and light themes

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Recharts** for data visualization
- **React Query** for data fetching
- **i18next** for internationalization

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Demo Credentials

For testing purposes, use these credentials:

- **Username**: admin
- **Password**: admin123

## Project Structure

```
src/
├── components/
│   ├── admin/          # Admin-specific components
│   └── ui/            # Reusable UI components
├── pages/             # Page components
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── locales/           # Internationalization files
└── main.tsx          # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file in the root directory for any environment-specific configurations.

## Deployment

The application can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is part of the Ticket Runners platform.
#   T i c k e t R u n n e r s - A d m i n  
 
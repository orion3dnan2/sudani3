# Overview

This is a full-stack Arabic marketplace application called "البيت السوداني" (The Sudanese House) - a platform for Sudanese businesses and services in the Gulf region and worldwide. The application provides an e-commerce marketplace with user authentication, product management, order processing, and a comprehensive dashboard for merchants. The platform includes multiple user roles (customer, merchant, admin) and features both marketplace functionality and service listings.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing with conditional navigation/footer rendering
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom Arabic-focused design system and Cairo font integration
- **State Management**: Zustand with persistence for authentication state
- **Forms**: React Hook Form with Zod validation and Hookform resolvers
- **Data Fetching**: TanStack React Query for server state management with custom query functions

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL schema definitions
- **Authentication**: Simple password-based authentication without JWT (sessions planned)
- **API Design**: RESTful endpoints under `/api` namespace with structured error handling
- **Development**: Hot reload with Vite integration in development mode

## Database Schema
- **Users Table**: Supports multiple roles (customer, merchant, admin) with profile information
- **Stores Table**: Merchant-owned stores with settings and activation status
- **Products Table**: Product catalog with categories, pricing, and inventory management
- **Orders Table**: Order processing with status tracking and JSON-based item storage
- **Relationships**: Foreign key relationships between users, stores, products, and orders

## Authentication System
- **Storage**: In-memory storage implementation (MemStorage) for development
- **User Roles**: Role-based access control with customer, merchant, and admin levels
- **Session Management**: Basic authentication without proper session handling (needs enhancement)
- **Registration**: User registration with role selection and account activation

## Development Environment
- **Build System**: Vite with React plugin and TypeScript support
- **Path Aliases**: Configured aliases for clean imports (@, @shared, @assets)
- **Development Tools**: Runtime error overlay and Replit-specific development features
- **Static Assets**: Separate handling for client and server static files

## Deployment Architecture
- **Build Process**: Separate client (Vite) and server (esbuild) build processes
- **Production**: Node.js server serving both API and static client files
- **Environment**: Environment variable configuration for database connections

# External Dependencies

## Database
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL (@neondatabase/serverless)
- **Migration System**: Drizzle Kit for database migrations and schema management

## UI Framework
- **Radix UI**: Complete suite of unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **TypeScript**: Full TypeScript support across frontend and backend
- **Vite**: Frontend build tool with development server and HMR
- **esbuild**: Backend bundling for production builds

## Session Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions (configured but not fully implemented)

## Form Handling
- **Zod**: Schema validation for form inputs and API requests
- **React Hook Form**: Form state management with validation integration

## Date Handling
- **date-fns**: Date utility library for formatting and manipulation

## State Management
- **Zustand**: Lightweight state management with persistence middleware
- **TanStack React Query**: Server state management with caching and synchronization
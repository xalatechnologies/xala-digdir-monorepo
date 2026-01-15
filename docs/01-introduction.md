# Introduction to Xala Diglist Platform

## Overview

Xala Diglist is a modern, multi-tenant listing platform built for the Norwegian public sector. The platform enables organizations to manage, publish, and book various types of listings (facilities, venues, spaces) with a focus on accessibility, security, and user experience.

## Platform Vision

Our vision is to provide a unified, accessible platform that simplifies the process of sharing and booking public resources while maintaining the highest standards of security and compliance.

## Key Features

### 🏢 Multi-Tenant Architecture
- Support for multiple organizations
- Isolated data and configurations
- Centralized management with decentralized control

### 🔐 Security & Compliance
- Role-based access control (RBAC)
- Comprehensive audit trails
- GDPR compliance
- ID-porten integration for Norwegian authentication

### 🎨 Modern UI/UX
- Built on Norwegian Designsystemet
- Runtime theme switching
- Accessibility-first approach (WCAG 2.1 AA)
- Responsive design for all devices

### 🌐 Internationalization
- Full i18n support
- Norwegian (Bokmål) as primary language
- English support
- Extensible for additional languages

### ⚡ Performance
- Optimized for Core Web Vitals
- Progressive Web App capabilities
- Offline functionality
- Lazy loading and code splitting

## Architecture Principles

### 1. Contract-First Development
We define data contracts in the backend and consume them directly in the frontend without transformation layers.

### 2. No Transformers Rule
Frontend applications never transform, map, or adapt API responses. We use Projection DTOs directly from the SDK.

### 3. Design System Compliance
All UI components must come through `@xala/ds` - never directly from Designsystemet.

### 4. SOLID Principles
We follow SOLID principles throughout the codebase, ensuring maintainable and scalable software.

## System Boundaries

### In Scope
- Listing management (CRUD operations)
- Booking system with calendar integration
- User management and authentication
- Organization management
- Audit and compliance features
- Search and discovery
- Notifications and communication

### Out of Scope
- Payment processing (integrates with external providers)
- Email/SMS delivery (integrates with external providers)
- Advanced analytics (uses external tools)
- File storage (uses cloud storage solutions)

## Target Users

### Primary Users
1. **Organization Administrators** - Manage listings and bookings
2. **End Users** - Search, view, and book listings
3. **System Administrators** - Platform maintenance and configuration

### Secondary Users
1. **Auditors** - Review compliance and audit trails
2. **Developers** - Extend and integrate with the platform
3. **Support Staff** - Assist users and troubleshoot issues

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **TanStack Query** for server state
- **React Router** for navigation
- **Designsystemet** for UI components

### Backend
- **Node.js** with Fastify
- **TypeScript** for type safety
- **PostgreSQL** for data storage
- **Prisma** for database ORM
- **JWT** for authentication

### Infrastructure
- **Docker** for containerization
- **Nginx** for reverse proxy
- **Azure** for cloud services
- **GitHub Actions** for CI/CD

## Compliance & Standards

### Norwegian Standards
- **Universell Utforming** (UA) for accessibility
- **ID-porten** for authentication
- **Digdir** design guidelines
- **GDPR** for data protection

### International Standards
- **WCAG 2.1 AA** for web accessibility
- **RFC 7807** for error responses
- **OpenAPI 3.0** for API documentation
- **ISO 27001** for information security

## Next Steps

1. Read the [Quick Start](./02-quick-start.md) guide to set up your development environment
2. Explore the [Architecture](./architecture/01-overview.md) section to understand system design
3. Check the [Development Workflow](./03-development-workflow.md) for day-to-day practices
4. Review the [Contract-First Guide](./guides/01-contract-first.md) for our development philosophy

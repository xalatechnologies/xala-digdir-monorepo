# Glossary

This glossary defines key terms, concepts, and terminology used throughout the Xala Diglist Platform.

## A

### A11y
Short for "accessibility". Refers to the design of products, devices, services, or environments for people with disabilities. We follow WCAG 2.1 AA standards.

### ADG
Altinn Design Guide. Norwegian design system guidelines that complement Designsystemet.

### ADR
Architecture Decision Record. A document that captures an important architectural decision along with its context and consequences.

### API Gateway
A server that acts as an API front-end, receiving API requests and routing them to the appropriate service.

### ABAC
Attribute-Based Access Control. An authorization model that evaluates access based on attributes of the user, resource, action, and environment.

## B

### Backoffice
The administrative interface of the platform used by organization administrators to manage listings, bookings, and users.

### Booking
A reservation of a listing for a specific time period. Bookings have a lifecycle (pending, confirmed, cancelled, completed).

### BFF
Backend for Frontend. A pattern where a backend service is specifically designed to serve a particular frontend application.

## C

### Component
A reusable piece of UI that encapsulates its own logic and styling. All components must come from `@xala/ds`.

### Contract
The formal definition of API endpoints, data structures, and behaviors. Defined in the backend and consumed directly by the frontend.

### CQRS
Command Query Responsibility Segregation. A pattern that separates read (query) operations from write (command) operations.

## D

### Design Tokens
The smallest elements of a design system (colors, fonts, spacing, etc.) that ensure consistency across all applications.

### Designsystemet
The official Norwegian design system for public sector digital services. We use it through our `@xala/ds` facade.

### DTO
Data Transfer Object. An object that carries data between processes. In our case, Projection DTOs define the shape of data sent to the frontend.

### DDD
Domain-Driven Design. An approach to software development that focuses on a core domain and domain logic.

## E

### E2E
End-to-End testing. Testing that validates the entire application flow from the user's perspective.

### ESLint
A tool for identifying and reporting on patterns found in ECMAScript/JavaScript code. We use custom rules for contract compliance.

## F

### Feature
A self-contained piece of functionality that includes components, hooks, services, and types related to a specific domain.

### Fastify
A fast and low-overhead web framework for Node.js used in our API backend.

### Frontend
The client-side part of the application that runs in the user's browser. Includes Web, Backoffice, and Min Side apps.

## G

### GDPR
General Data Protection Regulation. EU regulation on data protection and privacy that we comply with.

### Guardrails
Automated rules and checks that prevent developers from violating architectural principles (e.g., no direct @digdir imports).

## H

### Hook
A React function that lets you "hook into" React state and lifecycle features from function components.

## I

### ID-porten
The Norwegian government's common login solution for digital services. We integrate with it for authentication.

### i18n
Internationalization. The process of designing and developing applications that can adapt to different languages and regions.

### Instance
A single deployment of the platform for a specific organization or tenant.

## J

### JWT
JSON Web Token. A compact URL-safe means of representing claims to be transferred between two parties.

## K

### K8s
Kubernetes. An open-source container orchestration platform for automating deployment, scaling, and management of containerized applications.

## L

### Listing
A resource that can be booked (e.g., meeting room, auditorium, sports facility). Previously referred to as "facility" or "venue".

### LCP
Largest Contentful Paint. A Core Web Vital metric that measures loading performance.

## M

### Min Side
"My Page" in Norwegian. The user dashboard where individuals can view their bookings, profile, and personal information.

### Monorepo
A single repository containing multiple related projects (apps and packages) managed together.

### Mutation
An operation that changes data on the server (create, update, delete).

## N

### NestJS
A progressive Node.js framework for building efficient, reliable and scalable server-side applications (not used in our current stack).

## O

### OpenAPI
A specification for building RESTful APIs. We use it to define our API contracts and generate the SDK.

### Organization
A tenant in the multi-tenant system. Organizations have their own listings, users, and settings.

## P

### Package
A shared piece of code in the monorepo (e.g., client-sdk, ds, i18n).

### Permission
The ability to perform a specific action on a resource (e.g., canEdit, canDelete, canBook).

### Projection
A tailored view of data optimized for a specific UI context. See Projection DTO.

### Projection DTO
A Data Transfer Object that represents a specific projection of data for the frontend.

### pnpm
A fast, disk space efficient package manager that we use for the monorepo.

## Q

### Query
An operation that fetches data from the server without modifying it.

## R

### RBAC
Role-Based Access Control. An approach to restricting system access to authorized users based on their roles.

### React
A JavaScript library for building user interfaces. We use React 18 with TypeScript.

### Redux
A predictable state container for JavaScript apps (not used in our current stack in favor of TanStack Query).

### Route
A URL pattern that maps to a specific component or page in the application.

## S

### SDK
Software Development Kit. Our client-sdk provides type-safe access to the API.

### Service
A backend component that handles business logic for a specific domain.

### SOLID
Five principles of object-oriented programming: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.

### State
Data that changes over time in an application. Can be server state (from API) or client state (UI state).

### Storybook
A tool for developing UI components in isolation (used internally for @xala/ds).

## T

### TanStack Query
A library for fetching, caching, synchronizing, and updating server state in React applications.

### Tenant
An organization or customer in our multi-tenant system. Each tenant has isolated data and configuration.

### Theme
A collection of design tokens (colors, typography, spacing) that define the visual appearance of the application.

### Token
Can refer to:
- Design Token: A design system primitive
- JWT Token: An authentication token
- API Token: An API access token

### Transformer
A function that converts data from one shape to another. **Transformers are forbidden in our architecture.**

### Turborepo
A high-performance build system for JavaScript and TypeScript monorepos.

## U

### UI
User Interface. The visual elements of an application that users interact with.

### UX
User Experience. The overall experience a user has when interacting with a product or service.

### Universell Utforming
Universal Design in Norwegian. Requirements for digital services to be accessible to all users.

## V

### Vite
A modern front-end build tool that provides a fast development experience.

### ViewModel
A model specifically designed for a view. **ViewModels are forbidden in our architecture.**

## W

### WAF
Web Application Firewall. A security system that controls incoming and outgoing web traffic.

### Web App
The public-facing application for discovering and booking listings.

### WCAG
Web Content Accessibility Guidelines. International standards for web accessibility. We follow WCAG 2.1 AA.

## X

### Xala
The name of our platform and company. Stands for "eXperience Access Listing Application".

## Numbers

### 3-Tier Architecture
A three-layer architecture pattern:
1. Presentation Layer (Frontend)
2. Business Logic Layer (API)
3. Data Layer (Database)

## Acronyms Quick Reference

| Acronym | Full Term | Context |
|---------|-----------|---------|
| API | Application Programming Interface | Backend interfaces |
| ADR | Architecture Decision Record | Documentation |
| BFF | Backend for Frontend | Architecture pattern |
| CLI | Command Line Interface | Development tools |
| CRUD | Create, Read, Update, Delete | Database operations |
| DTO | Data Transfer Object | Data contracts |
| E2E | End-to-End | Testing |
| GDPR | General Data Protection Regulation | Legal compliance |
| GUI | Graphical User Interface | User interface |
| HTML | HyperText Markup Language | Web markup |
| HTTP | Hypertext Transfer Protocol | Web protocol |
| HTTPS | HTTP Secure | Secure web protocol |
| ID | Identifier | Unique reference |
| i18n | Internationalization | Localization |
| JWT | JSON Web Token | Authentication |
| L10n | Localization | Translation |
| OAuth | Open Authorization | Authentication protocol |
| REST | Representational State Transfer | API style |
| SDK | Software Development Kit | Client library |
| UI | User Interface | Visual elements |
| UX | User Experience | User interaction |
| WCAG | Web Content Accessibility Guidelines | Accessibility standards |

## Norwegian Terms

| Norwegian | English | Context |
|-----------|---------|---------|
| Digdir | Norwegian Digitalisation Agency | Government agency |
| Min Side | My Page | User dashboard |
| Universell Utforming | Universal Design | Accessibility requirements |
| Utsynet | The Outlook | Design theme |
| Altinn | The Electronic Forms Service | Government portal |

## Related Documentation

- [Architecture Overview](../architecture/01-overview.md)
- [Development Workflow](../03-development-workflow.md)
- [Contract-First Guide](../guides/01-contract-first.md)

# System Patterns: Task Tracker Application

## System Architecture
The Task Tracker follows a modern single-page application architecture with server components:
- **Frontend**: Next.js with App Router for client UI rendering and navigation
- **Backend**: Next.js API Routes for data operations
- **Data Layer**: Prisma ORM with SQLite database for persistence

## Key Technical Decisions
1. **Next.js App Router**: Utilizing the latest Next.js features for improved performance and developer experience
2. **Material UI**: Selected for comprehensive component library and theming capabilities
3. **Prisma ORM**: Chosen for type-safe database access and simplified database management
4. **SQLite**: Selected for local persistence without requiring external database setup
5. **SWR**: Used for efficient data fetching with caching and revalidation
6. **Context API**: Selected for state management without additional dependencies

## Design Patterns in Use
1. **Repository Pattern**: Via Prisma client for data access abstraction
2. **Context Provider Pattern**: For theme and global state management
3. **Container/Presenter Pattern**: Separation of data fetching and presentation
4. **Singleton Pattern**: For Prisma client instance

## Component Relationships
1. **Layout Components**: Define the overall structure and common UI elements
2. **Feature Components**: Implement specific task management features
3. **UI Components**: Reusable UI elements built on top of Material UI
4. **API Routes**: Handle data operations and communicate with the database
5. **Service Layer**: Abstracts business logic from UI components

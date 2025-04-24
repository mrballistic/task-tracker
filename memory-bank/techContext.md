# Technical Context: Task Tracker Application

## Technologies Used
- **Frontend Framework**: Next.js 14 with App Router
- **UI Library**: Material UI v5
- **Programming Language**: TypeScript
- **Database**: SQLite
- **ORM**: Prisma
- **Data Fetching**: SWR
- **State Management**: React Context API
- **Deployment Platform**: Vercel (recommended)

## Development Setup
```bash
# Create a new Next.js project with TypeScript
npx create-next-app@latest task-tracker --typescript --eslint --tailwind=false --app --src-dir

# Install Material UI and related dependencies
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled @emotion/server

# Install Prisma and related tools
npm install prisma @prisma/client
npm install -D @types/node

# Install SWR for data fetching
npm install swr

# Initialize Prisma with SQLite
npx prisma init --datasource-provider sqlite

# Create database and generate Prisma client
npx prisma migrate dev --name init
```

## Technical Constraints
1. **Single-User**: Application is designed for individual use, not multi-tenant
2. **Local Database**: Using SQLite for simplified deployment without external database dependencies
3. **Browser Compatibility**: Must support modern browsers (Chrome, Firefox, Safari, Edge)
4. **Responsive Design**: Must function well on mobile, tablet, and desktop devices

## Dependencies
### Core Dependencies
- Next.js 14+
- React 18+
- TypeScript 5+
- Material UI v5
- Prisma ORM
- SWR

### Development Dependencies
- ESLint
- TypeScript type definitions

## Environment Configuration
- DATABASE_URL in .env file for Prisma connection to SQLite database

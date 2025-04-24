# Task Tracker Application - Technical Brief

## Project Overview
A responsive, single-user task tracking application built with Next.js, TypeScript, and Material UI, with Prisma ORM connected to a SQLite database for data persistence.

## Tech Stack
- **Frontend**: Next.js 14 with App Router, TypeScript, Material UI v5
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **State Management**: React Context API + SWR for data fetching
- **Styling**: Material UI with custom theming
- **Deployment**: Vercel (recommended)

## Core Features
1. Task management (CRUD operations)
2. Task categorization and filtering
3. Priority levels and status tracking
4. Due date management with optional reminders
5. Responsive design for all devices
6. Dark/light mode support

## Project Setup Commands

Open your terminal and run the following commands:

```bash
# Create a new Next.js project with TypeScript
npx create-next-app@latest task-tracker --typescript --eslint --tailwind=false --app --src-dir

# Navigate to your project
cd task-tracker

# Install Material UI and related dependencies
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled @emotion/server

# Install Prisma and related tools
npm install prisma @prisma/client
npm install -D @types/node

# Install SWR for data fetching
npm install swr

# Initialize Prisma with SQLite
npx prisma init --datasource-provider sqlite

# Open the project in VSCode
code .
```

## Initial Configuration Steps

1. **Set up Prisma Schema** - Create the following in `prisma/schema.prisma`:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  status      String    @default("TODO") // TODO, IN_PROGRESS, DONE
  priority    Int       @default(2)      // 1 (High), 2 (Medium), 3 (Low)
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  category    String?
  tags        String?   // Store as JSON string
}
```

2. **Create the database and generate Prisma client**:

```bash
npx prisma migrate dev --name init
```

3. **Create a Prisma client singleton** - Create a file at `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

4. **Set up Material UI theme** - Create a file at `src/theme/theme.ts`:

```typescript
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
```

5. **Create MUI provider** - Update `src/app/layout.tsx`:

```tsx
'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme/theme';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Next Steps
After setting up the project structure:

1. Create API routes for task CRUD operations
2. Develop the UI components for task management
3. Implement state management and data fetching
4. Add filtering and sorting functionality
5. Implement responsive design adjustments


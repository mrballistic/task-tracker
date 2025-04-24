# 📝 Task Tracker

A responsive, single-user task tracking application that helps you organize and manage your tasks efficiently!

## 🌟 Features

- ✅ Complete task management with CRUD operations
- 🏷️ Task categorization and filtering
- 🔥 Priority levels and status tracking
- 📅 Due date management with optional reminders
- 📱 Responsive design for all devices
- 🌓 Dark/light mode support

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Material UI v5
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **State Management**: React Context API + SWR for data fetching
- **Styling**: Material UI with custom theming
- **Deployment**: Vercel (recommended)

## 🛠️ Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Next, set up the database:

```bash
# Initialize Prisma with SQLite (if not already done)
npx prisma init --datasource-provider sqlite

# Create database and generate Prisma client
npx prisma migrate dev --name init
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📊 Project Status

### What Works
- ✅ Project initialization with Next.js and TypeScript
- ✅ Material UI setup with initial theme configuration
- ✅ Database schema defined in Prisma
- ✅ Project structure established
- ✅ Prisma client singleton created

### What's Next
- 🔄 API routes for CRUD operations
- 🔄 Task list UI components
- 🔄 Task creation and edit forms
- 🔄 Filtering and sorting capabilities
- 🔄 Task status management
- 🔄 Category management
- 🔄 Priority level implementation
- 🔄 Due date tracking
- 🔄 Dark/light mode toggle
- 🔄 Responsive design adjustments

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Material UI Documentation](https://mui.com/getting-started/usage/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [SWR Documentation](https://swr.vercel.app/)

## 📦 Deployment

The easiest way to deploy your Task Tracker app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

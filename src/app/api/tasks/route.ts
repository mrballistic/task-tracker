import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/tasks - Get all tasks
export async function GET(request: Request) {
  try {
    // Parse URL to get query parameters
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters (optional)
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority') ? parseInt(searchParams.get('priority') as string) : undefined;
    
    // Build filter object based on provided parameters
    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority !== undefined) filter.priority = priority;
    
    // Get tasks with filters applied
    const tasks = await prisma.task.findMany({
      where: filter,
      orderBy: { updatedAt: 'desc' }
    });
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    // Create new task
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || '',
        status: body.status || 'TODO',
        priority: body.priority || 2, // Default to Medium priority
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        category: body.category || null,
        tags: body.tags || null
      }
    });
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper function to check if a task exists
async function getTask(id: string) {
  const task = await prisma.task.findUnique({
    where: { id }
  });
  
  if (!task) {
    return null;
  }
  
  return task;
}

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await getTask(params.id);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error(`Error fetching task ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Check if task exists
    const existingTask = await getTask(params.id);
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: body.title !== undefined ? body.title : existingTask.title,
        description: body.description !== undefined ? body.description : existingTask.description,
        status: body.status !== undefined ? body.status : existingTask.status,
        priority: body.priority !== undefined ? body.priority : existingTask.priority,
        dueDate: body.dueDate !== undefined ? new Date(body.dueDate) : existingTask.dueDate,
        category: body.category !== undefined ? body.category : existingTask.category,
        tags: body.tags !== undefined ? body.tags : existingTask.tags
      }
    });
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(`Error updating task ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if task exists
    const existingTask = await getTask(params.id);
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Delete task
    await prisma.task.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting task ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
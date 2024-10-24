import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

// Store connected users in memory (for demo purposes)
// In production, you'd want to use Redis or a similar solution
let connectedUsers = new Set();

export async function GET() {
  await dbConnect();
  
  // Get the count of users who have been active in the last 5 minutes
  const count = connectedUsers.size;
  
  return NextResponse.json({ count });
}

export async function POST(req: Request) {
  const { username } = await req.json();
  connectedUsers.add(username);
  
  // Remove user after 5 minutes of inactivity
  setTimeout(() => {
    connectedUsers.delete(username);
  }, 5 * 60 * 1000);
  
  return NextResponse.json({ message: 'User connected' });
}

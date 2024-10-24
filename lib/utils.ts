import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const adjectives = ['Happy', 'Clever', 'Brave', 'Calm', 'Eager', 'Gentle', 'Jolly', 'Kind', 'Lively', 'Proud'];
const nouns = ['Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox', 'Wolf', 'Bear', 'Lion', 'Owl', 'Hawk'];

export function generateRandomName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adjective}${noun}${number}`;
}

export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  
  if (!isValid(d)) {
    return 'Invalid date';
  }
  
  try {
    return format(d, "MMM d, yyyy · h:mm a");
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
}

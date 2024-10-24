import { useState, useEffect } from 'react';
import { generateRandomName } from './utils';

export function useUsername() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      const newUsername = generateRandomName();
      localStorage.setItem('username', newUsername);
      setUsername(newUsername);
    }
  }, []);

  return username;
}

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { generateRandomName } from './utils';

export function useUser() {
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      createNewUser();
    }

    // Report user activity
    const reportActivity = async () => {
      if (user?.username) {
        await fetch('/api/users/connected', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user.username }),
        });
      }
    };

    reportActivity();
    const interval = setInterval(reportActivity, 4 * 60 * 1000); // Report every 4 minutes

    return () => clearInterval(interval);
  }, [user?.username]);

  const createNewUser = () => {
    const newUser = {
      id: uuidv4(),
      username: generateRandomName(),
    };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const deleteAccount = async () => {
    localStorage.removeItem('user');
    setUser(null);
    createNewUser();
  };

  return { user, deleteAccount };
}

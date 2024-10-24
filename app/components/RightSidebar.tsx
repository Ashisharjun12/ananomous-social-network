'use client';

import { Button } from "@/components/ui/button";
import { useUser } from '@/lib/useUser';
import Avatar from 'react-avatar';
import { useRouter } from 'next/navigation';

export default function RightSidebar() {
  const { user, deleteAccount } = useUser();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/users/${user.username}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await deleteAccount();
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <div className="w-72 h-screen p-6 border-l border-gray-800 flex flex-col justify-between">
      <div>
        <div className="mb-6 flex items-center p-4 rounded-xl hover:bg-gray-900/50 transition-colors">
          <Avatar 
            name={user?.username || 'A'} 
            size="48" 
            round={true} 
            className="mr-4"
          />
          <div>
            <h2 className="font-bold text-white">{user?.username || 'Loading...'}</h2>
            <p className="text-sm text-gray-400">@{user?.username?.toLowerCase() || 'loading'}</p>
          </div>
        </div>
      </div>
      <Button 
        variant="destructive" 
        onClick={handleDeleteAccount}
        className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
      >
        Delete Account
      </Button>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Home, Search, PlusCircle, User, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from 'next/navigation';
import CreatePost from './CreatePost';
import SearchPopup from './SearchPopup';
import { useUser } from '@/lib/useUser';
import Avatar from 'react-avatar';

export default function Sidebar({ onPostCreated }: { onPostCreated?: () => void }) {
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, deleteAccount } = useUser();

  useEffect(() => {
    const simulateConnectedUsers = () => {
      setConnectedUsers(Math.floor(Math.random() * 100) + 1);
    };

    simulateConnectedUsers();
    const interval = setInterval(simulateConnectedUsers, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleHomeClick = () => {
    if (pathname !== '/') {
      router.push('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        setShowMobileProfile(false);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const isActive = (path: string) => pathname === path || (path === '/' && pathname === '');

  // Mobile Profile Drawer (now from right side)
  const MobileProfile = () => (
    <div 
      className={`fixed inset-y-0 right-0 w-full sm:w-80 bg-black transform transition-transform duration-300 ease-in-out z-50 
        ${showMobileProfile ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="h-full flex flex-col p-6 border-l border-gray-800">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Profile</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowMobileProfile(false)}
          >
            <X size={24} />
          </Button>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <Avatar 
            name={user?.username || 'A'} 
            size="80" 
            round={true}
          />
          <h3 className="text-2xl font-bold">{user?.username}</h3>
          
          <div className="flex items-center space-x-2 mt-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-lg">{connectedUsers} online</span>
          </div>
        </div>

        <div className="mt-auto">
          <Button 
            variant="destructive" 
            onClick={handleDeleteAccount}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );

  // Mobile Bottom Navigation
  const MobileNav = (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 md:hidden z-50">
      <div className="flex justify-around items-center h-16 px-4 backdrop-blur-lg bg-black/80">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleHomeClick}
          className={isActive('/') ? 'text-blue-500' : 'text-gray-300'}
        >
          <Home size={24} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowSearchPopup(true)}
          className="text-gray-300"
        >
          <Search size={24} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowCreatePost(true)}
          className="text-gray-300"
        >
          <PlusCircle size={24} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowMobileProfile(true)}
          className="text-gray-300"
        >
          <Avatar 
            name={user?.username || 'A'} 
            size="24" 
            round={true}
          />
        </Button>
      </div>
    </div>
  );

  // Desktop Sidebar
  const DesktopSidebar = (
    <div className="hidden md:flex w-72 h-screen flex-col justify-between py-6 px-6 border-r border-gray-800">
      <div>
        <h1 className="text-3xl font-bold mb-10">Anonymous Threads</h1>
        <nav className="space-y-6">
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-lg ${isActive('/') ? 'text-blue-500' : 'text-gray-300'}`}
            onClick={handleHomeClick}
          >
            <Home className="mr-4 h-6 w-6" />
            Home
          </Button>
          <Button 
            variant="ghost"
            className="w-full justify-start text-lg text-gray-300"
            onClick={() => setShowCreatePost(true)}
          >
            <PlusCircle className="mr-4 h-6 w-6" />
            Create Post
          </Button>
          <Button 
            variant="ghost"
            className="w-full justify-start text-lg text-gray-300"
            onClick={() => setShowSearchPopup(true)}
          >
            <Search className="mr-4 h-6 w-6" />
            Explore
          </Button>
        </nav>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-lg font-semibold">{connectedUsers} online</span>
      </div>
    </div>
  );

  return (
    <>
      {DesktopSidebar}
      {MobileNav}
      <MobileProfile />
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-black rounded-2xl w-full max-w-md">
            <CreatePost 
              onClose={() => setShowCreatePost(false)} 
              onPostCreated={() => {
                setShowCreatePost(false);
                if (onPostCreated) {
                  onPostCreated();
                }
              }}
            />
          </div>
        </div>
      )}
      {showSearchPopup && (
        <SearchPopup 
          onClose={() => setShowSearchPopup(false)}
        />
      )}
    </>
  );
}

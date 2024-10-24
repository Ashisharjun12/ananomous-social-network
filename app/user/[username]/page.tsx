'use client';

import { useState, useEffect } from 'react';
import Post from '@/app/components/Post';
import Sidebar from '@/app/components/Sidebar';
import RightSidebar from '@/app/components/RightSidebar';

export default function UserPage({ params }: { params: { username: string } }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      const response = await fetch(`/api/posts?username=${params.username}`);
      const data = await response.json();
      setPosts(data);
    };

    fetchUserPosts();
  }, [params.username]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-grow overflow-y-auto no-scrollbar border-x border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Posts by {params.username}</h1>
          <div className="space-y-4">
            {posts.map((post) => (
              <Post key={post._id} post={post} onDelete={() => {}} onUpdate={() => {}} />
            ))}
          </div>
        </div>
      </main>
      <RightSidebar />
    </div>
  );
}

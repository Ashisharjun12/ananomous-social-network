'use client';  // Add this line at the top of the file

import { useState, useEffect } from 'react';
import Timeline from "./components/Timeline";
import Sidebar from "./components/Sidebar";
import RightSidebar from "./components/RightSidebar";

export default function Home() {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const response = await fetch('/api/posts');
    const data = await response.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onPostCreated={fetchPosts} />
      <main className="flex-grow overflow-y-auto no-scrollbar border-x border-gray-800 pb-16 md:pb-0">
        <div className="max-w-3xl mx-auto">
          <Timeline posts={posts} />
        </div>
      </main>
      <div className="hidden md:block">
        <RightSidebar />
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Post from './Post';
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';
import CreatePost from './CreatePost';

export default function Timeline() {
  const [posts, setPosts] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const response = await fetch('/api/posts');
    const data = await response.json();
    setPosts(data);
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {posts.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center">
          <p className="text-xl mb-4">No posts yet. Be the first to create one!</p>
          <Button 
            onClick={() => setShowCreatePost(true)}
            className="flex items-center"
          >
            <PlusCircle className="mr-2" size={20} />
            Create a new post
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Post 
              key={post._id} 
              post={post} 
              onDelete={handlePostDelete}
              onUpdate={handlePostUpdate}
            />
          ))}
        </div>
      )}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-full max-w-md">
            <CreatePost onClose={() => setShowCreatePost(false)} onPostCreated={fetchPosts} />
          </div>
        </div>
      )}
    </div>
  );
}

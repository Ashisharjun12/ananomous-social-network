'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, X } from 'lucide-react';
import { useUser } from '@/lib/useUser';
import Avatar from 'react-avatar';

export default function CreatePost({ onClose, onPostCreated }: { onClose: () => void, onPostCreated?: () => void }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('content', content);
    formData.append('authorUsername', user.username);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setContent('');
        setImage(null);
        setImagePreview(null);
        onClose();
        if (onPostCreated) {
          onPostCreated();
        }
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-black rounded-2xl p-6 max-w-lg w-full mx-auto">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
      >
        <X size={24} />
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex space-x-4">
          <Avatar 
            name={user?.username || 'A'} 
            size="48" 
            round={true} 
            className="flex-shrink-0"
          />
          <div className="flex-grow">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start a thread..."
              className="w-full bg-transparent border-none resize-none focus:ring-0 text-lg text-white placeholder-gray-500"
              rows={4}
            />
            {imagePreview && (
              <div className="relative mt-4 rounded-xl overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-[300px] w-full object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <label 
            htmlFor="image-upload" 
            className="cursor-pointer text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
          >
            <Image size={24} />
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className={`bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition-colors
                ${(!content.trim() || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

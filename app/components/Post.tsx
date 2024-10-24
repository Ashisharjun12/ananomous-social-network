'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from 'react-use';
import Comment from './Comment';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  SendIcon 
} from 'lucide-react';
import { useUser } from '@/lib/useUser';
import { formatDate } from '@/lib/utils';
import Avatar from 'react-avatar';

const COMMENTS_TO_SHOW = 2;

export default function Post({ post, onDelete, onUpdate }) {
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [likes, setLikes] = useState(post.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useUser();

  // Store liked posts in localStorage
  const [likedPosts, setLikedPosts] = useLocalStorage<string[]>('likedPosts', []);

  useEffect(() => {
    if (user && post.likedByUsers) {
      setHasLiked(post.likedByUsers.includes(user.id));
    }
  }, [user, post.likedByUsers]);

  const handleAddComment = async () => {
    if (!user) return;
    setIsCommenting(true);
    try {
      const response = await fetch(`/api/posts/${post._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, authorUsername: user.username }),
      });
      const data = await response.json();
      setComments([...comments, data]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleEdit = async () => {
    setIsEditing(true);
    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent, authorUsername: user.username }),
      });

      if (response.ok) {
        onUpdate({ ...post, content: editedContent });
      }
    } catch (error) {
      console.error('Failed to edit post:', error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorUsername: user.username }),
      });

      if (response.ok) {
        onDelete(post._id);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLike = async () => {
    if (!user || isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes);
        setHasLiked(data.hasLiked);
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const visibleComments = showAllComments ? comments : comments.slice(0, COMMENTS_TO_SHOW);

  const isAuthor = user && user.username === post.authorUsername;

  const handleCommentUpdate = (updatedComment) => {
    setComments(comments.map(comment => 
      comment._id === updatedComment._id ? updatedComment : comment
    ));
  };

  const handleCommentDelete = (deletedCommentId) => {
    setComments(comments.filter(comment => comment._id !== deletedCommentId));
  };

  return (
    <div className="border-b border-gray-700 p-6">
      <div className="flex">
        <Avatar name={post.authorUsername} size="48" round={true} className="mr-4 flex-shrink-0" />
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl mr-2">{post.authorUsername}</h3>
              <span className="text-gray-400 text-sm">
                {formatDate(post.createdAt)}
              </span>
            </div>
            {isAuthor && (
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDelete}>
                  <Trash2 size={16} />
                </Button>
              </div>
            )}
          </div>
          {isEditing ? (
            <Input
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="mt-3 text-lg bg-gray-800 text-white"
            />
          ) : (
            <>
              <p className="mt-3 text-lg">{post.content}</p>
              {post.imageUrl && (
                <div className="mt-3 max-w-full overflow-hidden rounded-lg">
                  <img 
                    src={post.imageUrl} 
                    alt="Post image" 
                    className="w-full h-auto object-contain"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              )}
            </>
          )}
          <div className="flex mt-4 space-x-4">
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className="relative group flex items-center space-x-2"
            >
              <motion.div
                whileTap={{ scale: 0.8 }}
                className="relative"
              >
                <Heart 
                  size={20} 
                  className={`${hasLiked 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-400 group-hover:text-red-500'} 
                    transition-colors`}
                />
                {isLiking && (
                  <motion.div
                    className="absolute inset-0 bg-red-500/20 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
              {likes > 0 && (
                <span className={`text-sm ${hasLiked ? 'text-red-500' : 'text-gray-400'}`}>
                  {likes}
                </span>
              )}
            </button>
            <button className="text-gray-400 hover:text-white flex items-center">
              <MessageCircle size={20} className="mr-1" />
              <span>{comments.length}</span>
            </button>
            <button className="text-gray-400 hover:text-white">
              <Share2 size={20} />
            </button>
          </div>
          {isEditing && (
            <div className="mt-2">
              <Button onClick={handleEdit} className="mr-2">Save</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full bg-gray-900 border-gray-700 pr-10 text-white text-sm rounded-xl"
            />
            <button
              onClick={handleAddComment}
              disabled={isCommenting || !newComment.trim()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full transition-all text-sm font-medium
                ${newComment.trim() 
                  ? 'text-blue-500 hover:bg-blue-500/20' 
                  : 'text-gray-500 cursor-not-allowed'
                }`}
            >
              <SendIcon size={18} className={`transform rotate-45 transition-transform
                ${newComment.trim() ? 'scale-100' : 'scale-90'}`}
              />
            </button>
          </div>
        </div>
        {comments.length > 0 && (
          <div className="mt-4">
            <Separator className="my-4" />
            <Button
              variant="ghost"
              size="sm"
              className="mb-2 text-gray-400 hover:text-white"
              onClick={() => setShowComments(!showComments)}
            >
              {showComments ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide comments
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show comments ({comments.length})
                </>
              )}
            </Button>
            {showComments && (
              <div className="space-y-4">
                {visibleComments.map((comment) => (
                  <Comment 
                    key={comment._id} 
                    comment={comment} 
                    postId={post._id}
                    onCommentUpdate={handleCommentUpdate}
                    onCommentDelete={handleCommentDelete}
                  />
                ))}
                {comments.length > COMMENTS_TO_SHOW && !showAllComments && (
                  <Button 
                    variant="link" 
                    onClick={() => setShowAllComments(true)}
                    className="mt-2 text-gray-400 hover:text-white text-sm"
                  >
                    View all {comments.length} comments
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

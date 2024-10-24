'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from '@/lib/useUser';
import { formatDate } from '@/lib/utils';
import Avatar from 'react-avatar';
import { Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function Comment({ comment, postId, depth = 0, onCommentUpdate, onCommentDelete }) {
  const [replies, setReplies] = useState(comment.replies || []);
  const [newReply, setNewReply] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const { user } = useUser();

  const handleReplyDelete = async (replyId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(
        `/api/posts/${postId}/comments/${comment._id}/replies/${replyId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authorUsername: user.username }),
        }
      );

      if (response.ok) {
        setReplies(replies.filter(reply => reply._id !== replyId));
      }
    } catch (error) {
      console.error('Failed to delete reply:', error);
    }
  };

  const handleAddReply = async () => {
    if (!user || !newReply.trim()) return;
    setIsReplying(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments/${comment._id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newReply, authorUsername: user.username }),
      });
      const data = await response.json();
      setReplies([...replies, data]);
      setNewReply('');
    } catch (error) {
      console.error('Failed to add reply:', error);
    } finally {
      setIsReplying(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/posts/${postId}/comments/${comment._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorUsername: user.username }),
      });
      if (response.ok) {
        onCommentDelete(comment._id);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleReplyEdit = async (replyId: string, newContent: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(
        `/api/posts/${postId}/comments/${comment._id}/replies/${replyId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            content: newContent, 
            authorUsername: user.username 
          }),
        }
      );

      if (response.ok) {
        // Update the reply in local state
        setReplies(replies.map(reply => 
          reply._id === replyId 
            ? { ...reply, content: newContent, isEditing: false } 
            : reply
        ));
      }
    } catch (error) {
      console.error('Failed to edit reply:', error);
    }
  };

  const handleEdit = async () => {
    if (!user || editedContent === comment.content) return;
    
    try {
      const response = await fetch(`/api/posts/${postId}/comments/${comment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: editedContent, 
          authorUsername: user.username 
        }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        onCommentUpdate(updatedComment);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  return (
    <div className={`relative ${depth > 0 ? 'ml-10' : ''}`}>
      <div className="flex items-start space-x-3">
        <Avatar name={comment.authorUsername} size="32" round={true} />
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-sm">{comment.authorUsername}</p>
              <span className="text-xs text-gray-400">·</span>
              <p className="text-xs text-gray-400">{formatDate(comment.createdAt)}</p>
            </div>
            {user && user.username === comment.authorUsername && !isEditing && (
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDelete}>
                  <Trash2 size={14} />
                </Button>
              </div>
            )}
          </div>
          {isEditing ? (
            <div className="mt-1">
              <Input
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="text-sm bg-transparent border-none focus:ring-0 p-0"
                autoFocus
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={handleEdit}
                  className="px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors text-sm font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm mt-1">{comment.content}</p>
          )}
        </div>
      </div>

      {/* Reply Input */}
      <div className="mt-2 ml-10">
        <div className="relative flex-grow">
          <Input
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Write a reply..."
            className="w-full bg-gray-900 border-gray-700 pr-20 text-white text-sm rounded-xl"
          />
          <button
            onClick={handleAddReply}
            disabled={isReplying || !newReply.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full transition-all text-sm font-medium
              ${newReply.trim() 
                ? 'text-blue-500 hover:bg-blue-500/20' 
                : 'text-gray-500 cursor-not-allowed'
              }`}
          >
            {isReplying ? 'Replying...' : 'Reply'}
          </button>
        </div>
      </div>

      {/* Replies Section */}
      {replies.length > 0 && (
        <div className="mt-2 ml-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplies(!showReplies)}
            className="mb-2 text-gray-400 hover:text-white flex items-center space-x-2"
          >
            {showReplies ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>Hide replies ({replies.length})</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>Show replies ({replies.length})</span>
              </>
            )}
          </Button>

          {showReplies && (
            <div className="space-y-4">
              {replies.map((reply) => (
                <div key={reply._id} className="flex items-start space-x-3">
                  <Avatar name={reply.authorUsername} size="32" round={true} />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-sm">{reply.authorUsername}</p>
                        <span className="text-xs text-gray-400">·</span>
                        <p className="text-xs text-gray-400">{formatDate(reply.createdAt)}</p>
                      </div>
                      {user && user.username === reply.authorUsername && !reply.isEditing && (
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setReplies(replies.map(r => 
                              r._id === reply._id ? { ...r, isEditing: true, editedContent: r.content } : r
                            ))}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleReplyDelete(reply._id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                    {reply.isEditing ? (
                      <div className="mt-1">
                        <Input
                          value={reply.editedContent}
                          onChange={(e) => setReplies(replies.map(r => 
                            r._id === reply._id ? { ...r, editedContent: e.target.value } : r
                          ))}
                          className="text-sm bg-transparent border-none focus:ring-0 p-0"
                          autoFocus
                        />
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleReplyEdit(reply._id, reply.editedContent)}
                            className="px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors text-sm font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setReplies(replies.map(r => 
                              r._id === reply._id ? { ...r, isEditing: false } : r
                            ))}
                            className="px-4 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm mt-1">{reply.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

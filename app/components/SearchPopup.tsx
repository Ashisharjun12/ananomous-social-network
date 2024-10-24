'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Avatar from 'react-avatar';
import { X, Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  username: string;
  postCount: number;
  latestPost: string;
}

export default function SearchPopup({ onClose }: { onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setError('');
    
    try {
      const response = await fetch(`/api/users/search?username=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSearchResults(data);
      
      if (data.length === 0) {
        setError('No users found');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search users');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (username: string) => {
    router.push(`/user/${username}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-black rounded-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Search Users</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by username..."
              className="w-full bg-gray-900 border-gray-700 pl-10 pr-4 py-2 text-white placeholder-gray-500 rounded-xl"
              autoFocus
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2"
          >
            {isSearching ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" size={18} />
                Searching...
              </span>
            ) : (
              'Search'
            )}
          </Button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {error ? (
            <div className="p-4 text-center text-gray-400">{error}</div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              {searchTerm ? 'Start typing to search users' : 'No results found'}
            </div>
          ) : (
            <div className="p-2">
              {searchResults.map((result) => (
                <div 
                  key={result.username} 
                  onClick={() => handleUserSelect(result.username)}
                  className="flex items-center p-3 hover:bg-gray-900 rounded-xl cursor-pointer transition-colors"
                >
                  <Avatar 
                    name={result.username} 
                    size="40" 
                    round={true} 
                    className="mr-3"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold text-white">{result.username}</p>
                    <p className="text-sm text-gray-400">
                      {result.postCount === 0 
                        ? 'No posts yet' 
                        : `${result.postCount} post${result.postCount > 1 ? 's' : ''}`
                      }
                    </p>
                  </div>
                  <div className="text-gray-400 hover:text-white">
                    <Search size={16} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

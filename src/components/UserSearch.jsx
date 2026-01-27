import React, { useState, useEffect } from "react";
import { searchUsers } from "../api/userApi";
import { Search } from "lucide-react";

const UserSearch = ({ onUserSelect }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setUsers([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const result = await searchUsers(query);
        setUsers(result);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <input
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 pl-10 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute left-3 top-3.5 text-gray-400">
          🔍
        </div>
      </div>

      
      {query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
          
          <div className="px-4 py-2 border-b text-sm font-semibold text-gray-600 bg-gray-50">
            {isSearching ? "Searching..." : "Search Results"}
          </div>

          {users.length > 0 ? (
            users.map((u) => (
              <div
                key={u.id}
                onClick={() => {
                  onUserSelect(u);
                  setQuery(""); 
                  setUsers([]);
                }}
                className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              >
                
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                  {u.firstName?.[0]?.toUpperCase() || u.username?.[0]?.toUpperCase() || "U"}
                </div>
                
                
                <div className="flex-1">
                  <div className="font-medium">
                    {u.firstName} {u.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    @{u.username || "user"}
                  </div>
                </div>
                
                
                <div className="text-gray-400 text-sm">
                  Chat →
                </div>
              </div>
            ))
          ) : query.trim() && !isSearching ? (
            <div className="p-4 text-center text-gray-500">
              No users found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
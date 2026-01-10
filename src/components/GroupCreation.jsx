import { useState } from "react";
import API from "../api/axiosInstance";

const GroupCreation = ({ users, refreshConversations }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const createGroup = async () => {
    try {
      const res = await API.post(`/conversations/group?groupName=${groupName}`, selectedUsers);
      console.log("Group created:", res.data);
      refreshConversations();
    } catch (err) {
      console.error("Failed to create group:", err);
    }
  };

  return (
    <div className="border p-2 rounded mb-4">
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className="border p-1 rounded mb-2 w-full"
      />
      <div className="mb-2 max-h-40 overflow-y-auto">
        {users.map((u) => (
          <div key={u.id}>
            <label>
              <input
                type="checkbox"
                checked={selectedUsers.includes(u.id)}
                onChange={() => toggleUser(u.id)}
              />
              {u.username}
            </label>
          </div>
        ))}
      </div>
      <button
        onClick={createGroup}
        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 w-full"
      >
        Create Group
      </button>
    </div>
  );
};

export default GroupCreation;

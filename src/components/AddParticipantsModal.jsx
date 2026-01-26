import { useEffect, useState } from "react";
import { addParticipants } from "../api/conversationApi";
import { getAllUsers } from "../api/userApi";
import { toast } from "react-toastify";

const AddParticipantsModal = ({
  isOpen,
  onClose,
  conversation,
  onParticipantsAdded,
}) => {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  

 

  /* ----------------------------------
     Fetch & filter users
  -----------------------------------*/
  useEffect(() => {
    if (!isOpen || !conversation) return;

    const fetchUsers = async () => {
      const { data } = await getAllUsers();

      const existingUserIds = conversation.participants.map(
        (p) => p.userId
      );
      console.log("Existing participant IDs:", existingUserIds);

      const filtered = data.filter(
        (u) => !existingUserIds.includes(u.id)
      );
      console.log("Filtered users:", filtered);

      setUsers(filtered);
    };

    fetchUsers();
  }, [conversation,isOpen]);
  console.log("Modal users:", users);
   if (!isOpen) return null;

  /* ----------------------------------
     Toggle checkbox
  -----------------------------------*/
  const toggleUser = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };
  console.log("Selected IDs:", selectedIds);

  /* ----------------------------------
     Submit
  -----------------------------------*/
  const handleAdd = async () => {
  if (selectedIds.length === 0) return;

  try {
    setLoading(true);
    const res = await addParticipants(conversation.id, selectedIds);

    // 1. Check if the backend actually says 'success'
    if (res && (res.success || res.data)) {
      toast.success(res.message || "Participants added");

      // 2. Use optional chaining (?.) to prevent crashes
      if (onParticipantsAdded) {
        onParticipantsAdded(res.data || res); 
      }
      
      onClose();
      setSelectedIds([]);
    } else {
      // This handles cases where the server returns 200 but success is false
      throw new Error("Server returned unsuccessful");
    }

  } catch (err) {
    console.error("Add Participant Error:", err);
    // Only show error toast if we haven't already succeeded
    toast.error("Failed to add participants");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[420px] rounded-lg bg-white shadow-lg">

        {/* Header */}
        <div className="border-b px-4 py-3 font-semibold">
          Add Participants
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          <div className="max-h-64 overflow-y-auto space-y-1">

            {users.length === 0 && (
              <p className="text-sm text-gray-500 text-center">
                No users to add
              </p>
            )}

            {users.map((user) => (
              <label
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(user.id)}
                  onChange={() => toggleUser(user.id)}
                  className="accent-blue-600"
                />

                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {user.username || user.email}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-4 py-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleAdd}
            disabled={selectedIds.length === 0 || loading}
            className="px-4 py-2 text-sm rounded text-white bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddParticipantsModal;

import API from "../api/axiosInstance";

const UserList = ({ users, setSelectedConversation }) => {
  const handlePrivateChat = async (userId) => {
    try {
      // user1Id = current user (from backend token)
      const res = await API.post(`/conversations/private?user1Id=${localStorage.getItem("userId")}&user2Id=${userId}`);
      setSelectedConversation(res.data.data);
    } catch (err) {
      console.error("Failed to create/get private conversation:", err);
    }
  };

  return (
    <div>
      {users.map((u) => (
        <div
          key={u.id}
          className="p-2 cursor-pointer hover:bg-gray-200 rounded"
          onClick={() => handlePrivateChat(u.id)}
        >
          {u.username}
        </div>
      ))}
    </div>
  );
};

export default UserList;

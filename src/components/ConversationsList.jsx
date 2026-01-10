const ConversationsList = ({ conversations, setSelectedConversation }) => {
  return (
    <div>
      {conversations.map((c) => (
        <div
          key={c.id}
          className="p-2 cursor-pointer hover:bg-gray-200 rounded"
          onClick={() => setSelectedConversation(c)}
        >
          {c.group ? c.name : c.participants.map(p => p.username).join(", ")}
        </div>
      ))}
    </div>
  );
};

export default ConversationsList;

import API from "../utils/axiosInstance";
/**
 * Add participants to an existing conversation
 *
 * @param {number} conversationId - ID of the conversation
 * @param {number[]} participantIds - Array of user IDs to add
 * @returns {Promise<Object>} Updated ConversationDto
 */
export const addParticipants = async (conversationId, participantIds) => {
  const response = await API.post(
    `/conversations/${conversationId}/participants`,
    participantIds
  );

  return response.data;
};
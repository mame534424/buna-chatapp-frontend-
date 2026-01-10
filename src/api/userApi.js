import API from "../utils/axiosInstance";

export const getCurrentUser = async () => {
  try {
    // Step 1: Get current user ID
    const { data: userId } = await API.get("/users/me");
    console.log("Current user ID from /users/me:", userId);

    // Step 2: Get all users
    const { data: allUsers } = await API.get("/users");
    console.log("All users from /users:", allUsers);

    // Step 3: Find the current user object
    const user = allUsers.find((u) => u.id === userId);
    console.log("Current user object:", user);

    if (!user) {
      throw new Error("Current user not found in users list");
    }

    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

export const getAllUsers = () => API.get("/users");

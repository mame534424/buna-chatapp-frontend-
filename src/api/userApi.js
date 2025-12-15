import API from "../utils/axiosInstance";

export const getCurrentUser = () => API.get("/users/me");
export const getAllUsers = () => API.get("/users");

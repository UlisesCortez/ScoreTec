import axiosClient from "./axiosClient";

export const getUsersRequest = async () => {
  const response = await axiosClient.get("/users");
  return response.data;
};

export const createUserRequest = async (data) => {
  const response = await axiosClient.post("/users", data);
  return response.data;
};

export const updateUserRequest = async (id, data) => {
  const response = await axiosClient.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUserRequest = async (id) => {
  const response = await axiosClient.delete(`/users/${id}`);
  return response.data;
};

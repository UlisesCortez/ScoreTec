import axiosClient from "./axiosClient";

export const getPlayersRequest = async () => {
  const response = await axiosClient.get("/players");
  return response.data;
};

export const getPlayerByIdRequest = async (id) => {
  const response = await axiosClient.get(`/players/${id}`);
  return response.data;
};

export const createPlayerRequest = async (data) => {
  const response = await axiosClient.post("/players", data);
  return response.data;
};

export const updatePlayerRequest = async (id, data) => {
  const response = await axiosClient.put(`/players/${id}`, data);
  return response.data;
};

export const deletePlayerRequest = async (id) => {
  const response = await axiosClient.delete(`/players/${id}`);
  return response.data;
};

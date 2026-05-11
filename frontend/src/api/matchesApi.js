import axiosClient from "./axiosClient";

export const getMatchesRequest = async () => {
  const response = await axiosClient.get("/matches");
  return response.data;
};

export const getMatchByIdRequest = async (id) => {
  const response = await axiosClient.get(`/matches/${id}`);
  return response.data;
};

export const createMatchRequest = async (data) => {
  const response = await axiosClient.post("/matches", data);
  return response.data;
};

export const updateMatchRequest = async (id, data) => {
  const response = await axiosClient.put(`/matches/${id}`, data);
  return response.data;
};

export const cancelMatchRequest = async (id) => {
  const response = await axiosClient.patch(`/matches/${id}/cancel`);
  return response.data;
};

export const startMatchRequest = async (id) => {
  const response = await axiosClient.patch(`/matches/${id}/start`);
  return response.data;
};

export const finishMatchRequest = async (id) => {
  const response = await axiosClient.patch(`/matches/${id}/finish`);
  return response.data;
};

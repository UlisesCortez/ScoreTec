import axiosClient from "./axiosClient";

export const getTeamsRequest = async () => {
  const response = await axiosClient.get("/teams");
  return response.data;
};

export const getTeamByIdRequest = async (id) => {
  const response = await axiosClient.get(`/teams/${id}`);
  return response.data;
};

export const createTeamRequest = async (data) => {
  const response = await axiosClient.post("/teams", data);
  return response.data;
};

export const updateTeamRequest = async (id, data) => {
  const response = await axiosClient.put(`/teams/${id}`, data);
  return response.data;
};

export const deleteTeamRequest = async (id) => {
  const response = await axiosClient.delete(`/teams/${id}`);
  return response.data;
};

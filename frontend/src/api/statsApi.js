import axiosClient from "./axiosClient";

export const getTeamStatsRequest = async () => {
  const response = await axiosClient.get("/stats/teams");
  return response.data;
};

export const getPlayerStatsRequest = async () => {
  const response = await axiosClient.get("/stats/players");
  return response.data;
};

export const getMatchStatsRequest = async (id) => {
  const response = await axiosClient.get(`/stats/matches/${id}`);
  return response.data;
};

export const getDisciplineStatsRequest = async (id) => {
  const response = await axiosClient.get(`/stats/disciplines/${id}`);
  return response.data;
};

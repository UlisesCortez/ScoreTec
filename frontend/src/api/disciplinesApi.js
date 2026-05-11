import axiosClient from "./axiosClient";

export const getDisciplinesRequest = async () => {
  const response = await axiosClient.get("/disciplines");
  return response.data;
};

export const createDisciplineRequest = async (data) => {
  const response = await axiosClient.post("/disciplines", data);
  return response.data;
};

export const updateDisciplineRequest = async (id, data) => {
  const response = await axiosClient.put(`/disciplines/${id}`, data);
  return response.data;
};

export const deleteDisciplineRequest = async (id) => {
  const response = await axiosClient.delete(`/disciplines/${id}`);
  return response.data;
};

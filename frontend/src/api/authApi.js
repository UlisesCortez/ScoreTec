import axiosClient from "./axiosClient";

export const loginRequest = async (credentials) => {
  const response = await axiosClient.post("/auth/login", credentials);
  return response.data;
};

export const googleLoginRequest = async (credential) => {
  const response = await axiosClient.post("/auth/google", { credential });
  return response.data;
};

export const meRequest = async () => {
  const response = await axiosClient.get("/auth/me");
  return response.data;
};

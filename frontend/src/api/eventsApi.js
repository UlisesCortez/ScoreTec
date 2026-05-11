import axiosClient from "./axiosClient";

export const getEventsByMatchRequest = async (matchId) => {
  const response = await axiosClient.get(`/matches/${matchId}/events`);
  return response.data;
};

export const createEventRequest = async (matchId, data) => {
  const response = await axiosClient.post(`/matches/${matchId}/events`, data);
  return response.data;
};

export const updateEventRequest = async (eventId, data) => {
  const response = await axiosClient.put(`/events/${eventId}`, data);
  return response.data;
};

export const deleteEventRequest = async (eventId) => {
  const response = await axiosClient.delete(`/events/${eventId}`);
  return response.data;
};

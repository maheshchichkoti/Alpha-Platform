// src/api/index.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getPeople = () => api.get("/people");
export const enrichPerson = (personId: string) =>
  api.post(`/enrich/${personId}`);
export const getCompanySnippets = (companyId: string) =>
  api.get(`/company/${companyId}/snippets`);

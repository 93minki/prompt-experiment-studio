import axios from "axios";

export const http = axios.create({
  baseURL: "http://192.168.0.86:8000",
  headers: { "Content-Type": "application/json" },
});

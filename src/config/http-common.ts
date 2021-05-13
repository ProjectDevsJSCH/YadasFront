import axios from "axios";
import router, { routes } from "@/router/index";
import { registerPaths } from "../router/route-discovery";

const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  timeout: 1000 * 60, // 60 Seconds
  proxy: false
});

axiosInstance.interceptors.request.use(config => {
  // eslint-disable-next-line no-param-reassign
  config.headers.common.Authorization = `Bearer ${localStorage.getItem("token")}`;

  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error?.response?.data?.error?.statusCode === 401) {
      localStorage.removeItem("token");
      router.push("/login");
    }

    return Promise.reject(error);
  }
);

registerPaths(axiosInstance, routes).then(() => {
  console.log("Routes registered");
});

export default axiosInstance;

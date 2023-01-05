import { axios } from "@/lib/axios";
import { UserState } from "../auth/authSlice";

const getProjects = (user: UserState) => {
  return axios.get("/projects", {
    headers: {
        Authorization: `Bearer ${user.token}`,
    }
  });
};

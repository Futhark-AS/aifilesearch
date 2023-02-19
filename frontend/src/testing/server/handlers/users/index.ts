import { rest } from "msw";

import { API_URL } from "@/config";

import { UsersApiUrls } from "@/features/users/api/urls";
import { updateProfile } from "./resolvers";

export const userHandlers = [
  rest.patch(`${API_URL}${UsersApiUrls.updateProfile}`, updateProfile)
]
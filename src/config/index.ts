import { accessToken } from "../utils/credentials";

export const apiUrl = "https://api.github.com/";

export const headers = {
  Authorization: `token ${accessToken}`
};

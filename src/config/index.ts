import { accessToken } from "../oauth-tokens";

export const apiUrl = "https://api.github.com/";

export const headers = {
  Authorization: `token ${accessToken}`
};

import { BASE_URL } from "../constants";

export const getBackendAssetUrl = (assetPath: string) => {
  const origin = BASE_URL.replace(/\/api\/?$/, "");
  return `${origin}${assetPath}`;
};

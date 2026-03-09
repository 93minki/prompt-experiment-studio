import { http } from "@/shared/api/http";
import type { Provider, ProviderKeyRow } from "../model/types";

export const providerKeyApi = {
  async list(): Promise<ProviderKeyRow[]> {
    const { data } = await http.get<ProviderKeyRow[]>("/llm-api-keys");
    return data;
  },

  async update(provider: Provider, apiKey: string): Promise<void> {
    await http.post("/llm-api-keys/", { provider, api_key: apiKey });
  },

  async remove(provider: Provider): Promise<void> {
    await http.delete(`/llm-api-keys/${provider}`);
  },
};

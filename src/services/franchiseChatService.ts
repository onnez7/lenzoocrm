import { api } from "@/config/api";

export interface FranchiseChannel {
  id: number;
  franchise_id: number;
  name: string;
  created_by: number;
  is_private: boolean;
  created_at: string;
}

export interface FranchiseChannelMessage {
  id: number;
  channel_id: number;
  user_id: number;
  message: string;
  created_at: string;
  author_name?: string;
  author_role?: string;
}

export interface FranchiseMember {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

class FranchiseChatService {
  async getMyChannels(token: string): Promise<FranchiseChannel[]> {
    const res = await api.get("/chat/franchise-channels", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }

  async createChannel(
    data: { name: string; is_private: boolean; memberIds: number[] },
    token: string
  ): Promise<FranchiseChannel> {
    const res = await api.post("/chat/franchise-channels", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }

  async deleteChannel(id: number, token: string) {
    return api.delete(`/chat/franchise-channels/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async addMembers(id: number, memberIds: number[], token: string) {
    return api.post(
      `/chat/franchise-channels/${id}/members`,
      { memberIds },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  async removeMember(id: number, userId: number, token: string) {
    return api.delete(`/chat/franchise-channels/${id}/members/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getChannelMessages(channelId: number, token: string): Promise<FranchiseChannelMessage[]> {
    const res = await api.get(`/chat/franchise-channels/${channelId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }

  async sendMessage(channelId: number, message: string, token: string) {
    return api.post(
      `/chat/franchise-channels/${channelId}/messages`,
      { message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  async getFranchiseMembers(franchiseId: number, token: string): Promise<FranchiseMember[]> {
    const res = await api.get(`/franchises/${franchiseId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }
}

export const franchiseChatService = new FranchiseChatService();
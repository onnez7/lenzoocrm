// src/services/supportService.ts
import { api } from "@/config/api";

export interface SupportTicket {
  id: number;
  franchise_id: number;
  user_id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
  opened_by?: string;
  franchise_name?: string;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  created_at: string;
  author_name?: string;
  author_role?: string;
}

class SupportService {
  async createTicket(data: { title: string; description: string; priority: string; category: string }, token: string) {
    const res = await api.post("/support/tickets", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }

  async getMyTickets(token: string): Promise<SupportTicket[]> {
    const res = await api.get("/support/tickets", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }

  async getAllTickets(token: string): Promise<SupportTicket[]> {
    const res = await api.get("/support/tickets/all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }

  async getTicketById(id: number, token: string): Promise<SupportTicket> {
    const res = await api.get(`/support/tickets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }

  async getTicketMessages(id: number, token: string): Promise<TicketMessage[]> {
    const res = await api.get(`/support/tickets/${id}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }

  async addTicketMessage(id: number, message: string, token: string) {
    const res = await api.post(
      `/support/tickets/${id}/messages`,
      { message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  }
}

export const supportService = new SupportService();
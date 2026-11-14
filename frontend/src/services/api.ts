import axios from "axios";

// Backend API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001";
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_API_KEY || "adm_kinsai_sec_8f92b7c4e1a06d29";

// Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor to attach admin token for administrative operations
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kinsai_admin_token") || ADMIN_TOKEN;
  if (token) {
    config.headers["X-Admin-Token"] = token;
  }
  return config;
});

// Enquiry interface
export interface Enquiry {
  id: string;
  customer_name: string;
  phone_number: string;
  email: string | null;
  message: string;
  source: string;
  status: string;
  created_at: string;
}

// Create enquiry interface
export interface EnquiryCreate {
  customer_name: string;
  phone_number: string;
  email?: string;
  message: string;
  source?: string;
}

// API response interface
export interface EnquiryCreateResponse {
  success: boolean;
  message: string;
  enquiry_id: string;
}

export type CallbackStatus = "pending_review" | "contacted" | "completed" | "cancelled";

export interface CallbackRequest {
  id: string;
  customer_name: string;
  phone_number: string;
  preferred_time: string;
  reason: string | null;
  status: CallbackStatus | string;
  created_at: string;
  updated_at?: string | null;
  follow_up_notes?: string | null;
  updated_by?: string | null;
}

export interface CallbackUpdatePayload {
  status?: CallbackStatus | string;
  follow_up_notes?: string;
  updated_by?: string;
}

export interface CallbackUpdateResponse {
  success: boolean;
  message: string;
  callback: CallbackRequest;
}

export interface CallbackStats {
  total: number;
  pending_review: number;
  contacted: number;
  completed: number;
  cancelled: number;
}

export interface GeminiQualification {
  intent: string;
  lead_priority: "High" | "Medium" | "Low" | string;
  customer_sentiment: "Positive" | "Neutral" | "Negative" | string;
  summary: string;
  recommended_action: string;
  follow_up_message: string;
}

export interface QualifyResponse {
  success: boolean;
  message: string;
  customer_name: string;
  enquiry_id: string;
  ai_analysis: GeminiQualification;
}

export interface VoiceAgentInfo {
  agent_name: string;
  agent_id: string;
  provider: string;
  version: string;
  engine_readiness: string;
  voice_readiness: string;
  supported_languages: string[];
  default_language: string;
  callback_tool: {
    name: string;
    type: string;
    endpoint: string;
    auth: string;
    status: string;
  };
  description: string;
}

export interface TestCallDispatchPayload {
  customer_name: string;
  phone_number: string;
  language: string;
}

export interface TestCallDispatchResponse {
  success: boolean;
  call_id: string;
  customer_name: string;
  phone_number: string;
  language: string;
  status: string;
  message: string;
  dispatched_at: string;
}

export interface CallLogItem {
  call_id: string;
  customer_name: string;
  phone_number: string;
  language: string;
  status: string;
  dispatched_at: string;
  notes?: string;
}

// Enquiry API services
export const enquiryService = {
  // Fetch all enquiries
  getAll: async (): Promise<Enquiry[]> => {
    const response = await api.get<Enquiry[]>("/api/v1/enquiries");
    return response.data;
  },

  // Create a new enquiry
  create: async (
    data: EnquiryCreate
  ): Promise<EnquiryCreateResponse> => {
    const response = await api.post<EnquiryCreateResponse>(
      "/api/v1/enquiries",
      data
    );
    return response.data;
  },

  // Qualify lead with Gemini
  qualify: async (enquiryId: string): Promise<QualifyResponse> => {
    const response = await api.post<QualifyResponse>(`/api/v1/enquiries/${enquiryId}/qualify`);
    return response.data;
  },
};

// Callback request API services
export const callbackRequestService = {
  // Fetch all callbacks with optional filtering
  getAll: async (params?: { status?: string; search?: string }): Promise<CallbackRequest[]> => {
    const response = await api.get<CallbackRequest[]>("/api/v1/voice/callbacks", {
      params,
    });
    return response.data;
  },

  // Fetch single callback
  getById: async (id: string): Promise<CallbackRequest> => {
    const response = await api.get<CallbackRequest>(`/api/v1/voice/callbacks/${id}`);
    return response.data;
  },

  // Update callback status and notes (admin action)
  update: async (
    id: string,
    payload: CallbackUpdatePayload
  ): Promise<CallbackUpdateResponse> => {
    const response = await api.patch<CallbackUpdateResponse>(
      `/api/v1/voice/callbacks/${id}`,
      payload
    );
    return response.data;
  },

  // Get callback aggregate metrics
  getStats: async (): Promise<CallbackStats> => {
    const response = await api.get<CallbackStats>("/api/v1/voice/callbacks/stats");
    return response.data;
  },

  // Voice agent metadata
  getAgentInfo: async (): Promise<VoiceAgentInfo> => {
    const response = await api.get<VoiceAgentInfo>("/api/v1/voice/agent-info");
    return response.data;
  },

  // Dispatch outbound test call
  dispatchTestCall: async (payload: TestCallDispatchPayload): Promise<TestCallDispatchResponse> => {
    const response = await api.post<TestCallDispatchResponse>(
      "/api/v1/voice/dispatch-test-call",
      payload
    );
    return response.data;
  },

  // Retrieve call logs
  getCallLogs: async (): Promise<{ success: boolean; count: number; logs: CallLogItem[] }> => {
    const response = await api.get("/api/v1/voice/call-logs");
    return response.data;
  },

  // Verify admin access
  verifyAdmin: async () => {
    const response = await api.get("/api/v1/admin/verify");
    return response.data;
  },
};

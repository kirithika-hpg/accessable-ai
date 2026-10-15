import {
  ScanReport,
  AiExplanationResponse,
  AiSuggestedFixResponse,
  BackendHealth,
  AuthResponse,
  UserPreferences,
  ContentExtractResponse,
  SimplifyResponse,
  ChatResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessable_token');
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessable_token', token);
    } else {
      localStorage.removeItem('accessable_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback to generic message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Health Check
  public async getHealth(): Promise<BackendHealth> {
    return this.request<BackendHealth>('/health');
  }

  // Scans
  public async startScan(url: string): Promise<{ scan_id: string; message: string; target_url: string }> {
    return this.request('/scans', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  public async getScan(scanId: string): Promise<ScanReport> {
    return this.request<ScanReport>(`/scans/${scanId}`);
  }

  public async getScans(): Promise<ScanReport[]> {
    return this.request<ScanReport[]>('/scans');
  }

  public async deleteScan(scanId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/scans/${scanId}`, {
      method: 'DELETE',
    });
  }

  // Supported Integration Mode: Accessible Content Extraction
  public async extractContent(url: string): Promise<ContentExtractResponse> {
    return this.request<ContentExtractResponse>('/content/extract', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  // AI Assistant: Explain & Fix
  public async explainIssue(data: {
    finding_id?: string;
    rule_id: string;
    description: string;
    html_snippet?: string;
    target_url?: string;
  }): Promise<AiExplanationResponse> {
    return this.request<AiExplanationResponse>('/assistant/explain', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async suggestFix(data: {
    finding_id?: string;
    rule_id: string;
    html_snippet: string;
    description?: string;
    selector?: string;
  }): Promise<AiSuggestedFixResponse> {
    return this.request<AiSuggestedFixResponse>('/assistant/suggest-fix', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI Assistant: Plain English Simplification
  public async simplifyText(text: string, level: string = 'plain_english'): Promise<SimplifyResponse> {
    return this.request<SimplifyResponse>('/assistant/simplify', {
      method: 'POST',
      body: JSON.stringify({ text, level }),
    });
  }

  // AI Assistant: Guidance Chat
  public async chatWithAssistant(message: string, context?: string): Promise<ChatResponse> {
    return this.request<ChatResponse>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  // Auth & Guest Session
  public async guestLogin(): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/guest', {
      method: 'POST',
    });
    this.setToken(res.access_token);
    return res;
  }

  public async login(formData: { email: string; password: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    this.setToken(res.access_token);
    return res;
  }

  public async register(formData: { email: string; password: string; full_name: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    this.setToken(res.access_token);
    return res;
  }

  public async getMe(): Promise<any> {
    return this.request('/auth/me');
  }

  // Preferences
  public async getPreferences(): Promise<UserPreferences> {
    return this.request<UserPreferences>('/preferences');
  }

  public async updatePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    return this.request<UserPreferences>('/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
  }
}

export const api = new ApiService();

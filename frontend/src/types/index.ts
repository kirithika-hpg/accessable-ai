export type Severity = 'critical' | 'serious' | 'moderate' | 'minor';

export type AccessibilityMode =
  | 'blind'
  | 'low_vision'
  | 'voice_control'
  | 'head_tracking'
  | 'motor'
  | 'cognitive'
  | 'hearing'
  | 'custom';

export interface AccessibilityFinding {
  id: string;
  scan_id: string;
  rule_id: string;
  rule_name: string;
  description: string;
  severity: Severity;
  wcag_tags: string[];
  selector: string;
  html_snippet: string;
  failure_summary: string;
  recommended_fix: string;
  manual_test_notes?: string;
  users_affected?: string[];
}

export interface ScanReport {
  id: string;
  user_id?: number | null;
  target_url: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  error_message?: string;
  total_issues: number;
  critical_count: number;
  serious_count: number;
  moderate_count: number;
  minor_count: number;
  accessibility_score: number;
  scan_duration_ms: number;
  scanned_at: string;
  findings: AccessibilityFinding[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'high-contrast-dark' | 'high-contrast-light';
  font_size: 'normal' | 'large' | 'x-large' | 'xx-large';
  dyslexia_font: boolean;
  easy_reading: boolean;
  reduced_motion: boolean;
  text_to_speech: boolean;
  tts_rate: number;
  tts_pitch: number;
  voice_commands: boolean;
  active_modes?: AccessibilityMode[];
  cursor_enlarged?: boolean;
  reading_ruler?: boolean;
  dwell_click_enabled?: boolean;
  dwell_delay_ms?: number;
  head_tracking_enabled?: boolean;
  head_tracking_sensitivity?: number;
  switch_nav_enabled?: boolean;
  switch_scan_speed_ms?: number;
  visual_alerts_enabled?: boolean;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_guest?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AiExplanationResponse {
  finding_id?: string;
  rule_id: string;
  simple_explanation: string;
  why_it_matters: string;
  impact_by_disability: {
    blind: string;
    low_vision: string;
    motor: string;
    cognitive: string;
  };
  wcag_reference: {
    guideline: string;
    principle: string;
    level: string;
    url: string;
  };
}

export interface AiSuggestedFixResponse {
  finding_id?: string;
  rule_id: string;
  original_snippet: string;
  suggested_snippet: string;
  css_suggestion?: string;
  alt_text_suggestion?: string;
  explanation_of_fix: string;
  verification_instructions: string;
}

export interface ContentExtractResponse {
  url: string;
  title: string;
  meta_description?: string;
  readable_html: string;
  plain_text: string;
  headings: string[];
  word_count: number;
  estimated_read_time_minutes: number;
  supported: boolean;
  notice: string;
}

export interface SimplifyResponse {
  original_text: string;
  simplified_text: string;
  key_points: string[];
  reading_level: string;
  disclaimer: string;
}

export interface ChatResponse {
  response: string;
  suggested_actions: string[];
}

export interface BackendHealth {
  status: string;
  version: string;
  database: string;
  scanner_engine: string;
  ai_engine: string;
}

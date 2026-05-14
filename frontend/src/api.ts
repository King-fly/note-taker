/**
 * API client for ClassSync backend.
 * Centralized fetch wrapper with JWT token management.
 */

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// ── Token helpers ──────────────────────────────────────────────────

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem("access_token") || null;
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem("access_token", token);
  } catch {}
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem("access_token");
  } catch {}
}

// ── Fetch wrapper ──────────────────────────────────────────────────

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Merge custom headers
  if (options.headers) {
    if (typeof options.headers === "object" && !Array.isArray(options.headers)) {
      for (const [k, v] of Object.entries(options.headers as Record<string, string>)) {
        headers[k] = v;
      }
    }
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fullUrl = `${API_BASE}${url}`;
  console.log("[API]", options.method || "GET", fullUrl, "token:", token ? "yes" : "no");

  const res = await fetch(fullUrl, {
    ...options,
    headers,
  });

  console.log("[API] response:", res.status, res.statusText);

  if (!res.ok) {
    let detail: string;
    try {
      const err = await res.json();
      detail = err.detail || err.message || res.statusText;
    } catch {
      detail = res.statusText;
    }

    console.error("[API] error:", res.status, detail);

    // On 401, clear stale token
    if (res.status === 401) {
      clearAuthToken();
    }

    throw new Error(detail);
  }

  return res.json();
}

// ── Auth API ───────────────────────────────────────────────────────

export interface UserLoginPayload {
  username: string;
  password: string;
}

export interface UserRegisterPayload {
  username: string;
  email: string;
  password: string;
  display_name?: string;
  grade?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export function login(payload: UserLoginPayload): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload: UserRegisterPayload): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── User API ───────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  grade: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ProfileStats {
  total_notes: number;
  total_flashcards: number;
  organized_notes: number;
  streak_days: number;
}

export function getProfile(): Promise<UserProfile> {
  return request<UserProfile>("/user/profile");
}

export function getStats(): Promise<ProfileStats> {
  return request<ProfileStats>("/user/stats");
}

// ── Notes API ──────────────────────────────────────────────────────

export type NoteType = "voice" | "ocr" | "text" | "image";
export type NoteTemplate = "康奈尔" | "思维导图" | "理科公式" | "文科框架";

export interface NoteItem {
  id: string;
  title: string;
  content: string | null;
  raw_content: string | null;
  note_type: NoteType;
  template: string | null;
  subject: string | null;
  tags: string[] | null;
  is_organized: boolean;
  organize_status: string | null;
  ai_summary: string | null;
  confidence_score: number | null;
  created_at: string | null;
  updated_at: string | null;
  organized_at: string | null;
}

export interface NoteListResult {
  total: number;
  items: NoteItem[];
}

export interface CreateNotePayload {
  title: string;
  content?: string;
  raw_content?: string;
  note_type?: NoteType;
  subject?: string;
  tags?: string[];
  confidence_score?: number;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  raw_content?: string;
  subject?: string;
  tags?: string[];
}

export interface OrganizeNotePayload {
  template: string;
}

export interface NoteQueryParams {
  search?: string;
  subject?: string;
  is_organized?: boolean;
  note_type?: NoteType;
  page?: number;
  page_size?: number;
}

export function listNotes(
  params: NoteQueryParams = {},
): Promise<NoteListResult> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.subject) qs.set("subject", params.subject);
  if (params.is_organized !== undefined)
    qs.set("is_organized", String(params.is_organized));
  if (params.note_type) qs.set("note_type", params.note_type);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));

  const query = qs.toString();
  return request<NoteListResult>(`/notes${query ? `?${query}` : ""}`);
}

export function createNote(payload: CreateNotePayload): Promise<NoteItem> {
  return request<NoteItem>("/notes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getNote(noteId: string): Promise<NoteItem> {
  return request<NoteItem>(`/notes/${noteId}`);
}

export function updateNote(
  noteId: string,
  payload: UpdateNotePayload,
): Promise<NoteItem> {
  return request<NoteItem>(`/notes/${noteId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteNote(noteId: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/notes/${noteId}`, {
    method: "DELETE",
  });
}

export function organizeNote(
  noteId: string,
  payload: OrganizeNotePayload,
): Promise<NoteItem> {
  return request<NoteItem>(`/notes/${noteId}/organize`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Review / Flashcards API ────────────────────────────────────────

export type CardDifficulty = "easy" | "medium" | "hard";
export type ReviewStatus = "new" | "learning" | "review" | "graduated";

export interface FlashcardItem {
  id: string;
  note_id: string | null;
  question: string;
  answer: string;
  tags: string[] | null;
  difficulty: CardDifficulty;
  review_status: ReviewStatus;
  interval_days: number;
  next_review_date: string | null;
  review_count: number;
  created_at: string | null;
}

export interface FlashcardListResult {
  total: number;
  items: FlashcardItem[];
}

export function getDueFlashcards(): Promise<FlashcardListResult> {
  return request<FlashcardListResult>("/review/flashcards/due");
}

export function listFlashcards(
  params: {
    status?: ReviewStatus;
    subject?: string;
    page?: number;
    page_size?: number;
  } = {},
): Promise<FlashcardListResult> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.subject) qs.set("subject", params.subject);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));

  const query = qs.toString();
  return request<FlashcardListResult>(`/review/flashcards${query ? `?${query}` : ""}`);
}

export function getFlashcard(cardId: string): Promise<FlashcardItem> {
  return request<FlashcardItem>(`/review/flashcards/${cardId}`);
}

export function assessFlashcard(
  cardId: string,
  difficulty: CardDifficulty,
): Promise<FlashcardItem> {
  return request<FlashcardItem>(`/review/flashcards/${cardId}/assess`, {
    method: "PUT",
    body: JSON.stringify({ difficulty: difficulty }),
  });
}

export function deleteFlashcard(cardId: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/review/flashcards/${cardId}`, {
    method: "DELETE",
  });
}

// ── Vocabulary API ─────────────────────────────────────────────────

export interface VocabularyItem {
  id: string;
  word: string;
  shortcut: string;
  category: string | null;
  created_at: string | null;
}

export function listVocabulary(): Promise<VocabularyItem[]> {
  return request<VocabularyItem[]>("/vocab");
}

export interface CreateVocabularyPayload {
  word: string;
  shortcut: string;
  category?: string|null;
}

export function createVocabulary(
  payload: CreateVocabularyPayload,
): Promise<VocabularyItem> {
  return request<VocabularyItem>("/vocab", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteVocabulary(vocabId: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/vocab/${vocabId}`, {
    method: "DELETE",
  });
}

// ── OCR API ────────────────────────────────────────────────────────

export interface OcrResult {
  text: string;
  confidence: number;
}

export function extractTextFromImage(
  imageB64: string,
  prompt: string = "Extract all visible text from this image accurately. Output in the same language. Keep the structure and formatting.",
): Promise<OcrResult> {
  // Strip data URI prefix if present (data:image/jpeg;base64,xxx -> xxx)
  let cleanB64 = imageB64;
  if (imageB64.startsWith("data:")) {
    const commaIdx = imageB64.indexOf(",");
    if (commaIdx !== -1) {
      cleanB64 = imageB64.substring(commaIdx + 1);
    }
  }
  return request<OcrResult>("/ocr", {
    method: "POST",
    body: JSON.stringify({ image_b64: cleanB64, prompt }),
  });
}

// ── Flashcard Generation API ───────────────────────────────────────

export function generateFlashcardsFromNote(
  noteId: string,
): Promise<{ message: string }> {
  return request<{ message: string }>(
    `/review/flashcards/generate?note_id=${noteId}`,
    { method: "POST" },
  );
}

// ── Voice Transcription API ────────────────────────────────────────

export interface TranscribeResult {
  text: string;
  language: string;
  duration: number;
}

export function transcribeAudio(
  audioB64: string,
  language: string = "zh",
  model: string = "medium",
): Promise<TranscribeResult> {
  let cleanB64 = audioB64;
  if (audioB64.startsWith("data:")) {
    const commaIdx = audioB64.indexOf(",");
    if (commaIdx !== -1) {
      cleanB64 = audioB64.substring(commaIdx + 1);
    }
  }
  return request<TranscribeResult>("/transcribe", {
    method: "POST",
    body: JSON.stringify({ audio_b64: cleanB64, language, model }),
  });
}

// ── Health ─────────────────────────────────────────────────────────

export function healthCheck(): Promise<{ message: string }> {
  return request<{ message: string }>("/health");
}
// Type definitions for API module
declare module "@/api" {
  export interface NoteItem {
    id: string;
    title: string;
    content?: string;
    raw_content?: string;
    note_type: string;
    subject?: string;
    tags?: string[];
    template?: string;
    is_organized: boolean;
    organize_status?: string;
    ai_summary?: string;
    created_at?: string;
    updated_at?: string;
  }

  export interface NoteQueryParams {
    page?: number;
    page_size?: number;
    search?: string;
    is_organized?: boolean;
  }

  export interface FlashcardItem {
    id: string;
    question: string;
    answer: string;
    note_id?: string;
    tags?: string[];
    difficulty?: string;
    next_review_date?: string;
    created_at?: string;
  }

  export interface VocabularyItem {
    id: string;
    word: string;
    shortcut: string;
    category?: string;
    created_at?: string;
  }

  export interface CreateVocabularyPayload {
    word: string;
    shortcut: string;
    category?: string;
  }

  export interface UserProfile {
    id: string;
    username: string;
    display_name?: string;
    email: string;
    grade?: string;
  }

  export interface ProfileStats {
    total_notes: number;
    organized_notes: number;
    total_flashcards: number;
  }

  export function listNotes(params: NoteQueryParams): Promise<{ items: NoteItem[]; total: number }>;
  export function createNote(noteData: Partial<NoteItem>): Promise<NoteItem>;
  export function updateNote(id: string, noteData: Partial<NoteItem>): Promise<NoteItem>;
  export function organizeNote(id: string, params: { template: string }): Promise<any>;
  export function generateFlashcardsFromNote(noteId: string): Promise<any>;
  export function getDueFlashcards(): Promise<{ items: FlashcardItem[]; total: number }>;
  export function listFlashcards(params: any): Promise<{ items: FlashcardItem[]; total: number }>;
  export function assessFlashcard(id: string, difficulty: "easy" | "medium"): Promise<any>;
  export function listVocabulary(): Promise<VocabularyItem[]>;
  export function createVocabulary(payload: CreateVocabularyPayload): Promise<VocabularyItem>;
  export function deleteVocabulary(id: string): Promise<void>;
  export function extractTextFromImage(imageData: string): Promise<{ text: string }>;
  export function transcribeAudio(audioB64: string, language?: string, model?: string): Promise<{ text: string; language: string; duration: number; task_id?: string }>;

  // Auth functions
  export function login(username: string, password: string): Promise<{ token: string; user: UserProfile }>;
  export function register(username: string, email: string, password: string, displayName?: string, grade?: string): Promise<{ token: string; user: UserProfile }>;
  export function getProfile(): Promise<UserProfile>;
  export function getStats(): Promise<ProfileStats>;
  export function getAuthToken(): string | null;
  export function setAuthToken(token: string): void;
  export function clearAuthToken(): void;
}
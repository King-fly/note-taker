"""
AI service: unified wrapper around the local MLX inference server.

All providers (Gemini / OpenAI) are replaced by the single local endpoint.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from openai import OpenAI

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


# ── Local MLX inference server ─────────────────────────────────────

class LocalAIService:
    """OpenAI-compatible client targeting the local MLX server."""

    def __init__(self) -> None:
        self._client: OpenAI | None = None
        self.model: str = settings.LOCAL_AI_MODEL

    def _ensure_client(self) -> OpenAI:
        if self._client is None:
            self._client = OpenAI(
                base_url=settings.LOCAL_AI_BASE_URL,
                api_key=settings.LOCAL_AI_API_KEY,
            )
        return self._client

    # ── Public API (replaces GeminiService methods) ────────────────

    def generate_cornell_notes(self, raw_content: str, subject: str | None = None) -> str:
        prompt = self._cornell_prompt(raw_content, subject)
        return self._chat(prompt)

    def generate_mind_map(self, raw_content: str, subject: str | None = None) -> str:
        prompt = self._mindmap_prompt(raw_content, subject)
        return self._chat(prompt)

    def generate_flashcards(self, content: str) -> list[dict[str, Any]]:
        prompt = f"""Based on the following study material, generate 5-8 flashcards for spaced repetition review.
Return ONLY a valid JSON array. No markdown, no explanation.

Material:
{content[:4000]}

Example output format:
[
  {{
    "question": "What is Newton's Second Law?",
    "answer": "F = ma (Force equals mass times acceleration)",
    "difficulty": "easy",
    "tags": ["physics", "formula"]
  }}
]

Difficulty scale: easy (basic recall), medium (understanding), hard (application)"""
        text = self._chat(prompt)
        return self._parse_json_array(text)

    # ── Internal helpers ───────────────────────────────────────────

    def _chat(self, prompt: str) -> str:
        client = self._ensure_client()
        response = client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=4096,
        )
        return response.choices[0].message.content or ""

    @staticmethod
    def _parse_json_array(text: str) -> list[dict[str, Any]]:
        """Extract a JSON array from possible markdown code blocks."""
        text = text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1])
        try:
            parsed = json.loads(text)
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError as exc:
            logger.warning("Failed to parse JSON from LLM: %s. Raw: %s", exc, text[:500])
        return []

    # ── Generic text generation ────────────────────────────────────

    def generate_text(self, prompt: str) -> str:
        return self._chat(prompt)

    # ── Prompt templates ───────────────────────────────────────────

    @staticmethod
    def _cornell_prompt(raw: str, subject: str | None) -> str:
        sub = f" Subject: {subject}" if subject else ""
        return (
            f"You are an expert study assistant. Convert the following raw classroom notes{sub} "
            f"into structured Cornell Notes with three sections: "
            f"1) Cues (key questions and terms), "
            f"2) Notes (detailed explanations), "
            f"3) Summary (one paragraph overview).\n\n"
            f"Raw notes:\n{raw[:4000]}\n\n"
            f"Output only the three sections, labeled with markdown headers."
        )

    @staticmethod
    def _mindmap_prompt(raw: str, subject: str | None) -> str:
        sub = f" Subject: {subject}" if subject else ""
        return (
            f"Convert these raw notes{sub} into a hierarchical mind-map outline.\n\n"
            f"Raw notes:\n{raw[:4000]}\n\n"
            f"Use indented bullet points (1-4 levels deep). Start with main topic, then subtopics and details."
        )

    @staticmethod
    def _formula_prompt(raw: str, subject: str | None) -> str:
        sub = f" Subject: {subject}" if subject else ""
        return (
            f"Extract and organize key formulas, derivations, and problem-solving steps from these science notes{sub}:\n\n"
            f"{raw[:4000]}\n\n"
            f"Output a structured markdown document with formulas clearly highlighted."
        )

    @staticmethod
    def _framework_prompt(raw: str, subject: str | None) -> str:
        sub = f" Subject: {subject}" if subject else ""
        return (
            f"Create a structured outline framework from these humanities notes{sub} with key themes, dates, and concepts:\n\n"
            f"{raw[:4000]}\n\n"
            f"Output a hierarchical outline with markdown headers and bullet points."
        )


# ── Singleton ──────────────────────────────────────────────────────

_aiservice: LocalAIService | None = None


def get_ai_service() -> LocalAIService:
    """Return the singleton LocalAI service."""
    global _aiservice
    if _aiservice is None:
        _aiservice = LocalAIService()
    return _aiservice


# ── Backwards-compat aliases (used by tasks) ───────────────────────

# Provide same methods that callers expect
def generate_cornell_notes(raw_content: str, subject: str | None = None) -> str:
    return get_ai_service().generate_cornell_notes(raw_content, subject)

def generate_mind_map(raw_content: str, subject: str | None = None) -> str:
    return get_ai_service().generate_mind_map(raw_content, subject)

def generate_flashcards(content: str) -> list[dict[str, Any]]:
    return get_ai_service().generate_flashcards(content)

def generate_text(prompt: str) -> str:
    return get_ai_service().generate_text(prompt)

def generate_formula(raw_content: str, subject: str | None = None) -> str:
    return get_ai_service().generate_text(
        LocalAIService._formula_prompt(raw_content, subject)
    )

def generate_framework(raw_content: str, subject: str | None = None) -> str:
    return get_ai_service().generate_text(
        LocalAIService._framework_prompt(raw_content, subject)
    )

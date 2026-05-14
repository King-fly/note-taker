"""
OCR route: submit image to local AI for text extraction.
"""

import base64
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.services.ai_service import get_ai_service

logger = logging.getLogger(__name__)
router = APIRouter()


class OcrRequest(BaseModel):
    """Submit an image (base64) for OCR text extraction."""
    image_b64: str = Field(..., description="Base64-encoded image (JPEG/PNG).")
    prompt: Optional[str] = "Please extract all visible text from this image accurately. Output in the same language as the image. Keep the original structure and formatting."


class OcrResponse(BaseModel):
    """OCR result."""
    text: str
    confidence: float = 0.0


@router.post("/ocr", response_model=OcrResponse, tags=["ocr"])
def extract_text(
    body: OcrRequest,
    current_user: dict = Depends(get_current_user),
) -> OcrResponse:
    """Run OCR on an uploaded image using the local MLX inference server."""
    # Strip data URI prefix if present (e.g. data:image/png;base64,xxx)
    image_data = body.image_b64
    if "," in image_data:
        image_data = image_data.split(",", 1)[1]

    try:
        img_bytes = base64.b64decode(image_data)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid base64 image: {exc}")

    ai = get_ai_service()

    # Use the local AI vision capability: send the image + prompt
    # The OpenAI-compatible client accepts base64 image data in message content
    try:
        client = ai._ensure_client()
        response = client.chat.completions.create(
            model=ai.model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": body.prompt or "Extract all text from this image."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}",
                            },
                        },
                    ],
                }
            ],
            temperature=0.1,
            max_tokens=4096,
        )
        text = response.choices[0].message.content or ""
        return OcrResponse(text=text, confidence=0.95)
    except Exception as exc:
        logger.exception("OCR failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=f"OCR processing failed: {exc}",
        )

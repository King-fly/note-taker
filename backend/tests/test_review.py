"""
Tests for flashcard / review endpoints.
"""

from fastapi.testclient import TestClient

from app.lifespan import create_application

client = TestClient(create_application())

TOKEN = None


def _get_token():
    global TOKEN
    if TOKEN is None:
        resp = client.post("/api/v1/auth/register", json={
            "username": "reviewuser",
            "email": "review@example.com",
            "password": "testpass123",
        })
        TOKEN = resp.json()["access_token"]
    return TOKEN


def _headers():
    return {"Authorization": f"Bearer {_get_token()}"}


def test_create_flashcard():
    resp = client.post("/api/v1/review/flashcards", json={
        "question": "F=ma 是什么定律？",
        "answer": "牛顿第二定律",
        "tags": ["物理", "公式"],
        "difficulty": "easy",
    }, headers=_headers())
    assert resp.status_code == 201
    data = resp.json()
    assert data["question"] == "F=ma 是什么定律？"
    assert data["difficulty"] == "easy"


def test_list_flashcards():
    # Create a card
    client.post("/api/v1/review/flashcards", json={
        "question": "Question?",
        "answer": "Answer!",
    }, headers=_headers())

    resp = client.get("/api/v1/review/flashcards", headers=_headers())
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1


def test_assess_flashcard():
    resp = client.post("/api/v1/review/flashcards", json={
        "question": "Test Q",
        "answer": "Test A",
        "difficulty": "medium",
    }, headers=_headers())
    card_id = resp.json()["id"]

    resp = client.put(f"/api/v1/review/flashcards/{card_id}/assess", json={
        "difficulty": "easy",
    }, headers=_headers())
    assert resp.status_code == 200
    data = resp.json()
    assert data["review_count"] == 1
    assert data["interval_days"] >= 1


def test_get_due_flashcards():
    # Create a card that's due immediately
    client.post("/api/v1/review/flashcards", json={
        "question": "Due test?",
        "answer": "Yes!",
    }, headers=_headers())

    resp = client.get("/api/v1/review/flashcards/due", headers=_headers())
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1


def test_delete_flashcard():
    resp = client.post("/api/v1/review/flashcards", json={
        "question": "ToDelete?",
        "answer": "Yes",
    }, headers=_headers())
    card_id = resp.json()["id"]

    resp = client.delete(f"/api/v1/review/flashcards/{card_id}", headers=_headers())
    assert resp.status_code == 200

    resp = client.get(f"/api/v1/review/flashcards/{card_id}", headers=_headers())
    assert resp.status_code == 404

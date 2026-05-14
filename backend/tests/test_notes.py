"""
Tests for notes CRUD endpoints.
"""

from fastapi.testclient import TestClient

from app.lifespan import create_application

client = TestClient(create_application())

# Auth token from fixture setup
TOKEN = None


def _get_token():
    global TOKEN
    if TOKEN is None:
        resp = client.post("/api/v1/auth/register", json={
            "username": "notetester",
            "email": "note@example.com",
            "password": "testpass123",
        })
        TOKEN = resp.json()["access_token"]
    return TOKEN


def _headers():
    return {"Authorization": f"Bearer {_get_token()}"}


def test_create_note():
    resp = client.post("/api/v1/notes", json={
        "title": "集合与函数概念",
        "raw_content": "设A，B是非空的数集，函数f:A→B",
        "note_type": "voice",
        "subject": "数学",
        "tags": ["重点", "微积分"],
        "confidence_score": 0.95,
    }, headers=_headers())
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "集合与函数概念"
    assert data["subject"] == "数学"
    assert data["is_organized"] is False


def test_list_notes_empty():
    resp = client.get("/api/v1/notes", headers=_headers())
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0


def test_list_notes_after_create():
    # Create first
    client.post("/api/v1/notes", json={
        "title": "测试笔记A",
        "note_type": "text",
    }, headers=_headers())

    resp = client.get("/api/v1/notes", headers=_headers())
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


def test_get_single_note():
    # Create then retrieve
    resp = client.post("/api/v1/notes", json={
        "title": "Get测试",
        "content": "Some content",
        "note_type": "text",
    }, headers=_headers())
    note_id = resp.json()["id"]

    resp = client.get(f"/api/v1/notes/{note_id}", headers=_headers())
    assert resp.status_code == 200
    assert resp.json()["title"] == "Get测试"


def test_update_note():
    resp = client.post("/api/v1/notes", json={
        "title": "Update测试",
        "note_type": "text",
    }, headers=_headers())
    note_id = resp.json()["id"]

    resp = client.put(f"/api/v1/notes/{note_id}", json={
        "title": "更新后的标题",
        "subject": "物理",
    }, headers=_headers())
    assert resp.status_code == 200
    assert resp.json()["title"] == "更新后的标题"
    assert resp.json()["subject"] == "物理"


def test_delete_note():
    resp = client.post("/api/v1/notes", json={
        "title": "Delete测试",
        "note_type": "text",
    }, headers=_headers())
    note_id = resp.json()["id"]

    resp = client.delete(f"/api/v1/notes/{note_id}", headers=_headers())
    assert resp.status_code == 200

    resp = client.get(f"/api/v1/notes/{note_id}", headers=_headers())
    assert resp.status_code == 404

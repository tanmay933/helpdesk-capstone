def make(client, **overrides):
    payload = {"subject": "Cannot log in", "priority": "HIGH", "requester": "Asha", "category": "ACCOUNT"}
    payload.update(overrides)
    return client.post("/api/tickets", json=payload)

def test_health(client):
    assert client.get("/health").json() == {"status": "UP"}

def test_root_and_ready(client):
    assert client.get("/").json()["service"] == "HelpDesk API"
    assert client.get("/ready").json() == {"status": "READY"}

def test_create_ticket(client):
    response = make(client)
    assert response.status_code == 201
    body = response.json()
    assert body["subject"] == "Cannot log in"
    assert body["status"] == "OPEN"
    assert body["assignee"] == "Unassigned"

def test_create_ticket_validation(client):
    assert client.post("/api/tickets", json={"subject": ""}).status_code == 422
    assert make(client, priority="SUPER").status_code == 422

def test_list_and_get_ticket(client):
    ticket_id = make(client).json()["id"]
    make(client, subject="Invoice wrong", category="BILLING")
    assert len(client.get("/api/tickets").json()) == 2
    assert client.get(f"/api/tickets/{ticket_id}").json()["category"] == "ACCOUNT"
    assert client.get("/api/tickets/9999").status_code == 404

def test_update_ticket(client):
    ticket_id = make(client).json()["id"]
    response = client.put(f"/api/tickets/{ticket_id}", json={"status": "IN_PROGRESS", "assignee": "Ravi"})
    assert response.status_code == 200
    assert response.json()["status"] == "IN_PROGRESS"
    assert response.json()["assignee"] == "Ravi"
    assert client.put("/api/tickets/9999", json={"status": "RESOLVED"}).status_code == 404

def test_delete_ticket(client):
    ticket_id = make(client).json()["id"]
    assert client.delete(f"/api/tickets/{ticket_id}").status_code == 204
    assert client.get(f"/api/tickets/{ticket_id}").status_code == 404

def test_stats_and_filter(client):
    make(client, priority="URGENT")
    resolved_id = make(client, subject="Old issue").json()["id"]
    client.put(f"/api/tickets/{resolved_id}", json={"status": "RESOLVED"})
    stats = client.get("/api/tickets/stats").json()
    assert stats == {"total": 2, "open": 1, "inProgress": 0, "resolved": 1, "urgent": 1}
    assert len(client.get("/api/tickets?status_filter=resolved").json()) == 1

def test_metrics_endpoint(client):
    client.get("/health")
    assert "http_requests_total" in client.get("/metrics").text

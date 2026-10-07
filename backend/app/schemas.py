from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

Status = Literal["OPEN", "IN_PROGRESS", "RESOLVED"]
Priority = Literal["LOW", "MEDIUM", "HIGH", "URGENT"]
Category = Literal["GENERAL", "BILLING", "TECHNICAL", "ACCOUNT"]

class TicketCreate(BaseModel):
    subject: str = Field(min_length=1, max_length=200)
    description: str = ""
    category: Category = "GENERAL"
    priority: Priority = "MEDIUM"
    status: Status = "OPEN"
    requester: str = "Anonymous"
    assignee: str = "Unassigned"

class TicketUpdate(BaseModel):
    subject: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    category: Category | None = None
    priority: Priority | None = None
    status: Status | None = None
    requester: str | None = None
    assignee: str | None = None

class TicketOut(TicketCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class StatsOut(BaseModel):
    total: int
    open: int
    inProgress: int
    resolved: int
    urgent: int

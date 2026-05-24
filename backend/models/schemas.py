from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class Role(str, Enum):
    admin  = "admin"
    member = "member"

class Permission(str, Enum):
    read       = "read"
    read_write = "read_write"
    alter      = "alter"       # full admin-level on a project

class TaskStatus(str, Enum):
    todo        = "todo"
    in_progress = "in_progress"
    review      = "review"
    done        = "done"

class TaskPriority(str, Enum):
    low    = "low"
    medium = "medium"
    high   = "high"


# ─── User ─────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name:     str       = Field(..., min_length=2, max_length=50)
    email:    EmailStr
    password: str       = Field(..., min_length=6)
    role:     Role      = Role.member

class UserLogin(BaseModel):
    email:    EmailStr
    password: str

class UserOut(BaseModel):
    id:    str
    name:  str
    email: str
    role:  Role


# ─── Project ──────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name:        str  = Field(..., min_length=2, max_length=100)
    description: str  = Field("", max_length=500)

class ProjectOut(BaseModel):
    id:          str
    name:        str
    description: str
    owner_id:    str
    members:     List[dict] = []   # [{user_id, permission}]
    created_at:  datetime
    task_count:  int = 0


# ─── Task ─────────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title:       str          = Field(..., min_length=2, max_length=200)
    description: str          = Field("", max_length=1000)
    assigned_to: Optional[str] = None
    priority:    TaskPriority = TaskPriority.medium
    due_date:    Optional[datetime] = None

class TaskUpdate(BaseModel):
    title:       Optional[str]          = None
    description: Optional[str]          = None
    status:      Optional[TaskStatus]   = None
    assigned_to: Optional[str]          = None
    priority:    Optional[TaskPriority] = None
    due_date:    Optional[datetime]     = None

class TaskOut(BaseModel):
    id:          str
    project_id:  str
    title:       str
    description: str
    status:      TaskStatus
    priority:    TaskPriority
    assigned_to: Optional[str]
    created_by:  str
    due_date:    Optional[datetime]
    created_at:  datetime


# ─── Invite ───────────────────────────────────────────────────────────────────

class InviteCreate(BaseModel):
    permission: Permission = Permission.read_write
    # expires_in hours — default 48h
    expires_in: int = Field(48, ge=1, le=168)

class InviteJoin(BaseModel):
    code: str = Field(..., min_length=6, max_length=12)

class InviteOut(BaseModel):
    code:       str
    project_id: str
    permission: Permission
    expires_at: datetime
    created_by: str


# ─── Branch (git-style commit timeline) ───────────────────────────────────────

class BranchCommit(BaseModel):
    message:    str
    task_id:    Optional[str] = None   # linked task if any
    author_id:  str
    timestamp:  datetime
    status:     Optional[TaskStatus] = None

class BranchOut(BaseModel):
    id:          str
    project_id:  str
    name:        str            # "main" or feature branch name
    commits:     List[BranchCommit] = []
    created_at:  datetime
    is_main:     bool = False


# ─── Generic responses ────────────────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserOut

class MessageResponse(BaseModel):
    message: str

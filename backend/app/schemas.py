from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=32, pattern=r"^[A-Za-z0-9_.-]+$")
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    username: str

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ProgressIn(BaseModel):
    problem_id: int
    status: str  # attempted | solved
    code: Optional[str] = None


class ProgressOut(BaseModel):
    problem_id: int
    status: str
    code: Optional[str] = None
    updated_at: datetime

    model_config = {"from_attributes": True}


class RunIn(BaseModel):
    code: str = Field(max_length=50_000)
    problem_id: Optional[int] = None


class RunOut(BaseModel):
    stdout: str
    stderr: str
    status: str  # ok | error | timeout
    duration_ms: int

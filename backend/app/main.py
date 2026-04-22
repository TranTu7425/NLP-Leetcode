from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .auth import create_access_token, current_user, hash_password, verify_password
from .config import settings
from .db import Base, engine, get_db
from .models import Progress, User
from .runner import run_python
from .schemas import (
    ProgressIn,
    ProgressOut,
    RunIn,
    RunOut,
    TokenOut,
    UserLogin,
    UserOut,
    UserRegister,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="NLP LeetCode API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"http://localhost(:\d+)?|http://127\.0\.0\.1(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# --------------------- auth ---------------------

@app.post("/api/auth/register", response_model=TokenOut, status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)) -> TokenOut:
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=payload.email.lower(),
        username=payload.username,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@app.post("/api/auth/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> TokenOut:
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@app.get("/api/me", response_model=UserOut)
def me(user: User = Depends(current_user)) -> UserOut:
    return UserOut.model_validate(user)


# --------------------- progress ---------------------

@app.get("/api/progress", response_model=list[ProgressOut])
def list_progress(
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> list[ProgressOut]:
    rows = (
        db.query(Progress)
        .filter(Progress.user_id == user.id)
        .order_by(Progress.problem_id)
        .all()
    )
    return [ProgressOut.model_validate(r) for r in rows]


@app.post("/api/progress", response_model=ProgressOut)
def upsert_progress(
    payload: ProgressIn,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> ProgressOut:
    if payload.status not in {"attempted", "solved"}:
        raise HTTPException(status_code=400, detail="status must be 'attempted' or 'solved'")

    row = (
        db.query(Progress)
        .filter(Progress.user_id == user.id, Progress.problem_id == payload.problem_id)
        .first()
    )
    if row is None:
        row = Progress(
            user_id=user.id,
            problem_id=payload.problem_id,
            status=payload.status,
            code=payload.code,
        )
        db.add(row)
    else:
        # Don't downgrade solved -> attempted
        if not (row.status == "solved" and payload.status == "attempted"):
            row.status = payload.status
        if payload.code is not None:
            row.code = payload.code

    db.commit()
    db.refresh(row)
    return ProgressOut.model_validate(row)


@app.delete("/api/progress")
def clear_progress(
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    db.query(Progress).filter(Progress.user_id == user.id).delete()
    db.commit()
    return {"cleared": True}


# --------------------- code runner ---------------------

@app.post("/api/run", response_model=RunOut)
def run(
    payload: RunIn,
    user: User = Depends(current_user),
) -> RunOut:
    result = run_python(payload.code)
    return RunOut(**result)

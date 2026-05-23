from fastapi import APIRouter, Depends
from models.schemas import InviteCreate, InviteJoin
from services import invite_svc
from middleware.db import get_db
from middleware.auth_guard import get_current_user
from middleware.rbac import check_project_permission

router = APIRouter(tags=["Invites"])


@router.post("/projects/{project_id}/invites", status_code=201)
async def generate_invite(
    project_id: str,
    body: InviteCreate,
    current_user: dict = Depends(check_project_permission("alter")), 
    db=Depends(get_db)
):
    return await invite_svc.create_invite(project_id, body.model_dump(), current_user["_id"], db)


@router.get("/projects/{project_id}/invites")
async def list_invites(
    project_id: str,
    _=Depends(check_project_permission("alter")),
    db=Depends(get_db)
):
    return await invite_svc.get_project_invites(project_id, db)


@router.post("/invites/join")
async def join_project(
    body: InviteJoin,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    project = await invite_svc.join_with_code(body.code, current_user["_id"], db)
    return {"message": "Joined project successfully", "project_id": project["_id"]}

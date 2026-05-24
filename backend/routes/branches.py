from fastapi import APIRouter, Depends
from services import branch_svc
from middleware.db import get_db
from middleware.auth_guard import get_current_user
from middleware.rbac import check_project_permission

router = APIRouter(prefix="/projects/{project_id}/branches", tags=["Branches"])


@router.get("")
async def get_branches(
    project_id: str,
    _=Depends(check_project_permission("read")),
    db=Depends(get_db)
):
    return await branch_svc.get_project_branches(project_id, db)


@router.get("/timeline")
async def get_timeline(
    project_id: str,
    _=Depends(check_project_permission("read")),
    db=Depends(get_db)
):
    """Full git-style timeline — main + feature branches with enriched commits"""
    return await branch_svc.get_branch_timeline(project_id, db)


@router.post("")
async def create_branch(
    project_id: str,
    name: str,
    current_user: dict = Depends(check_project_permission("read_write")),
    db=Depends(get_db)
):
    """Create a feature branch for sub-tasks"""
    return await branch_svc.create_feature_branch(project_id, name, current_user["_id"], db)

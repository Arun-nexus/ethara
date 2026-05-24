from fastapi import APIRouter, Depends
from models.schemas import ProjectCreate, ProjectOut, MessageResponse
from services import project_svc
from services.task_svc import get_dashboard_stats
from middleware.db import get_db
from middleware.auth_guard import get_current_user
from middleware.rbac import check_project_permission
from typing import List

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("", status_code=201)
async def create_project(
    body: ProjectCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    project = await project_svc.create_project(body.model_dump(), current_user["_id"], db)
    return project


@router.get("")
async def list_my_projects(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """All projects where user is owner or member"""
    return await project_svc.get_user_projects(current_user["_id"], db)


@router.get("/{project_id}")
async def get_project(
    project_id: str,
    _=Depends(check_project_permission("read")),   # min read access
    db=Depends(get_db)
):
    return await project_svc.get_project_by_id(project_id, db)


@router.get("/{project_id}/dashboard")
async def project_dashboard(
    project_id: str,
    _=Depends(check_project_permission("read")),
    db=Depends(get_db)
):
    """Returns task stats: total, by status, overdue count"""
    return await get_dashboard_stats(project_id, db)


@router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    await project_svc.delete_project(project_id, current_user["_id"], db)
    return {"message": "Project deleted successfully"}

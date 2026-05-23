from fastapi import APIRouter, Depends
from models.schemas import TaskCreate, TaskUpdate, MessageResponse
from services import task_svc
from middleware.db import get_db
from middleware.auth_guard import get_current_user
from middleware.rbac import check_project_permission

router = APIRouter(prefix="/projects/{project_id}/tasks", tags=["Tasks"])


@router.post("", status_code=201)
async def create_task(
    project_id: str,
    body: TaskCreate,
    current_user: dict = Depends(check_project_permission("read_write")),
    db=Depends(get_db)
):
    return await task_svc.create_task(project_id, body.model_dump(), current_user["_id"], db)


@router.get("")
async def list_tasks(
    project_id: str,
    _=Depends(check_project_permission("read")),
    db=Depends(get_db)
):
    return await task_svc.get_project_tasks(project_id, db)


@router.put("/{task_id}")
async def update_task(
    project_id: str,
    task_id: str,
    body: TaskUpdate,
    current_user: dict = Depends(check_project_permission("read_write")),
    db=Depends(get_db)
):
    return await task_svc.update_task(task_id, body.model_dump(), current_user["_id"], db)


@router.delete("/{task_id}", response_model=MessageResponse)
async def delete_task(
    project_id: str,
    task_id: str,
    _=Depends(check_project_permission("alter")),   
    db=Depends(get_db)
):
    await task_svc.delete_task(task_id, db)
    return {"message": "Task deleted"}

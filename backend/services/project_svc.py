from fastapi import HTTPException, status
from datetime import datetime
import uuid


async def create_project(data: dict, owner_id: str, db) -> dict:
    project_id = str(uuid.uuid4())
    doc = {
        "_id":         project_id,
        "name":        data["name"],
        "description": data.get("description", ""),
        "owner_id":    owner_id,
        "members":     [],          
        "created_at":  datetime.utcnow()
    }
    await db.projects.insert_one(doc)

    await db.branches.insert_one({
        "_id":        str(uuid.uuid4()),
        "project_id": project_id,
        "name":       "main",
        "is_main":    True,
        "commits":    [{
            "message":   "Project created",
            "author_id": owner_id,
            "timestamp": datetime.utcnow(),
            "task_id":   None,
            "status":    None
        }],
        "created_at": datetime.utcnow()
    })

    return doc


async def get_user_projects(user_id: str, db) -> list:
    """Returns projects where user is owner OR a member"""
    cursor = db.projects.find({
        "$or": [
            {"owner_id": user_id},
            {"members.user_id": user_id}
        ]
    })
    projects = await cursor.to_list(length=100)

    # Attach task count to each project
    for p in projects:
        p["task_count"] = await db.tasks.count_documents({"project_id": p["_id"]})

    return projects


async def get_project_by_id(project_id: str, db) -> dict:
    project = await db.projects.find_one({"_id": project_id})
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


async def delete_project(project_id: str, owner_id: str, db):
    project = await get_project_by_id(project_id, db)
    if project["owner_id"] != owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project owner can delete it"
        )
    # Cascade delete tasks, branches, invites
    await db.tasks.delete_many({"project_id": project_id})
    await db.branches.delete_many({"project_id": project_id})
    await db.invites.delete_many({"project_id": project_id})
    await db.projects.delete_one({"_id": project_id})

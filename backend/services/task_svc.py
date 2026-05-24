from fastapi import HTTPException, status
from datetime import datetime
import uuid


async def create_task(project_id: str, data: dict, creator_id: str, db) -> dict:
    task_id = str(uuid.uuid4())
    doc = {
        "_id":         task_id,
        "project_id":  project_id,
        "title":       data["title"],
        "description": data.get("description", ""),
        "status":      "todo",
        "priority":    data.get("priority", "medium"),
        "assigned_to": data.get("assigned_to"),
        "due_date":    data.get("due_date"),
        "created_by":  creator_id,
        "created_at":  datetime.utcnow()
    }
    await db.tasks.insert_one(doc)

    # Auto-commit to main branch: "Task added: <title>"
    await _push_commit(
        project_id=project_id,
        message=f"Task added: {data['title']}",
        task_id=task_id,
        author_id=creator_id,
        status="todo",
        db=db
    )
    return doc


async def update_task(task_id: str, updates: dict, user_id: str, db) -> dict:
    task = await db.tasks.find_one({"_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Remove None values so we don't overwrite with null
    clean = {k: v for k, v in updates.items() if v is not None}
    clean["updated_at"] = datetime.utcnow()

    await db.tasks.update_one({"_id": task_id}, {"$set": clean})

    # If status changed → push a commit to branch (git-style!)
    if "status" in clean:
        await _push_commit(
            project_id=task["project_id"],
            message=f"{task['title']} → {clean['status'].replace('_', ' ')}",
            task_id=task_id,
            author_id=user_id,
            status=clean["status"],
            db=db
        )

    return {**task, **clean}


async def get_project_tasks(project_id: str, db) -> list:
    cursor = db.tasks.find({"project_id": project_id})
    tasks  = await cursor.to_list(length=500)
    return tasks


async def get_dashboard_stats(project_id: str, db) -> dict:
    """Stats for dashboard: total, by status, overdue"""
    tasks = await get_project_tasks(project_id, db)
    now   = datetime.utcnow()

    stats = {
        "total":       len(tasks),
        "todo":        0,
        "in_progress": 0,
        "review":      0,
        "done":        0,
        "overdue":     0
    }
    for t in tasks:
        stats[t["status"]] = stats.get(t["status"], 0) + 1
        if t.get("due_date") and t["due_date"] < now and t["status"] != "done":
            stats["overdue"] += 1

    return stats


async def delete_task(task_id: str, db):
    result = await db.tasks.delete_one({"_id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")


# ─── Internal helper ──────────────────────────────────────────────────────────

async def _push_commit(project_id, message, task_id, author_id, status, db):
    """Appends a commit to project's main branch — like git commit"""
    commit = {
        "message":   message,
        "task_id":   task_id,
        "author_id": author_id,
        "timestamp": datetime.utcnow(),
        "status":    status
    }
    await db.branches.update_one(
        {"project_id": project_id, "is_main": True},
        {"$push": {"commits": commit}}
    )

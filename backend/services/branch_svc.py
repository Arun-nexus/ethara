from fastapi import HTTPException
from datetime import datetime
import uuid


async def get_project_branches(project_id: str, db) -> list:
    cursor   = db.branches.find({"project_id": project_id})
    branches = await cursor.to_list(length=50)
    return branches


async def create_feature_branch(project_id: str, name: str, creator_id: str, db) -> dict:
    """Create a sub-branch — like git checkout -b feature/xyz"""
    # Get latest commit from main as starting point
    main = await db.branches.find_one({"project_id": project_id, "is_main": True})
    base_commit = main["commits"][-1] if main and main.get("commits") else []

    doc = {
        "_id":        str(uuid.uuid4()),
        "project_id": project_id,
        "name":       name,
        "is_main":    False,
        "commits":    [{
            "message":   f"Branch '{name}' created",
            "author_id": creator_id,
            "timestamp": datetime.utcnow(),
            "task_id":   None,
            "status":    None
        }],
        "created_at": datetime.utcnow()
    }
    await db.branches.insert_one(doc)
    return doc


async def get_branch_timeline(project_id: str, db) -> dict:

    branches = await get_project_branches(project_id, db)
    main     = next((b for b in branches if b["is_main"]), None)
    features = [b for b in branches if not b["is_main"]]

    if not main:
        raise HTTPException(status_code=404, detail="Main branch not found")

    async def enrich(commits):
        enriched = []
        for c in commits:
            commit = dict(c)
            if c.get("task_id"):
                task = await db.tasks.find_one({"_id": c["task_id"]})
                commit["task"] = {"title": task["title"], "status": task["status"]} if task else None
            # Attach author name
            user = await db.users.find_one({"_id": c["author_id"]})
            commit["author_name"] = user["name"] if user else "Unknown"
            enriched.append(commit)
        return enriched

    return {
        "main": {
            **main,
            "commits": await enrich(main.get("commits", []))
        },
        "features": [
            {**f, "commits": await enrich(f.get("commits", []))}
            for f in features
        ]
    }

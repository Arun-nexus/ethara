from fastapi import HTTPException, status
from datetime import datetime, timedelta
import secrets
import string


def _generate_code(length: int = 8) -> str:
    chars = string.ascii_uppercase + string.digits
    code  = ''.join(secrets.choice(chars) for _ in range(length))
    return f"TF-{code}"


async def create_invite(project_id: str, data: dict, creator_id: str, db) -> dict:
    project = await db.projects.find_one({"_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    code = _generate_code()
    doc  = {
        "_id":        code,             
        "code":       code,
        "project_id": project_id,
        "permission": data.get("permission", "read_write"),
        "expires_at": datetime.utcnow() + timedelta(hours=data.get("expires_in", 48)),
        "created_by": creator_id,
        "used_by":    []              
    }
    await db.invites.insert_one(doc)
    return doc


async def join_with_code(code: str, user_id: str, db) -> dict:
    invite = await db.invites.find_one({"code": code})

    if not invite:
        raise HTTPException(status_code=404, detail="Invalid invite code")

    if invite["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invite code has expired")

    project = await db.projects.find_one({"_id": invite["project_id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project no longer exists")

    already = any(m["user_id"] == user_id for m in project.get("members", []))
    if already or project["owner_id"] == user_id:
        raise HTTPException(status_code=400, detail="You are already in this project")

    member_entry = {"user_id": user_id, "permission": invite["permission"]}
    await db.projects.update_one(
        {"_id": invite["project_id"]},
        {"$push": {"members": member_entry}}
    )

    await db.invites.update_one(
        {"code": code},
        {"$push": {"used_by": {"user_id": user_id, "joined_at": datetime.utcnow()}}}
    )

    return project


async def get_project_invites(project_id: str, db) -> list:
    cursor  = db.invites.find({"project_id": project_id})
    invites = await cursor.to_list(length=50)
    return invites

from fastapi import Depends, HTTPException, status
from middleware.auth_guard import get_current_user
from middleware.db import get_db


def check_project_permission(required_permission: str):

    HIERARCHY = {"read": 1, "read_write": 2, "alter": 3}

    async def _check(
        project_id: str,
        current_user: dict = Depends(get_current_user),
        db=Depends(get_db)
    ):
       
        if current_user.get("role") == "admin":
            return current_user

        project = await db.projects.find_one({"_id": project_id})
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        if project["owner_id"] == current_user["_id"]:
            return current_user

        member = next(
            (m for m in project.get("members", [])
             if m["user_id"] == current_user["_id"]),
            None
        )

        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this project"
            )

        user_level     = HIERARCHY.get(member["permission"], 0)
        required_level = HIERARCHY.get(required_permission, 99)

        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires '{required_permission}' permission"
            )

        return current_user

    return _check

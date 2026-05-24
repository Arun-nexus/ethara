from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

# Single client instance reused across app (like a singleton)
client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """Called once when FastAPI starts up"""
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.DB_NAME]

    # Create indexes for faster queries
    await db.users.create_index("email", unique=True)
    await db.projects.create_index("owner_id")
    await db.tasks.create_index("project_id")
    await db.invites.create_index("code", unique=True)
    await db.branches.create_index("project_id")

    print(f"✅ Connected to MongoDB: {settings.DB_NAME}")


async def disconnect_db():
    """Called when FastAPI shuts down"""
    global client
    if client:
        client.close()
        print("🔌 Disconnected from MongoDB")


def get_db():
    """Dependency injection — routes use this to get db"""
    return db

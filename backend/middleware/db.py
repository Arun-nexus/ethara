from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import ssl

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        tls=True,
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=30000,
    )
    db = client[settings.DB_NAME]
    await db.users.create_index("email", unique=True)
    await db.projects.create_index("owner_id")
    await db.tasks.create_index("project_id")
    await db.invites.create_index("code", unique=True)
    await db.branches.create_index("project_id")
    print(f"Connected to MongoDB: {settings.DB_NAME}")

async def disconnect_db():
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB")

def get_db():
    return db
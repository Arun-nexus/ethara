from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import certifi

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=10000,
    )
    db = client[settings.DB_NAME]
    await db.command('ping')
    print(f"✅ Connected to MongoDB: {settings.DB_NAME}")

async def disconnect_db():
    global client
    if client:
        client.close()

def get_db():
    return db
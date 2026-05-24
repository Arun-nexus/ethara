from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=5000,
    )
    db = client[settings.DB_NAME]
    print(f" Connected to MongoDB: {settings.DB_NAME}")

async def disconnect_db():
    global client
    if client:
        client.close()

def get_db():
    return db
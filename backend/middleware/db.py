from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import ssl

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    
    # Create SSL context that doesn't verify
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        ssl=True,
        ssl_cert_reqs=ssl.CERT_NONE,
        serverSelectionTimeoutMS=10000,
    )
    db = client[settings.DB_NAME]
    await db.command('ping')
    print(f" Connected to MongoDB: {settings.DB_NAME}")

async def disconnect_db():
    global client
    if client:
        client.close()

def get_db():
    return db
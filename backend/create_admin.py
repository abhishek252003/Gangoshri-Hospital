import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from passlib.context import CryptContext
import uuid
from datetime import datetime

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def create_admin_user():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Check if admin user already exists
    existing_admin = await db.users.find_one({"email": "admin@gangoshrihis.com"})
    if existing_admin:
        print("Admin user already exists!")
        await client.close()
        return
    
    # Create admin user
    admin_user = {
        "id": str(uuid.uuid4()),
        "email": "admin@gangoshrihis.com",
        "full_name": "System Administrator",
        "role": "ADMIN",
        "phone": "+919876543210",
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "password_hash": hash_password("Admin@123")
    }
    
    await db.users.insert_one(admin_user)
    print("Admin user created successfully!")
    print("Email: admin@gangoshrihis.com")
    print("Password: Admin@123")
    print("Please change the password after first login!")
    
    await client.close()

if __name__ == "__main__":
    asyncio.run(create_admin_user())
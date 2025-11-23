from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'gangosri-his-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 8

# Create the main app
app = FastAPI(title="Gangosri HIS API")
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class UserRole(BaseModel):
    ADMIN: str = "ADMIN"
    DOCTOR: str = "DOCTOR"
    NURSE: str = "NURSE"
    RECEPTIONIST: str = "RECEPTIONIST"
    LAB_TECHNICIAN: str = "LAB_TECHNICIAN"
    ACCOUNTANT: str = "ACCOUNTANT"

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    role: str
    employee_id: Optional[str] = None
    specialization: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str
    employee_id: Optional[str] = None
    specialization: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class Patient(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    full_name: str
    date_of_birth: str
    gender: str
    phone: str
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    insurance_info: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str

class PatientCreate(BaseModel):
    full_name: str
    date_of_birth: str
    gender: str
    phone: str
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    insurance_info: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    appointment_id: str
    patient_id: str
    patient_name: str
    doctor_id: str
    doctor_name: str
    appointment_date: str
    appointment_time: str
    status: str  # scheduled, completed, cancelled, no-show
    reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str

class AppointmentCreate(BaseModel):
    patient_id: str
    doctor_id: str
    appointment_date: str
    appointment_time: str
    reason: Optional[str] = None
    notes: Optional[str] = None

class Encounter(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    encounter_id: str
    patient_id: str
    patient_name: str
    doctor_id: str
    doctor_name: str
    appointment_id: Optional[str] = None
    chief_complaint: str
    vitals: Optional[dict] = None
    diagnosis: Optional[str] = None
    clinical_notes: Optional[str] = None
    treatment_plan: Optional[str] = None
    follow_up: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str

class EncounterCreate(BaseModel):
    patient_id: str
    appointment_id: Optional[str] = None
    chief_complaint: str
    vitals: Optional[dict] = None
    diagnosis: Optional[str] = None
    clinical_notes: Optional[str] = None
    treatment_plan: Optional[str] = None
    follow_up: Optional[str] = None

class Prescription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    prescription_id: str
    patient_id: str
    patient_name: str
    doctor_id: str
    doctor_name: str
    encounter_id: Optional[str] = None
    medications: List[dict]
    instructions: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str

class PrescriptionCreate(BaseModel):
    patient_id: str
    encounter_id: Optional[str] = None
    medications: List[dict]
    instructions: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    patient_id: str
    patient_name: str
    doctor_id: str
    doctor_name: str
    order_type: str  # lab, radiology
    test_name: str
    status: str  # pending, in_progress, completed, cancelled
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str

class OrderCreate(BaseModel):
    patient_id: str
    order_type: str
    test_name: str
    notes: Optional[str] = None

class Report(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    report_id: str
    patient_id: str
    patient_name: str
    order_id: Optional[str] = None
    report_type: str
    test_name: str
    file_data: Optional[str] = None
    file_name: Optional[str] = None
    findings: Optional[str] = None
    imaging_link: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    uploaded_by: str

class ReportCreate(BaseModel):
    patient_id: str
    order_id: Optional[str] = None
    report_type: str
    test_name: str
    findings: Optional[str] = None
    imaging_link: Optional[str] = None

class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_id: str
    patient_id: str
    patient_name: str
    items: List[dict]
    subtotal: float
    tax: float
    total: float
    payment_status: str  # pending, paid, partial
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str

class InvoiceCreate(BaseModel):
    patient_id: str
    items: List[dict]
    tax: float = 0.0
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class AuditLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    action: str
    resource_type: str
    resource_id: str
    details: Optional[dict] = None
    ip_address: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user_doc:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user_doc
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

async def log_audit(user_id: str, user_email: str, action: str, resource_type: str, resource_id: str, details: dict = None):
    audit = AuditLog(
        user_id=user_id,
        user_email=user_email,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details
    )
    doc = audit.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.audit_logs.insert_one(doc)

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=User)
async def register_user(input: UserCreate, current_user: dict = Depends(get_current_user)):
    # Only ADMIN users can register new users
    if current_user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Only administrators can register new users")
    
    # Check if user exists
    existing = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_pwd = hash_password(input.password)
    
    # Create user
    user_dict = input.model_dump(exclude={"password"})
    user = User(**user_dict)
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['password_hash'] = hashed_pwd
    
    await db.users.insert_one(doc)
    return user

@api_router.post("/auth/login", response_model=TokenResponse)
async def login_user(input: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user_doc or not verify_password(input.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user_doc.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is inactive")
    
    # Create token
    token = create_access_token({"sub": user_doc["id"], "email": user_doc["email"], "role": user_doc["role"]})
    
    # Remove password hash
    user_doc.pop("password_hash", None)
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    
    await log_audit(user.id, user.email, "LOGIN", "user", user.id)
    
    return TokenResponse(access_token=token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    if isinstance(current_user['created_at'], str):
        current_user['created_at'] = datetime.fromisoformat(current_user['created_at'])
    return User(**current_user)

# ==================== PATIENT ROUTES ====================

@api_router.post("/patients", response_model=Patient)
async def create_patient(input: PatientCreate, current_user: dict = Depends(get_current_user)):
    # Generate patient ID
    count = await db.patients.count_documents({})
    patient_id = f"PAT{str(count + 1).zfill(6)}"
    
    patient_dict = input.model_dump()
    patient = Patient(**patient_dict, patient_id=patient_id, created_by=current_user["id"])
    doc = patient.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.patients.insert_one(doc)
    await log_audit(current_user["id"], current_user["email"], "CREATE", "patient", patient.id)
    
    return patient

@api_router.get("/patients", response_model=List[Patient])
async def get_patients(search: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if search:
        query = {
            "$or": [
                {"full_name": {"$regex": search, "$options": "i"}},
                {"patient_id": {"$regex": search, "$options": "i"}},
                {"phone": {"$regex": search, "$options": "i"}}
            ]
        }
    
    patients = await db.patients.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for p in patients:
        if isinstance(p['created_at'], str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return patients

@api_router.get("/patients/{patient_id}", response_model=Patient)
async def get_patient(patient_id: str, current_user: dict = Depends(get_current_user)):
    patient = await db.patients.find_one({"id": patient_id}, {"_id": 0})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if isinstance(patient['created_at'], str):
        patient['created_at'] = datetime.fromisoformat(patient['created_at'])
    
    await log_audit(current_user["id"], current_user["email"], "VIEW", "patient", patient_id)
    return Patient(**patient)

@api_router.put("/patients/{patient_id}", response_model=Patient)
async def update_patient(patient_id: str, input: PatientCreate, current_user: dict = Depends(get_current_user)):
    existing = await db.patients.find_one({"id": patient_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    update_data = input.model_dump()
    await db.patients.update_one({"id": patient_id}, {"$set": update_data})
    
    updated = await db.patients.find_one({"id": patient_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    
    await log_audit(current_user["id"], current_user["email"], "UPDATE", "patient", patient_id)
    return Patient(**updated)

# ==================== APPOINTMENT ROUTES ====================

@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(input: AppointmentCreate, current_user: dict = Depends(get_current_user)):
    # Get patient and doctor details
    patient = await db.patients.find_one({"id": input.patient_id}, {"_id": 0})
    doctor = await db.users.find_one({"id": input.doctor_id, "role": "DOCTOR"}, {"_id": 0})
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    count = await db.appointments.count_documents({})
    appointment_id = f"APT{str(count + 1).zfill(6)}"
    
    appointment_dict = input.model_dump()
    appointment = Appointment(
        **appointment_dict,
        appointment_id=appointment_id,
        patient_name=patient["full_name"],
        doctor_name=doctor["full_name"],
        status="scheduled",
        created_by=current_user["id"]
    )
    doc = appointment.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.appointments.insert_one(doc)
    await log_audit(current_user["id"], current_user["email"], "CREATE", "appointment", appointment.id)
    
    return appointment

@api_router.get("/appointments", response_model=List[Appointment])
async def get_appointments(doctor_id: Optional[str] = None, patient_id: Optional[str] = None, date: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if doctor_id:
        query["doctor_id"] = doctor_id
    if patient_id:
        query["patient_id"] = patient_id
    if date:
        query["appointment_date"] = date
    
    appointments = await db.appointments.find(query, {"_id": 0}).sort("appointment_date", -1).to_list(1000)
    for a in appointments:
        if isinstance(a['created_at'], str):
            a['created_at'] = datetime.fromisoformat(a['created_at'])
    return appointments

@api_router.get("/appointments/{appointment_id}", response_model=Appointment)
async def get_appointment(appointment_id: str, current_user: dict = Depends(get_current_user)):
    appointment = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if isinstance(appointment['created_at'], str):
        appointment['created_at'] = datetime.fromisoformat(appointment['created_at'])
    return Appointment(**appointment)

@api_router.patch("/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, status: str, current_user: dict = Depends(get_current_user)):
    await db.appointments.update_one({"id": appointment_id}, {"$set": {"status": status}})
    await log_audit(current_user["id"], current_user["email"], "UPDATE_STATUS", "appointment", appointment_id, {"status": status})
    return {"message": "Status updated"}

# ==================== ENCOUNTER ROUTES ====================

@api_router.post("/encounters", response_model=Encounter)
async def create_encounter(input: EncounterCreate, current_user: dict = Depends(get_current_user)):
    patient = await db.patients.find_one({"id": input.patient_id}, {"_id": 0})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    count = await db.encounters.count_documents({})
    encounter_id = f"ENC{str(count + 1).zfill(6)}"
    
    encounter_dict = input.model_dump()
    encounter = Encounter(
        **encounter_dict,
        encounter_id=encounter_id,
        patient_name=patient["full_name"],
        doctor_id=current_user["id"],
        doctor_name=current_user["full_name"],
        created_by=current_user["id"]
    )
    doc = encounter.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.encounters.insert_one(doc)
    await log_audit(current_user["id"], current_user["email"], "CREATE", "encounter", encounter.id)
    
    # Update appointment status if linked
    if input.appointment_id:
        await db.appointments.update_one({"id": input.appointment_id}, {"$set": {"status": "completed"}})
    
    return encounter

@api_router.get("/encounters", response_model=List[Encounter])
async def get_encounters(patient_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if patient_id:
        query["patient_id"] = patient_id
    
    encounters = await db.encounters.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for e in encounters:
        if isinstance(e['created_at'], str):
            e['created_at'] = datetime.fromisoformat(e['created_at'])
    return encounters

@api_router.get("/encounters/{encounter_id}", response_model=Encounter)
async def get_encounter(encounter_id: str, current_user: dict = Depends(get_current_user)):
    encounter = await db.encounters.find_one({"id": encounter_id}, {"_id": 0})
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter not found")
    
    if isinstance(encounter['created_at'], str):
        encounter['created_at'] = datetime.fromisoformat(encounter['created_at'])
    
    await log_audit(current_user["id"], current_user["email"], "VIEW", "encounter", encounter_id)
    return Encounter(**encounter)

# ==================== PRESCRIPTION ROUTES ====================

@api_router.post("/prescriptions", response_model=Prescription)
async def create_prescription(input: PrescriptionCreate, current_user: dict = Depends(get_current_user)):
    patient = await db.patients.find_one({"id": input.patient_id}, {"_id": 0})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    count = await db.prescriptions.count_documents({})
    prescription_id = f"RX{str(count + 1).zfill(6)}"
    
    prescription_dict = input.model_dump()
    prescription = Prescription(
        **prescription_dict,
        prescription_id=prescription_id,
        patient_name=patient["full_name"],
        doctor_id=current_user["id"],
        doctor_name=current_user["full_name"],
        created_by=current_user["id"]
    )
    doc = prescription.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.prescriptions.insert_one(doc)
    await log_audit(current_user["id"], current_user["email"], "CREATE", "prescription", prescription.id)
    
    return prescription

@api_router.get("/prescriptions", response_model=List[Prescription])
async def get_prescriptions(patient_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if patient_id:
        query["patient_id"] = patient_id
    
    prescriptions = await db.prescriptions.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for p in prescriptions:
        if isinstance(p['created_at'], str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return prescriptions

@api_router.get("/prescriptions/{prescription_id}", response_model=Prescription)
async def get_prescription(prescription_id: str, current_user: dict = Depends(get_current_user)):
    prescription = await db.prescriptions.find_one({"id": prescription_id}, {"_id": 0})
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    if isinstance(prescription['created_at'], str):
        prescription['created_at'] = datetime.fromisoformat(prescription['created_at'])
    
    await log_audit(current_user["id"], current_user["email"], "VIEW", "prescription", prescription_id)
    return Prescription(**prescription)

# ==================== ORDER ROUTES ====================

@api_router.post("/orders", response_model=Order)
async def create_order(input: OrderCreate, current_user: dict = Depends(get_current_user)):
    patient = await db.patients.find_one({"id": input.patient_id}, {"_id": 0})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    count = await db.orders.count_documents({})
    order_id = f"ORD{str(count + 1).zfill(6)}"
    
    order_dict = input.model_dump()
    order = Order(
        **order_dict,
        order_id=order_id,
        patient_name=patient["full_name"],
        doctor_id=current_user["id"],
        doctor_name=current_user["full_name"],
        status="pending",
        created_by=current_user["id"]
    )
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.orders.insert_one(doc)
    await log_audit(current_user["id"], current_user["email"], "CREATE", "order", order.id)
    
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_orders(patient_id: Optional[str] = None, status: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if patient_id:
        query["patient_id"] = patient_id
    if status:
        query["status"] = status
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for o in orders:
        if isinstance(o['created_at'], str):
            o['created_at'] = datetime.fromisoformat(o['created_at'])
    return orders

@api_router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, current_user: dict = Depends(get_current_user)):
    await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    await log_audit(current_user["id"], current_user["email"], "UPDATE_STATUS", "order", order_id, {"status": status})
    return {"message": "Status updated"}

# ==================== REPORT ROUTES ====================

@api_router.post("/reports", response_model=Report)
async def create_report(input: ReportCreate, current_user: dict = Depends(get_current_user)):
    patient = await db.patients.find_one({"id": input.patient_id}, {"_id": 0})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    count = await db.reports.count_documents({})
    report_id = f"RPT{str(count + 1).zfill(6)}"
    
    report_dict = input.model_dump()
    report = Report(
        **report_dict,
        report_id=report_id,
        patient_name=patient["full_name"],
        uploaded_by=current_user["id"]
    )
    doc = report.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.reports.insert_one(doc)
    await log_audit(current_user["id"], current_user["email"], "CREATE", "report", report.id)
    
    # Update order status if linked
    if input.order_id:
        await db.orders.update_one({"id": input.order_id}, {"$set": {"status": "completed"}})
    
    return report

@api_router.post("/reports/upload")
async def upload_report_file(file: UploadFile = File(...), patient_id: str = "", order_id: str = "", report_type: str = "", test_name: str = "", current_user: dict = Depends(get_current_user)):
    if not patient_id or not report_type or not test_name:
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    # Read file and encode to base64
    contents = await file.read()
    file_data = base64.b64encode(contents).decode('utf-8')
    
    patient = await db.patients.find_one({"id": patient_id}, {"_id": 0})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    count = await db.reports.count_documents({})
    report_id = f"RPT{str(count + 1).zfill(6)}"
    
    report = Report(
        report_id=report_id,
        patient_id=patient_id,
        patient_name=patient["full_name"],
        order_id=order_id if order_id else None,
        report_type=report_type,
        test_name=test_name,
        file_data=file_data,
        file_name=file.filename,
        uploaded_by=current_user["id"]
    )
    doc = report.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.reports.insert_one(doc)
    await log_audit(current_user["id"], current_user["email"], "UPLOAD", "report", report.id)
    
    if order_id:
        await db.orders.update_one({"id": order_id}, {"$set": {"status": "completed"}})
    
    return {"message": "Report uploaded", "report_id": report.id}

@api_router.get("/reports", response_model=List[Report])
async def get_reports(patient_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if patient_id:
        query["patient_id"] = patient_id
    
    reports = await db.reports.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for r in reports:
        if isinstance(r['created_at'], str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
    return reports

# ==================== BILLING ROUTES ====================

@api_router.post("/invoices", response_model=Invoice)
async def create_invoice(input: InvoiceCreate, current_user: dict = Depends(get_current_user)):
    patient = await db.patients.find_one({"id": input.patient_id}, {"_id": 0})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    count = await db.invoices.count_documents({})
    invoice_id = f"INV{str(count + 1).zfill(6)}"
    
    # Calculate totals
    subtotal = sum(item.get("amount", 0) for item in input.items)
    total = subtotal + input.tax
    
    invoice_dict = input.model_dump()
    invoice = Invoice(
        **invoice_dict,
        invoice_id=invoice_id,
        patient_name=patient["full_name"],
        subtotal=subtotal,
        total=total,
        payment_status="paid" if input.payment_method else "pending",
        created_by=current_user["id"]
    )
    doc = invoice.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.invoices.insert_one(doc)
    await log_audit(current_user["id"], current_user["email"], "CREATE", "invoice", invoice.id)
    
    return invoice

@api_router.get("/invoices", response_model=List[Invoice])
async def get_invoices(patient_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if patient_id:
        query["patient_id"] = patient_id
    
    invoices = await db.invoices.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for i in invoices:
        if isinstance(i['created_at'], str):
            i['created_at'] = datetime.fromisoformat(i['created_at'])
    return invoices

@api_router.get("/invoices/{invoice_id}", response_model=Invoice)
async def get_invoice(invoice_id: str, current_user: dict = Depends(get_current_user)):
    invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if isinstance(invoice['created_at'], str):
        invoice['created_at'] = datetime.fromisoformat(invoice['created_at'])
    
    await log_audit(current_user["id"], current_user["email"], "VIEW", "invoice", invoice_id)
    return Invoice(**invoice)

# ==================== DASHBOARD ROUTES ====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).date().isoformat()
    
    # Get counts
    total_patients = await db.patients.count_documents({})
    today_appointments = await db.appointments.count_documents({"appointment_date": today})
    pending_orders = await db.orders.count_documents({"status": "pending"})
    pending_invoices = await db.invoices.count_documents({"payment_status": "pending"})
    
    # Role-specific data
    if current_user["role"] == "DOCTOR":
        my_appointments = await db.appointments.find(
            {"doctor_id": current_user["id"], "appointment_date": today},
            {"_id": 0}
        ).to_list(100)
        for a in my_appointments:
            if isinstance(a['created_at'], str):
                a['created_at'] = datetime.fromisoformat(a['created_at'])
        
        return {
            "total_patients": total_patients,
            "today_appointments": len(my_appointments),
            "appointments": my_appointments
        }
    
    return {
        "total_patients": total_patients,
        "today_appointments": today_appointments,
        "pending_orders": pending_orders,
        "pending_invoices": pending_invoices
    }

# ==================== USER MANAGEMENT ====================

@api_router.get("/users", response_model=List[User])
async def get_users(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(1000)
    for u in users:
        if isinstance(u['created_at'], str):
            u['created_at'] = datetime.fromisoformat(u['created_at'])
    return users

@api_router.get("/users/doctors", response_model=List[User])
async def get_doctors(current_user: dict = Depends(get_current_user)):
    doctors = await db.users.find({"role": "DOCTOR", "is_active": True}, {"_id": 0, "password_hash": 0}).to_list(1000)
    for d in doctors:
        if isinstance(d['created_at'], str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
    return doctors

@api_router.patch("/users/{user_id}/status")
async def update_user_status(user_id: str, status_update: dict, current_user: dict = Depends(get_current_user)):
    # Only ADMIN users can update user status
    if current_user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Only administrators can update user status")
    
    # Prevent users from deactivating themselves
    if current_user["id"] == user_id and not status_update.get("is_active", True):
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account")
    
    # Update user status
    update_data = {"is_active": status_update.get("is_active", True)}
    result = await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    await log_audit(current_user["id"], current_user["email"], "UPDATE_STATUS", "user", user_id, update_data)
    return {"message": "User status updated successfully"}

# Include the router in the main app
app.include_router(api_router)

# Serve frontend static files
app.mount("/", StaticFiles(directory="../frontend/build", html=True), name="frontend")

# Fallback to serve index.html for any unmatched routes (SPA routing)
@app.exception_handler(404)
async def not_found_handler(request, exc):
    # For API routes, return JSON error
    if request.url.path.startswith("/api"):
        return JSONResponse(
            status_code=404,
            content={"detail": "Not found"}
        )
    
    # For all other routes, serve the frontend index.html
    try:
        return FileResponse("../frontend/build/index.html")
    except FileNotFoundError:
        return JSONResponse(
            status_code=404,
            content={"detail": "Frontend build not found"}
        )

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
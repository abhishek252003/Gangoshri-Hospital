#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, date

class GangosriHISAPITester:
    def __init__(self, base_url="https://medcore-his.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data storage
        self.created_patient_id = None
        self.created_appointment_id = None
        self.created_encounter_id = None
        self.created_prescription_id = None
        self.created_invoice_id = None
        self.doctor_user_id = None

    def log_result(self, test_name, success, details="", error_msg=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}: PASSED")
        else:
            print(f"❌ {test_name}: FAILED - {error_msg}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "error": error_msg
        })

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            return success, response.json() if response.content else {}, response.status_code

        except Exception as e:
            return False, {}, str(e)

    def test_user_registration(self):
        """Test user registration"""
        print("\n🔍 Testing User Registration...")
        
        # Test doctor registration
        doctor_data = {
            "email": f"doctor.test.{datetime.now().strftime('%H%M%S')}@gangosri.com",
            "password": "TestPass123!",
            "full_name": "Dr. Test Doctor",
            "role": "DOCTOR",
            "phone": "+91 9876543210",
            "employee_id": "DOC001",
            "specialization": "Cardiology"
        }
        
        success, response, status = self.make_request('POST', 'auth/register', doctor_data, 200)
        if success:
            self.doctor_user_id = response.get('id')
            self.log_result("Doctor Registration", True, f"Doctor ID: {self.doctor_user_id}")
        else:
            self.log_result("Doctor Registration", False, error_msg=f"Status: {status}, Response: {response}")
        
        # Test receptionist registration
        receptionist_data = {
            "email": f"receptionist.test.{datetime.now().strftime('%H%M%S')}@gangosri.com",
            "password": "TestPass123!",
            "full_name": "Test Receptionist",
            "role": "RECEPTIONIST",
            "phone": "+91 9876543211",
            "employee_id": "REC001"
        }
        
        success, response, status = self.make_request('POST', 'auth/register', receptionist_data, 200)
        self.log_result("Receptionist Registration", success, 
                       f"User ID: {response.get('id')}" if success else f"Status: {status}")

    def test_user_login(self):
        """Test user login"""
        print("\n🔍 Testing User Login...")
        
        # First register a test user for login
        login_user_data = {
            "email": f"login.test.{datetime.now().strftime('%H%M%S')}@gangosri.com",
            "password": "TestPass123!",
            "full_name": "Login Test User",
            "role": "DOCTOR",
            "phone": "+91 9876543212",
            "employee_id": "DOC002",
            "specialization": "General Medicine"
        }
        
        success, reg_response, status = self.make_request('POST', 'auth/register', login_user_data, 200)
        if not success:
            self.log_result("Login Test Setup", False, error_msg="Failed to create test user for login")
            return
        
        # Test login
        login_data = {
            "email": login_user_data["email"],
            "password": login_user_data["password"]
        }
        
        success, response, status = self.make_request('POST', 'auth/login', login_data, 200)
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_data = response['user']
            self.log_result("User Login", True, f"Token received, User: {self.user_data['full_name']}")
        else:
            self.log_result("User Login", False, error_msg=f"Status: {status}, Response: {response}")

    def test_auth_me(self):
        """Test get current user info"""
        print("\n🔍 Testing Auth Me Endpoint...")
        
        if not self.token:
            self.log_result("Auth Me", False, error_msg="No token available")
            return
        
        success, response, status = self.make_request('GET', 'auth/me', expected_status=200)
        if success and response.get('email'):
            self.log_result("Auth Me", True, f"User: {response['full_name']}")
        else:
            self.log_result("Auth Me", False, error_msg=f"Status: {status}")

    def test_patient_management(self):
        """Test patient CRUD operations"""
        print("\n🔍 Testing Patient Management...")
        
        if not self.token:
            self.log_result("Patient Management", False, error_msg="No token available")
            return
        
        # Create patient
        patient_data = {
            "full_name": "John Doe Patient",
            "date_of_birth": "1990-05-15",
            "gender": "Male",
            "phone": "+91 9876543213",
            "email": "john.patient@example.com",
            "address": "123 Test Street, Test City",
            "blood_group": "A+",
            "emergency_contact": "Jane Doe - +91 9876543214",
            "insurance_info": "Health Insurance Co. - Policy 12345",
            "medical_history": "No significant medical history",
            "allergies": "None known"
        }
        
        success, response, status = self.make_request('POST', 'patients', patient_data, 200)
        if success:
            self.created_patient_id = response.get('id')
            patient_id_display = response.get('patient_id')
            self.log_result("Create Patient", True, f"Patient ID: {patient_id_display}")
        else:
            self.log_result("Create Patient", False, error_msg=f"Status: {status}, Response: {response}")
            return
        
        # Get all patients
        success, response, status = self.make_request('GET', 'patients', expected_status=200)
        if success and isinstance(response, list):
            self.log_result("Get All Patients", True, f"Found {len(response)} patients")
        else:
            self.log_result("Get All Patients", False, error_msg=f"Status: {status}")
        
        # Get specific patient
        if self.created_patient_id:
            success, response, status = self.make_request('GET', f'patients/{self.created_patient_id}', expected_status=200)
            if success and response.get('full_name') == patient_data['full_name']:
                self.log_result("Get Patient by ID", True, f"Patient: {response['full_name']}")
            else:
                self.log_result("Get Patient by ID", False, error_msg=f"Status: {status}")
        
        # Search patients
        success, response, status = self.make_request('GET', 'patients?search=John', expected_status=200)
        if success and isinstance(response, list):
            self.log_result("Search Patients", True, f"Search returned {len(response)} results")
        else:
            self.log_result("Search Patients", False, error_msg=f"Status: {status}")

    def test_appointment_management(self):
        """Test appointment CRUD operations"""
        print("\n🔍 Testing Appointment Management...")
        
        if not self.token or not self.created_patient_id or not self.doctor_user_id:
            self.log_result("Appointment Management", False, error_msg="Missing prerequisites (token, patient, or doctor)")
            return
        
        # Create appointment
        appointment_data = {
            "patient_id": self.created_patient_id,
            "doctor_id": self.doctor_user_id,
            "appointment_date": date.today().isoformat(),
            "appointment_time": "10:30",
            "reason": "Regular checkup",
            "notes": "Patient requested morning slot"
        }
        
        success, response, status = self.make_request('POST', 'appointments', appointment_data, 200)
        if success:
            self.created_appointment_id = response.get('id')
            appointment_id_display = response.get('appointment_id')
            self.log_result("Create Appointment", True, f"Appointment ID: {appointment_id_display}")
        else:
            self.log_result("Create Appointment", False, error_msg=f"Status: {status}, Response: {response}")
            return
        
        # Get all appointments
        success, response, status = self.make_request('GET', 'appointments', expected_status=200)
        if success and isinstance(response, list):
            self.log_result("Get All Appointments", True, f"Found {len(response)} appointments")
        else:
            self.log_result("Get All Appointments", False, error_msg=f"Status: {status}")
        
        # Get appointment by ID
        if self.created_appointment_id:
            success, response, status = self.make_request('GET', f'appointments/{self.created_appointment_id}', expected_status=200)
            if success and response.get('patient_id') == self.created_patient_id:
                self.log_result("Get Appointment by ID", True, f"Appointment for: {response['patient_name']}")
            else:
                self.log_result("Get Appointment by ID", False, error_msg=f"Status: {status}")
        
        # Update appointment status
        if self.created_appointment_id:
            success, response, status = self.make_request('PATCH', f'appointments/{self.created_appointment_id}/status?status=completed', expected_status=200)
            self.log_result("Update Appointment Status", success, 
                           "Status updated to completed" if success else f"Status: {status}")

    def test_encounter_management(self):
        """Test encounter (consultation) management"""
        print("\n🔍 Testing Encounter Management...")
        
        if not self.token or not self.created_patient_id:
            self.log_result("Encounter Management", False, error_msg="Missing prerequisites")
            return
        
        # Create encounter
        encounter_data = {
            "patient_id": self.created_patient_id,
            "appointment_id": self.created_appointment_id,
            "chief_complaint": "Chest pain and shortness of breath",
            "vitals": {
                "blood_pressure": "120/80",
                "heart_rate": "72",
                "temperature": "98.6",
                "respiratory_rate": "16",
                "oxygen_saturation": "98"
            },
            "diagnosis": "Mild hypertension",
            "clinical_notes": "Patient reports occasional chest discomfort. Vital signs stable.",
            "treatment_plan": "Lifestyle modifications, follow-up in 2 weeks",
            "follow_up": "2 weeks"
        }
        
        success, response, status = self.make_request('POST', 'encounters', encounter_data, 200)
        if success:
            self.created_encounter_id = response.get('id')
            encounter_id_display = response.get('encounter_id')
            self.log_result("Create Encounter", True, f"Encounter ID: {encounter_id_display}")
        else:
            self.log_result("Create Encounter", False, error_msg=f"Status: {status}, Response: {response}")
            return
        
        # Get all encounters
        success, response, status = self.make_request('GET', 'encounters', expected_status=200)
        if success and isinstance(response, list):
            self.log_result("Get All Encounters", True, f"Found {len(response)} encounters")
        else:
            self.log_result("Get All Encounters", False, error_msg=f"Status: {status}")
        
        # Get encounter by ID
        if self.created_encounter_id:
            success, response, status = self.make_request('GET', f'encounters/{self.created_encounter_id}', expected_status=200)
            if success and response.get('patient_id') == self.created_patient_id:
                self.log_result("Get Encounter by ID", True, f"Encounter for: {response['patient_name']}")
            else:
                self.log_result("Get Encounter by ID", False, error_msg=f"Status: {status}")

    def test_prescription_management(self):
        """Test prescription management"""
        print("\n🔍 Testing Prescription Management...")
        
        if not self.token or not self.created_patient_id:
            self.log_result("Prescription Management", False, error_msg="Missing prerequisites")
            return
        
        # Create prescription
        prescription_data = {
            "patient_id": self.created_patient_id,
            "encounter_id": self.created_encounter_id,
            "medications": [
                {
                    "name": "Lisinopril",
                    "dosage": "10mg",
                    "frequency": "Once daily",
                    "duration": "30 days",
                    "instructions": "Take with food"
                },
                {
                    "name": "Aspirin",
                    "dosage": "81mg",
                    "frequency": "Once daily",
                    "duration": "30 days",
                    "instructions": "Take with food to avoid stomach upset"
                }
            ],
            "instructions": "Take medications as prescribed. Follow up if any side effects occur."
        }
        
        success, response, status = self.make_request('POST', 'prescriptions', prescription_data, 200)
        if success:
            self.created_prescription_id = response.get('id')
            prescription_id_display = response.get('prescription_id')
            self.log_result("Create Prescription", True, f"Prescription ID: {prescription_id_display}")
        else:
            self.log_result("Create Prescription", False, error_msg=f"Status: {status}, Response: {response}")
            return
        
        # Get all prescriptions
        success, response, status = self.make_request('GET', 'prescriptions', expected_status=200)
        if success and isinstance(response, list):
            self.log_result("Get All Prescriptions", True, f"Found {len(response)} prescriptions")
        else:
            self.log_result("Get All Prescriptions", False, error_msg=f"Status: {status}")
        
        # Get prescription by ID
        if self.created_prescription_id:
            success, response, status = self.make_request('GET', f'prescriptions/{self.created_prescription_id}', expected_status=200)
            if success and response.get('patient_id') == self.created_patient_id:
                self.log_result("Get Prescription by ID", True, f"Prescription for: {response['patient_name']}")
            else:
                self.log_result("Get Prescription by ID", False, error_msg=f"Status: {status}")

    def test_billing_management(self):
        """Test billing/invoice management"""
        print("\n🔍 Testing Billing Management...")
        
        if not self.token or not self.created_patient_id:
            self.log_result("Billing Management", False, error_msg="Missing prerequisites")
            return
        
        # Create invoice
        invoice_data = {
            "patient_id": self.created_patient_id,
            "items": [
                {
                    "description": "Consultation Fee",
                    "quantity": 1,
                    "rate": 500.00,
                    "amount": 500.00
                },
                {
                    "description": "ECG Test",
                    "quantity": 1,
                    "rate": 200.00,
                    "amount": 200.00
                }
            ],
            "tax": 63.00,  # 9% tax on 700
            "payment_method": "Cash",
            "notes": "Payment received in full"
        }
        
        success, response, status = self.make_request('POST', 'invoices', invoice_data, 200)
        if success:
            self.created_invoice_id = response.get('id')
            invoice_id_display = response.get('invoice_id')
            self.log_result("Create Invoice", True, f"Invoice ID: {invoice_id_display}, Total: ₹{response.get('total')}")
        else:
            self.log_result("Create Invoice", False, error_msg=f"Status: {status}, Response: {response}")
            return
        
        # Get all invoices
        success, response, status = self.make_request('GET', 'invoices', expected_status=200)
        if success and isinstance(response, list):
            self.log_result("Get All Invoices", True, f"Found {len(response)} invoices")
        else:
            self.log_result("Get All Invoices", False, error_msg=f"Status: {status}")
        
        # Get invoice by ID
        if self.created_invoice_id:
            success, response, status = self.make_request('GET', f'invoices/{self.created_invoice_id}', expected_status=200)
            if success and response.get('patient_id') == self.created_patient_id:
                self.log_result("Get Invoice by ID", True, f"Invoice for: {response['patient_name']}")
            else:
                self.log_result("Get Invoice by ID", False, error_msg=f"Status: {status}")

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        print("\n🔍 Testing Dashboard Stats...")
        
        if not self.token:
            self.log_result("Dashboard Stats", False, error_msg="No token available")
            return
        
        success, response, status = self.make_request('GET', 'dashboard/stats', expected_status=200)
        if success and 'total_patients' in response:
            self.log_result("Dashboard Stats", True, 
                           f"Patients: {response.get('total_patients')}, Today's Appointments: {response.get('today_appointments')}")
        else:
            self.log_result("Dashboard Stats", False, error_msg=f"Status: {status}")

    def test_user_management(self):
        """Test user management endpoints"""
        print("\n🔍 Testing User Management...")
        
        if not self.token:
            self.log_result("User Management", False, error_msg="No token available")
            return
        
        # Get doctors list
        success, response, status = self.make_request('GET', 'users/doctors', expected_status=200)
        if success and isinstance(response, list):
            self.log_result("Get Doctors List", True, f"Found {len(response)} doctors")
        else:
            self.log_result("Get Doctors List", False, error_msg=f"Status: {status}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Gangosri HIS API Tests...")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Run tests in order
        self.test_user_registration()
        self.test_user_login()
        self.test_auth_me()
        self.test_patient_management()
        self.test_appointment_management()
        self.test_encounter_management()
        self.test_prescription_management()
        self.test_billing_management()
        self.test_dashboard_stats()
        self.test_user_management()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        # Print failed tests
        failed_tests = [r for r in self.test_results if not r['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  • {test['test']}: {test['error']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = GangosriHISAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
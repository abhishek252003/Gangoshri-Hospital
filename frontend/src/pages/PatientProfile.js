import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PatientProfile({ user, onLogout }) {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [patientRes, encountersRes, prescriptionsRes, reportsRes] = await Promise.all([
        axios.get(`${API}/patients/${patientId}`, { headers }),
        axios.get(`${API}/encounters?patient_id=${patientId}`, { headers }),
        axios.get(`${API}/prescriptions?patient_id=${patientId}`, { headers }),
        axios.get(`${API}/reports?patient_id=${patientId}`, { headers })
      ]);
      
      setPatient(patientRes.data);
      setEncounters(encountersRes.data);
      setPrescriptions(prescriptionsRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      toast.error("Failed to fetch patient data");
    }
    setLoading(false);
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="text-center py-12">
          <p className="text-slate-500">Patient not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6" data-testid="patient-profile-container">
        <Button variant="ghost" onClick={() => navigate('/patients')} className="mb-4" data-testid="back-button">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Patients
        </Button>

        {/* Patient Header */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {patient.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Space Grotesk'}} data-testid="patient-name">{patient.full_name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-slate-500">Patient ID</p>
                    <p className="font-semibold text-slate-900" data-testid="patient-id">{patient.patient_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Age / Gender</p>
                    <p className="font-semibold text-slate-900">{calculateAge(patient.date_of_birth)} yrs / {patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Blood Group</p>
                    <p className="font-semibold text-slate-900">{patient.blood_group || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-semibold text-slate-900">{patient.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Details Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="info">Information</TabsTrigger>
            <TabsTrigger value="encounters">Encounters ({encounters.length})</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions ({prescriptions.length})</TabsTrigger>
            <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">{patient.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Date of Birth</p>
                    <p className="font-medium text-slate-900">{formatDate(patient.date_of_birth)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Address</p>
                    <p className="font-medium text-slate-900">{patient.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Emergency Contact</p>
                    <p className="font-medium text-slate-900">{patient.emergency_contact || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500">Insurance</p>
                    <p className="font-medium text-slate-900">{patient.insurance_info || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Allergies</p>
                    <p className="font-medium text-slate-900 text-red-600">{patient.allergies || 'None reported'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Medical History</p>
                    <p className="font-medium text-slate-900">{patient.medical_history || 'None reported'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="encounters" className="mt-6">
            {encounters.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <p className="text-slate-500">No encounters recorded</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {encounters.map((encounter) => (
                  <Card key={encounter.id} className="border-0 shadow-lg" data-testid={`encounter-${encounter.encounter_id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{encounter.chief_complaint}</CardTitle>
                        <span className="text-sm text-slate-500">{formatDate(encounter.created_at)}</span>
                      </div>
                      <p className="text-sm text-slate-600">Dr. {encounter.doctor_name}</p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {encounter.diagnosis && (
                        <div>
                          <p className="text-sm font-semibold text-slate-700">Diagnosis:</p>
                          <p className="text-sm text-slate-600">{encounter.diagnosis}</p>
                        </div>
                      )}
                      {encounter.clinical_notes && (
                        <div>
                          <p className="text-sm font-semibold text-slate-700">Clinical Notes:</p>
                          <p className="text-sm text-slate-600">{encounter.clinical_notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="mt-6">
            {prescriptions.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <p className="text-slate-500">No prescriptions recorded</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <Card key={prescription.id} className="border-0 shadow-lg" data-testid={`prescription-${prescription.prescription_id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{prescription.prescription_id}</CardTitle>
                        <span className="text-sm text-slate-500">{formatDate(prescription.created_at)}</span>
                      </div>
                      <p className="text-sm text-slate-600">Dr. {prescription.doctor_name}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-700">Medications:</p>
                        {prescription.medications.map((med, idx) => (
                          <div key={idx} className="bg-slate-50 p-3 rounded-lg">
                            <p className="font-medium text-slate-900">{med.name}</p>
                            <p className="text-sm text-slate-600">{med.dosage} - {med.frequency}</p>
                            {med.duration && <p className="text-sm text-slate-500">Duration: {med.duration}</p>}
                          </div>
                        ))}
                        {prescription.instructions && (
                          <div className="mt-3">
                            <p className="text-sm font-semibold text-slate-700">Instructions:</p>
                            <p className="text-sm text-slate-600">{prescription.instructions}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            {reports.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <p className="text-slate-500">No reports available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.map((report) => (
                  <Card key={report.id} className="border-0 shadow-lg" data-testid={`report-${report.report_id}`}>
                    <CardHeader>
                      <CardTitle className="text-lg">{report.test_name}</CardTitle>
                      <p className="text-sm text-slate-500">{report.report_type} - {formatDate(report.created_at)}</p>
                    </CardHeader>
                    <CardContent>
                      {report.findings && (
                        <p className="text-sm text-slate-600 mb-2">{report.findings}</p>
                      )}
                      {report.file_name && (
                        <p className="text-xs text-slate-500">File: {report.file_name}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Medical History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Previous Conditions</h4>
                    <p className="text-slate-600">{patient.medical_history || 'No medical history recorded'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Known Allergies</h4>
                    <p className="text-red-600">{patient.allergies || 'No allergies recorded'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
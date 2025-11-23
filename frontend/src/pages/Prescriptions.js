import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Prescriptions({ user, onLogout }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    medications: [{ name: "", dosage: "", frequency: "", duration: "" }],
    instructions: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [prescriptionsRes, patientsRes] = await Promise.all([
        axios.get(`${API}/prescriptions`, { headers }),
        axios.get(`${API}/patients`, { headers })
      ]);
      
      setPrescriptions(prescriptionsRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/prescriptions`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Prescription created successfully!");
      setDialogOpen(false);
      setFormData({
        patient_id: "",
        medications: [{ name: "", dosage: "", frequency: "", duration: "" }],
        instructions: ""
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create prescription");
    }
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: "", dosage: "", frequency: "", duration: "" }]
    });
  };

  const removeMedication = (index) => {
    const newMedications = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: newMedications });
  };

  const updateMedication = (index, field, value) => {
    const newMedications = [...formData.medications];
    newMedications[index][field] = value;
    setFormData({ ...formData, medications: newMedications });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6" data-testid="prescriptions-container">
        <div className="flex items-center justify-between">
          <p className="text-slate-600">Manage patient prescriptions and medications</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" data-testid="add-prescription-button">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Prescription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl" style={{fontFamily: 'Space Grotesk'}}>Create Prescription</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient *</Label>
                  <Select value={formData.patient_id} onValueChange={(value) => setFormData({ ...formData, patient_id: value })} required>
                    <SelectTrigger data-testid="prescription-patient-select">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name} ({patient.patient_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="font-semibold">Medications *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addMedication} data-testid="add-medication-button">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Medication
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {formData.medications.map((med, index) => (
                      <Card key={index} className="border-2 border-slate-200">
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-semibold">Medication {index + 1}</Label>
                              {formData.medications.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMedication(index)}
                                  className="text-red-600 hover:text-red-700"
                                  data-testid={`remove-medication-${index}`}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label htmlFor={`med-name-${index}`} className="text-xs">Medicine Name *</Label>
                                <Input
                                  id={`med-name-${index}`}
                                  placeholder="e.g., Amoxicillin"
                                  value={med.name}
                                  onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                  required
                                  data-testid={`medication-name-${index}`}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`med-dosage-${index}`} className="text-xs">Dosage *</Label>
                                <Input
                                  id={`med-dosage-${index}`}
                                  placeholder="e.g., 500mg"
                                  value={med.dosage}
                                  onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                  required
                                  data-testid={`medication-dosage-${index}`}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`med-frequency-${index}`} className="text-xs">Frequency *</Label>
                                <Input
                                  id={`med-frequency-${index}`}
                                  placeholder="e.g., 3 times daily"
                                  value={med.frequency}
                                  onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                  required
                                  data-testid={`medication-frequency-${index}`}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`med-duration-${index}`} className="text-xs">Duration</Label>
                                <Input
                                  id={`med-duration-${index}`}
                                  placeholder="e.g., 7 days"
                                  value={med.duration}
                                  onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                  data-testid={`medication-duration-${index}`}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Additional instructions for the patient"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    rows={3}
                    data-testid="prescription-instructions-input"
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" data-testid="submit-prescription-button">
                  Create Prescription
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : prescriptions.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500">No prescriptions created yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <Card key={prescription.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow" data-testid={`prescription-card-${prescription.prescription_id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{prescription.patient_name}</CardTitle>
                      <p className="text-sm text-slate-500 mt-1">{prescription.prescription_id} • {formatDate(prescription.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-purple-600">Dr. {prescription.doctor_name}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">Medications:</p>
                    <div className="space-y-2">
                      {prescription.medications.map((med, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900">{med.name}</p>
                              <p className="text-sm text-slate-600 mt-1">
                                <span className="font-medium">{med.dosage}</span> • {med.frequency}
                              </p>
                              {med.duration && (
                                <p className="text-xs text-slate-500 mt-1">Duration: {med.duration}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {prescription.instructions && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Instructions:</p>
                      <p className="text-slate-600 mt-1">{prescription.instructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
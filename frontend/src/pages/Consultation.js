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

export default function Consultation({ user, onLogout }) {
  const [encounters, setEncounters] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    appointment_id: "",
    chief_complaint: "",
    vitals: {
      temperature: "",
      blood_pressure: "",
      heart_rate: "",
      respiratory_rate: "",
      oxygen_saturation: ""
    },
    diagnosis: "",
    clinical_notes: "",
    treatment_plan: "",
    follow_up: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [encountersRes, patientsRes] = await Promise.all([
        axios.get(`${API}/encounters`, { headers }),
        axios.get(`${API}/patients`, { headers })
      ]);
      
      setEncounters(encountersRes.data);
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
      await axios.post(`${API}/encounters`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Consultation notes saved successfully!");
      setDialogOpen(false);
      setFormData({
        patient_id: "",
        appointment_id: "",
        chief_complaint: "",
        vitals: {
          temperature: "",
          blood_pressure: "",
          heart_rate: "",
          respiratory_rate: "",
          oxygen_saturation: ""
        },
        diagnosis: "",
        clinical_notes: "",
        treatment_plan: "",
        follow_up: ""
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save consultation notes");
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6" data-testid="consultation-container">
        <div className="flex items-center justify-between">
          <p className="text-slate-600">Record patient consultation notes and diagnoses</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" data-testid="add-consultation-button">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Consultation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl" style={{fontFamily: 'Space Grotesk'}}>Consultation Notes</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient *</Label>
                  <Select value={formData.patient_id} onValueChange={(value) => setFormData({ ...formData, patient_id: value })} required>
                    <SelectTrigger data-testid="consultation-patient-select">
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

                <div className="space-y-2">
                  <Label htmlFor="complaint">Chief Complaint *</Label>
                  <Input
                    id="complaint"
                    placeholder="e.g., Fever and headache"
                    value={formData.chief_complaint}
                    onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                    required
                    data-testid="consultation-complaint-input"
                  />
                </div>

                <div>
                  <Label className="mb-3 block font-semibold">Vitals</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temp" className="text-sm">Temperature (°F)</Label>
                      <Input
                        id="temp"
                        placeholder="98.6"
                        value={formData.vitals.temperature}
                        onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, temperature: e.target.value } })}
                        data-testid="consultation-temp-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bp" className="text-sm">Blood Pressure</Label>
                      <Input
                        id="bp"
                        placeholder="120/80"
                        value={formData.vitals.blood_pressure}
                        onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, blood_pressure: e.target.value } })}
                        data-testid="consultation-bp-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hr" className="text-sm">Heart Rate (bpm)</Label>
                      <Input
                        id="hr"
                        placeholder="72"
                        value={formData.vitals.heart_rate}
                        onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, heart_rate: e.target.value } })}
                        data-testid="consultation-hr-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rr" className="text-sm">Respiratory Rate</Label>
                      <Input
                        id="rr"
                        placeholder="16"
                        value={formData.vitals.respiratory_rate}
                        onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, respiratory_rate: e.target.value } })}
                        data-testid="consultation-rr-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="Enter diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    rows={2}
                    data-testid="consultation-diagnosis-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinical-notes">Clinical Notes</Label>
                  <Textarea
                    id="clinical-notes"
                    placeholder="Detailed clinical observations and examination notes"
                    value={formData.clinical_notes}
                    onChange={(e) => setFormData({ ...formData, clinical_notes: e.target.value })}
                    rows={4}
                    data-testid="consultation-notes-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment">Treatment Plan</Label>
                  <Textarea
                    id="treatment"
                    placeholder="Prescribed treatment and recommendations"
                    value={formData.treatment_plan}
                    onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
                    rows={3}
                    data-testid="consultation-treatment-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="followup">Follow-up</Label>
                  <Input
                    id="followup"
                    placeholder="e.g., Follow-up in 1 week"
                    value={formData.follow_up}
                    onChange={(e) => setFormData({ ...formData, follow_up: e.target.value })}
                    data-testid="consultation-followup-input"
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" data-testid="submit-consultation-button">
                  Save Consultation
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : encounters.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500">No consultation records yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {encounters.map((encounter) => (
              <Card key={encounter.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow" data-testid={`encounter-card-${encounter.encounter_id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{encounter.patient_name}</CardTitle>
                      <p className="text-sm text-slate-500 mt-1">{encounter.encounter_id} • {formatDate(encounter.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-purple-600">Dr. {encounter.doctor_name}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Chief Complaint:</p>
                    <p className="text-slate-900">{encounter.chief_complaint}</p>
                  </div>

                  {encounter.vitals && Object.keys(encounter.vitals).length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">Vitals:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {encounter.vitals.temperature && (
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <p className="text-xs text-slate-500">Temperature</p>
                            <p className="font-semibold text-slate-900">{encounter.vitals.temperature}°F</p>
                          </div>
                        )}
                        {encounter.vitals.blood_pressure && (
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <p className="text-xs text-slate-500">Blood Pressure</p>
                            <p className="font-semibold text-slate-900">{encounter.vitals.blood_pressure}</p>
                          </div>
                        )}
                        {encounter.vitals.heart_rate && (
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <p className="text-xs text-slate-500">Heart Rate</p>
                            <p className="font-semibold text-slate-900">{encounter.vitals.heart_rate} bpm</p>
                          </div>
                        )}
                        {encounter.vitals.respiratory_rate && (
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <p className="text-xs text-slate-500">Respiratory Rate</p>
                            <p className="font-semibold text-slate-900">{encounter.vitals.respiratory_rate}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {encounter.diagnosis && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Diagnosis:</p>
                      <p className="text-slate-900">{encounter.diagnosis}</p>
                    </div>
                  )}

                  {encounter.clinical_notes && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Clinical Notes:</p>
                      <p className="text-slate-600">{encounter.clinical_notes}</p>
                    </div>
                  )}

                  {encounter.treatment_plan && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Treatment Plan:</p>
                      <p className="text-slate-600">{encounter.treatment_plan}</p>
                    </div>
                  )}

                  {encounter.follow_up && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Follow-up:</p>
                      <p className="text-slate-600">{encounter.follow_up}</p>
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
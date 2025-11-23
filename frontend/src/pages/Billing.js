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

export default function Billing({ user, onLogout }) {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    items: [{ description: "", amount: 0 }],
    tax: 0,
    payment_method: "",
    notes: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [invoicesRes, patientsRes] = await Promise.all([
        axios.get(`${API}/invoices`, { headers }),
        axios.get(`${API}/patients`, { headers })
      ]);
      
      setInvoices(invoicesRes.data);
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
      await axios.post(`${API}/invoices`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Invoice created successfully!");
      setDialogOpen(false);
      setFormData({
        patient_id: "",
        items: [{ description: "", amount: 0 }],
        tax: 0,
        payment_method: "",
        notes: ""
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create invoice");
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", amount: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + (parseFloat(formData.tax) || 0);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'partial': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6" data-testid="billing-container">
        <div className="flex items-center justify-between">
          <p className="text-slate-600">Manage patient billing and invoices</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" data-testid="add-invoice-button">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl" style={{fontFamily: 'Space Grotesk'}}>Create Invoice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient *</Label>
                  <Select value={formData.patient_id} onValueChange={(value) => setFormData({ ...formData, patient_id: value })} required>
                    <SelectTrigger data-testid="invoice-patient-select">
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
                    <Label className="font-semibold">Invoice Items *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem} data-testid="add-item-button">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <Card key={index} className="border-2 border-slate-200">
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-semibold">Item {index + 1}</Label>
                              {formData.items.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(index)}
                                  className="text-red-600 hover:text-red-700"
                                  data-testid={`remove-item-${index}`}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="col-span-2 space-y-1">
                                <Label htmlFor={`item-desc-${index}`} className="text-xs">Description *</Label>
                                <Input
                                  id={`item-desc-${index}`}
                                  placeholder="e.g., Consultation fee"
                                  value={item.description}
                                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                                  required
                                  data-testid={`item-description-${index}`}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`item-amount-${index}`} className="text-xs">Amount (₹) *</Label>
                                <Input
                                  id={`item-amount-${index}`}
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={item.amount}
                                  onChange={(e) => updateItem(index, 'amount', e.target.value)}
                                  required
                                  data-testid={`item-amount-${index}`}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax" className="text-xs">Tax (₹)</Label>
                    <Input
                      id="tax"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.tax}
                      onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                      data-testid="invoice-tax-input"
                    />
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                    <span className="text-slate-900">Total:</span>
                    <span className="text-purple-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                    <SelectTrigger data-testid="invoice-payment-select">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">Leave empty if payment is pending</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    data-testid="invoice-notes-input"
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" data-testid="submit-invoice-button">
                  Create Invoice
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : invoices.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-slate-500">No invoices created yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow" data-testid={`invoice-card-${invoice.invoice_id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{invoice.patient_name}</CardTitle>
                      <p className="text-sm text-slate-500 mt-1">{invoice.invoice_id} • {formatDate(invoice.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600 mb-2">{formatCurrency(invoice.total)}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.payment_status)}`}>
                        {invoice.payment_status}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Items:</p>
                    <div className="space-y-2">
                      {invoice.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                          <span className="text-slate-900">{item.description}</span>
                          <span className="font-semibold text-slate-900">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="text-slate-900">{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tax:</span>
                      <span className="text-slate-900">{formatCurrency(invoice.tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                      <span className="text-slate-900">Total:</span>
                      <span className="text-purple-600">{formatCurrency(invoice.total)}</span>
                    </div>
                  </div>
                  {invoice.payment_method && (
                    <div>
                      <p className="text-sm text-slate-600">Payment Method: <span className="font-semibold text-slate-900">{invoice.payment_method}</span></p>
                    </div>
                  )}
                  {invoice.notes && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Notes:</p>
                      <p className="text-sm text-slate-600">{invoice.notes}</p>
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
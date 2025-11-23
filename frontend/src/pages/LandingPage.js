import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LandingPage({ onLogin }) {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      toast.success("Login successful!");
      onLogin(response.data.access_token, response.data.user);
    } catch (error) {
      let errorMessage = "Login failed";
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : JSON.stringify(error.response.data.detail);
      }
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const features = [
    {
      title: "Patient Management",
      description: "Comprehensive patient records with medical history tracking, appointment scheduling, and treatment plans.",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    },
    {
      title: "Appointment Scheduling",
      description: "Efficient appointment booking and management system with automated reminders and rescheduling options.",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    },
    {
      title: "Electronic Prescriptions",
      description: "Digital prescription writing and management with drug interaction checking and pharmacy integration.",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    },
    {
      title: "Billing & Invoicing",
      description: "Automated billing and financial management with insurance integration and payment tracking.",
      icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
    },
    {
      title: "Laboratory Integration",
      description: "Seamless integration with lab systems for test ordering, result tracking, and report generation.",
      icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
    },
    {
      title: "Telemedicine Support",
      description: "Virtual consultation capabilities with secure video conferencing and remote patient monitoring.",
      icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief of Medicine",
      hospital: "City General Hospital",
      quote: "Gangosri HIS has transformed how we manage patient care. The intuitive interface and comprehensive features have increased our efficiency by 40%.",
      avatar: "SJ"
    },
    {
      name: "Dr. Michael Chen",
      role: "Emergency Department Head",
      hospital: "Metropolitan Medical Center",
      quote: "The appointment scheduling and patient tracking features have streamlined our operations. Our staff productivity has never been higher.",
      avatar: "MC"
    },
    {
      name: "Nurse Patricia Williams",
      role: "Nurse Manager",
      hospital: "Community Health Center",
      quote: "As a nurse, I appreciate how easy it is to access patient records and update treatment plans. The system has made our job so much easier.",
      avatar: "PW"
    }
  ];

  const faqs = [
    {
      question: "How secure is patient data in Gangosri HIS?",
      answer: "We take data security very seriously. All patient data is encrypted both in transit and at rest using industry-standard encryption protocols. Our system is fully HIPAA compliant and undergoes regular security audits to ensure the highest level of protection for sensitive healthcare information."
    },
    {
      question: "Can I integrate Gangosri HIS with my existing hospital systems?",
      answer: "Yes, our system is designed for seamless integration with existing hospital infrastructure. We support integration with laboratory systems, pharmacy management systems, radiology systems, and other common healthcare IT systems through standard APIs and HL7 protocols."
    },
    {
      question: "What kind of training is provided for staff?",
      answer: "We provide comprehensive training programs for all staff levels. This includes online training modules, live webinars, on-site training sessions, and detailed documentation. Our support team is also available 24/7 to assist with any questions or issues."
    },
    {
      question: "How long does implementation typically take?",
      answer: "Implementation time varies based on hospital size and existing systems. For most hospitals, the basic system can be up and running within 2-4 weeks. Full integration with existing systems may take 2-3 months. Our team works closely with you to ensure a smooth transition."
    },
    {
      question: "Is telemedicine functionality included?",
      answer: "Yes, our system includes robust telemedicine capabilities with secure video conferencing, remote patient monitoring, digital prescription writing, and integration with popular telehealth platforms. All telemedicine features comply with healthcare privacy regulations."
    },
    {
      question: "What support options are available?",
      answer: "We offer 24/7 technical support through multiple channels including phone, email, and live chat. Our support team includes healthcare IT specialists who understand the unique needs of medical environments. We also provide regular system updates and maintenance with minimal downtime."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="px-4 py-6 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900" style={{fontFamily: 'Space Grotesk'}}>Gangosri HIS</span>
              <p className="text-xs text-slate-500 -mt-1">Hospital Information System</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowLogin(!showLogin)}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200"
          >
            {showLogin ? "Back to Home" : "Login"}
          </Button>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 lg:px-8">
        {showLogin ? (
          /* Login Form */
          <div className="max-w-md mx-auto mt-12">
            <Card className="shadow-xl border border-slate-200 rounded-xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                  <p className="text-slate-600 mt-2">Sign in to your account</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="doctor@gangosri.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className="py-3 px-4 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="py-3 px-4 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-3 rounded-lg shadow-md transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : "Sign In"}
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-600">
                    New user registration is restricted. Please contact your administrator.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Landing Page Content */
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center py-16 md:py-24">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Trusted by 500+ healthcare facilities
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 max-w-4xl mx-auto leading-tight" style={{fontFamily: 'Space Grotesk'}}>
                Modern Healthcare Management for the Digital Age
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                Streamline hospital operations with our comprehensive digital solution for patient management, appointments, and medical records. 
                Designed by healthcare professionals for healthcare professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setShowLogin(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-4 text-lg rounded-lg shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  className="px-8 py-4 text-lg border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg shadow transition-all duration-200"
                >
                  Schedule Demo
                </Button>
              </div>
            </div>

            {/* Logo Cloud */}
            <div className="py-12 bg-white rounded-2xl shadow-sm mb-16">
              <div className="max-w-7xl mx-auto px-4">
                <p className="text-center text-slate-500 text-sm font-medium mb-8">TRUSTED BY LEADING HEALTHCARE INSTITUTIONS</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
                  <div className="flex justify-center">
                    <div className="w-32 h-16 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 font-bold">
                      Hospital A
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-32 h-16 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 font-bold">
                      Clinic B
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-32 h-16 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 font-bold">
                      Medical C
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-32 h-16 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 font-bold">
                      Center D
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="py-16">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Powerful Healthcare Solutions</h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Everything you need to manage your healthcare facility efficiently and provide exceptional patient care
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center mb-5">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm mb-16">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple Implementation Process</h2>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                    Get your system up and running in just three straightforward steps
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center bg-white p-8 rounded-xl shadow-sm">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-2xl font-bold text-white">1</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">Assessment & Planning</h3>
                    <p className="text-slate-600">
                      Our experts assess your current systems and create a customized implementation plan tailored to your facility's needs.
                    </p>
                  </div>
                  <div className="text-center bg-white p-8 rounded-xl shadow-sm">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">Deployment & Integration</h3>
                    <p className="text-slate-600">
                      We deploy the system and seamlessly integrate it with your existing infrastructure with minimal disruption to operations.
                    </p>
                  </div>
                  <div className="text-center bg-white p-8 rounded-xl shadow-sm">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">Training & Support</h3>
                    <p className="text-slate-600">
                      Comprehensive training for your staff and ongoing support to ensure smooth adoption and maximum system benefits.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="py-16">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Trusted by Healthcare Professionals</h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Hear from hospitals and clinics that have transformed their operations with our system
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="border border-slate-200 rounded-xl shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 text-lg">{testimonial.name}</h4>
                          <p className="text-sm text-slate-600">{testimonial.role}</p>
                          <p className="text-xs text-slate-500">{testimonial.hospital}</p>
                        </div>
                      </div>
                      <p className="text-slate-600 italic leading-relaxed">"{testimonial.quote}"</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div className="py-16">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div className="p-6 bg-white rounded-xl shadow-sm">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">500+</div>
                  <div className="text-slate-600 font-medium">Hospitals Worldwide</div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">50,000+</div>
                  <div className="text-slate-600 font-medium">Medical Professionals</div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">2M+</div>
                  <div className="text-slate-600 font-medium">Patients Managed</div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">99.9%</div>
                  <div className="text-slate-600 font-medium">System Uptime</div>
                </div>
              </div>
            </div>

            {/* Security & Compliance */}
            <div className="py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-sm mb-16">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Enterprise-Grade Security</h2>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                    Built with the highest standards for healthcare data protection and compliance
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center bg-white p-8 rounded-xl shadow-sm">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">HIPAA Compliant</h3>
                    <p className="text-slate-600">
                      Fully compliant with healthcare privacy regulations and data protection standards.
                    </p>
                  </div>
                  <div className="text-center bg-white p-8 rounded-xl shadow-sm">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">End-to-End Encryption</h3>
                    <p className="text-slate-600">
                      All data is encrypted both in transit and at rest using industry-standard protocols.
                    </p>
                  </div>
                  <div className="text-center bg-white p-8 rounded-xl shadow-sm">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">Regular Audits</h3>
                    <p className="text-slate-600">
                      Continuous security monitoring and regular third-party security audits.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center py-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg text-white mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Healthcare Facility?</h2>
              <p className="text-xl max-w-3xl mx-auto mb-10 text-blue-100">
                Join hundreds of healthcare professionals who trust Gangosri HIS for their daily operations and patient care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setShowLogin(true)}
                  className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 text-lg rounded-lg shadow-lg transition-all duration-200"
                >
                  Start Your Journey
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-blue-700 px-8 py-4 text-lg rounded-lg shadow-lg transition-all duration-200"
                >
                  Contact Sales
                </Button>
              </div>
            </div>

            {/* FAQ Section - Moved to the end and in accordion format */}
            <div className="py-16 bg-white rounded-2xl shadow-sm">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                    Everything you need to know about Gangosri HIS
                  </p>
                </div>
                
                <div className="max-w-4xl mx-auto">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg mb-4">
                      <button
                        className="flex justify-between items-center w-full p-6 text-left hover:bg-slate-50 transition-colors"
                        onClick={() => toggleFaq(index)}
                      >
                        <h3 className="text-lg font-semibold text-slate-900">{faq.question}</h3>
                        <svg 
                          className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${openFaqIndex === index ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {openFaqIndex === index && (
                        <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                          <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-2xl font-bold" style={{fontFamily: 'Space Grotesk'}}>Gangosri HIS</span>
              </div>
              <p className="text-slate-400 max-w-md mb-6 leading-relaxed">
                Empowering healthcare professionals with cutting-edge technology to deliver exceptional patient care and streamline hospital operations.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Products</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Patient Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Appointment Scheduling</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Electronic Health Records</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Billing & Invoicing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Telemedicine</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Resources</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Training Materials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500">
            <p>&copy; 2023 Gangosri Hospital Information System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
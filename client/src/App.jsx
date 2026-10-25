import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { useAuth } from './hooks/useAuth.js';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import { getDoctors, createDoctor as createDoctorRequest, updateMyAvailability as updateMyAvailabilityRequest } from './services/doctorService.js';
import { getDepartments, createDepartment as createDepartmentRequest } from './services/departmentService.js';
import { getPatients, createPatient as createPatientRequest } from './services/patientService.js';
import { getAppointments, bookAppointment, updateAppointmentStatus } from './services/appointmentService.js';
import { getPrescriptions, createPrescription as createPrescriptionRequest } from './services/prescriptionService.js';
import ManageStaff from './pages/admin/ManageStaff.jsx';
import { 
  Users, UserCheck, Calendar, Clock, Building, FileText, Activity, 
  Plus, Search, Filter, CheckCircle2, XCircle, AlertCircle, Edit3, Trash2, 
  Printer, LogOut, Sun, Moon, Bell, ChevronRight, Menu, X, ChevronDown, 
  Stethoscope, Shield, User, CreditCard, HeartPulse, Sparkles, Check, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

// ==========================================
// 1. INITIAL MOCK DATA & PERSISTENCE HELPERS
// ==========================================

const INITIAL_DEPARTMENTS = [
  { id: 'dep-1', name: 'Cardiology', description: 'Heart and cardiovascular system care', docCount: 3, status: 'Active' },
  { id: 'dep-2', name: 'Neurology', description: 'Brain, spinal cord, and nerve disorders', docCount: 2, status: 'Active' },
  { id: 'dep-3', name: 'Pediatrics', description: 'Medical care for infants, children, and adolescents', docCount: 4, status: 'Active' },
  { id: 'dep-4', name: 'Orthopedics', description: 'Bones, joints, muscles, and ligament care', docCount: 2, status: 'Active' },
  { id: 'dep-5', name: 'General Medicine', description: 'Primary healthcare and internal medicine', docCount: 5, status: 'Active' },
];

const INITIAL_DOCTORS = [
  { id: 'doc-1', name: 'Dr. Sarah Jenkins', email: 'sarah.j@medcare.com', phone: '+1 (555) 234-5678', specialization: 'Cardiologist', department: 'Cardiology', qualification: 'MD, FACC', experience: '12 Yrs', fee: 150, status: 'Active', hours: '09:00 AM - 04:00 PM' },
  { id: 'doc-2', name: 'Dr. Robert Chen', email: 'robert.c@medcare.com', phone: '+1 (555) 876-5432', specialization: 'Neurologist', department: 'Neurology', qualification: 'MD, PhD', experience: '15 Yrs', fee: 180, status: 'Active', hours: '10:00 AM - 05:00 PM' },
  { id: 'doc-3', name: 'Dr. Emily Watson', email: 'emily.w@medcare.com', phone: '+1 (555) 345-6789', specialization: 'Pediatrician', department: 'Pediatrics', qualification: 'MD, DCH', experience: '8 Yrs', fee: 120, status: 'Active', hours: '08:30 AM - 02:30 PM' },
  { id: 'doc-4', name: 'Dr. Michael Chang', email: 'michael.c@medcare.com', phone: '+1 (555) 987-6543', specialization: 'Orthopedic Surgeon', department: 'Orthopedics', qualification: 'MS (Orthopedics)', experience: '10 Yrs', fee: 160, status: 'Active', hours: '11:00 AM - 06:00 PM' },
];

const INITIAL_PATIENTS = [
  { id: 'pat-1', name: 'John Doe', email: 'john.doe@example.com', phone: '+1 (555) 111-2222', dob: '1988-05-14', gender: 'Male', bloodGroup: 'O+', address: '124 Maple St, NY', registeredDate: '2025-01-10' },
  { id: 'pat-2', name: 'Alice Smith', email: 'alice.s@example.com', phone: '+1 (555) 333-4444', dob: '1994-09-22', gender: 'Female', bloodGroup: 'A+', address: '742 Evergreen Terr, Springfield', registeredDate: '2025-02-01' },
  { id: 'pat-3', name: 'David Miller', email: 'david.m@example.com', phone: '+1 (555) 555-6666', dob: '1975-12-03', gender: 'Male', bloodGroup: 'B-', address: '456 Pine Ave, Chicago', registeredDate: '2025-02-15' },
  { id: 'pat-4', name: 'Emma Wilson', email: 'emma.w@example.com', phone: '+1 (555) 777-8888', dob: '2001-03-30', gender: 'Female', bloodGroup: 'AB+', address: '890 Oak Rd, Seattle', registeredDate: '2025-02-18' },
];

const INITIAL_APPOINTMENTS = [
  { id: 'APT-1001', patientId: 'pat-1', patientName: 'John Doe', doctorId: 'doc-1', doctorName: 'Dr. Sarah Jenkins', department: 'Cardiology', date: '2026-10-26', time: '10:00 AM', reason: 'Routine Heart Checkup & ECG', status: 'Confirmed', fee: 150 },
  { id: 'APT-1002', patientId: 'pat-2', patientName: 'Alice Smith', doctorId: 'doc-2', doctorName: 'Dr. Robert Chen', department: 'Neurology', date: '2026-10-26', time: '11:30 AM', reason: 'Migraine & Chronic Headaches', status: 'Pending', fee: 180 },
  { id: 'APT-1003', patientId: 'pat-3', patientName: 'David Miller', doctorId: 'doc-3', doctorName: 'Dr. Emily Watson', department: 'Pediatrics', date: '2026-10-25', time: '02:00 PM', reason: 'Fever and Mild Cough', status: 'Completed', fee: 120 },
  { id: 'APT-1004', patientId: 'pat-4', patientName: 'Emma Wilson', doctorId: 'doc-4', doctorName: 'Dr. Michael Chang', department: 'Orthopedics', date: '2026-10-27', time: '01:00 PM', reason: 'Knee Joint Pain post workout', status: 'Confirmed', fee: 160 },
  { id: 'APT-1005', patientId: 'pat-1', patientName: 'John Doe', doctorId: 'doc-2', doctorName: 'Dr. Robert Chen', department: 'Neurology', date: '2026-10-28', time: '09:30 AM', reason: 'Follow-up Scan Review', status: 'Pending', fee: 180 },
];

const INITIAL_PRESCRIPTIONS = [
  { id: 'RX-501', appointmentId: 'APT-1003', patientName: 'David Miller', doctorName: 'Dr. Emily Watson', diagnosis: 'Acute Bronchitis', medicines: [{ name: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily', duration: '5 Days' }, { name: 'Paracetamol', dosage: '650mg', frequency: 'As needed', duration: '3 Days' }], instructions: 'Drink warm water and rest well.', date: '2026-10-25' }
];

const ANALYTICS_DATA = [
  { date: 'Mon', appointments: 12, completed: 10, cancelled: 2 },
  { date: 'Tue', appointments: 19, completed: 15, cancelled: 4 },
  { date: 'Wed', appointments: 15, completed: 14, cancelled: 1 },
  { date: 'Thu', appointments: 22, completed: 18, cancelled: 4 },
  { date: 'Fri', appointments: 28, completed: 25, cancelled: 3 },
  { date: 'Sat', appointments: 14, completed: 12, cancelled: 2 },
  { date: 'Sun', appointments: 8, completed: 8, cancelled: 0 },
];

// Context Setup
const AppContext = createContext(null);

const getId = record => record?._id || record?.id || '';
const toDateString = value => value ? new Date(value).toISOString().slice(0, 10) : '';
const localDateKey = (date = new Date()) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

function mapDepartment(record) {
  return { id: getId(record), name: record.name, description: record.description || '', status: record.status || 'Active', docCount: record.docCount || 0 };
}

function mapDoctor(record) {
  const doctorUser = record.user || {};
  const department = record.department || {};
  return {
    id: getId(record),
    userId: getId(doctorUser),
    name: doctorUser.name || 'Doctor',
    email: doctorUser.email || '',
    phone: doctorUser.phone || '',
    specialization: record.specialization || '',
    department: department.name || '',
    departmentId: getId(department) || department,
    qualification: record.qualification || '',
    experience: `${record.experienceYears || 0} Yrs`,
    fee: record.consultationFee || 0,
    status: record.status || 'Active',
    hours: record.workingHours || '',
  };
}

function mapPatient(record) {
  const patientUser = record.user || {};
  return {
    id: getId(record),
    userId: getId(patientUser),
    name: patientUser.name || 'Patient',
    email: patientUser.email || '',
    phone: patientUser.phone || '',
    dob: toDateString(record.dateOfBirth),
    gender: record.gender || '',
    bloodGroup: record.bloodGroup || '',
    address: record.address || '',
    registeredDate: toDateString(record.createdAt),
  };
}

function mapAppointment(record) {
  const patient = record.patient || {};
  const doctor = record.doctor || {};
  const department = record.department || {};
  return {
    id: getId(record),
    patientId: getId(patient),
    patientUserId: getId(patient.user),
    patientName: patient.user?.name || 'Patient',
    doctorId: getId(doctor),
    doctorUserId: getId(doctor.user),
    doctorName: doctor.user?.name || 'Doctor',
    department: department.name || '',
    departmentId: getId(department),
    date: toDateString(record.date),
    time: record.time || '',
    reason: record.reason || '',
    status: record.status || 'Pending',
    fee: record.fee || 0,
  };
}

function mapPrescription(record) {
  const appointment = record.appointment || {};
  return {
    id: getId(record),
    appointmentId: getId(appointment),
    patientUserId: getId(appointment.patient?.user),
    patientName: appointment.patient?.user?.name || '',
    doctorName: appointment.doctor?.user?.name || '',
    diagnosis: record.diagnosis || '',
    medicines: record.medicines || [],
    instructions: record.instructions || '',
    date: toDateString(record.prescribedAt || record.createdAt),
  };
}

// Custom Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
    warning: 'bg-amber-500 text-white'
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg shadow-xl transition-all duration-300 animate-slide-up ${bgColors[type] || bgColors.info}`}>
      {type === 'success' && <CheckCircle2 className="w-5 h-5" />}
      {type === 'error' && <XCircle className="w-5 h-5" />}
      {type === 'warning' && <AlertCircle className="w-5 h-5" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="p-1 hover:opacity-75"><X className="w-4 h-4" /></button>
    </div>
  );
};

// ==========================================
// MAIN APP PROVIDER & WRAPPER
// ==========================================

export default function App() {
  const auth = useAuth();
  // Theme State
  const [darkMode, setDarkMode] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Core Data State
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // UI States
  const [toast, setToast] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'addDoctor', 'registerPatient', 'bookAppt', 'prescribe', 'printPrescription'
  const [selectedItem, setSelectedItem] = useState(null); // items passed to modals for editing/viewing

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const role = auth.user?.role || '';
  const reloadWorkspace = async () => {
    if (!auth.user) return;
    setLoadingData(true);
    try {
      const [departmentRows, doctorRows, appointmentRows, prescriptionRows, patientRows] = await Promise.all([
        getDepartments(),
        getDoctors(),
        getAppointments(),
        role === 'Receptionist' ? Promise.resolve([]) : getPrescriptions(),
        role === 'Patient' ? Promise.resolve([]) : getPatients(),
      ]);
      setDepartments(departmentRows.map(mapDepartment));
      setDoctors(doctorRows.map(mapDoctor));
      setAppointments(appointmentRows.map(mapAppointment));
      setPrescriptions(prescriptionRows.map(mapPrescription));
      setPatients(patientRows.map(mapPatient));
    } catch (error) {
      showToast(error.message || 'Could not load hospital records.', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!auth.user) return;
    setActiveTab('dashboard');
    reloadWorkspace();
  }, [auth.user?.id, auth.user?.role]);

  const saveDoctor = async payload => {
    const doctor = await createDoctorRequest(payload);
    setDoctors(current => [mapDoctor(doctor), ...current]);
  };

  const savePatient = async payload => {
    const patient = await createPatientRequest(payload);
    setPatients(current => [mapPatient(patient), ...current]);
  };

  const saveDepartment = async payload => {
    const department = await createDepartmentRequest(payload);
    setDepartments(current => [...current, mapDepartment(department)].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const saveAppointment = async payload => {
    const appointment = await bookAppointment(payload);
    setAppointments(current => [mapAppointment(appointment), ...current]);
  };

  const savePrescription = async payload => {
    const prescription = await createPrescriptionRequest(payload);
    const rows = await getPrescriptions();
    setPrescriptions(rows.map(mapPrescription));
    return mapPrescription(prescription);
  };

  const changeAppointmentStatus = async (id, status) => {
    const appointment = await updateAppointmentStatus(id, status);
    setAppointments(current => current.map(item => item.id === id ? { ...item, status: appointment.status } : item));
  };

  const saveAvailability = async workingHours => {
    await updateMyAvailabilityRequest(workingHours);
    setDoctors(current => current.map(doctor => doctor.userId === auth.user.id ? { ...doctor, hours: workingHours } : doctor));
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', darkMode);
    window.localStorage.setItem('hospital-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    setDarkMode(window.localStorage.getItem('hospital-theme') === 'dark');
  }, []);

  const stats = (() => {
    const totalPatients = patients.length;
    const totalDoctors = doctors.length;
    const today = localDateKey();
    const todaysAppts = appointments.filter(a => a.date === today).length;
    const pendingAppts = appointments.filter(a => a.status === 'Pending').length;
    const completedAppts = appointments.filter(a => a.status === 'Completed').length;
    const totalDeps = departments.length;
    return { totalPatients, totalDoctors, todaysAppts, pendingAppts, completedAppts, totalDeps };
  })();

  if (auth.loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500 dark:bg-slate-900">Checking your secure session...</div>;
  }
  if (!auth.user) {
    return <AuthenticationScreen />;
  }

  const value = {
    role, user: auth.user, logout: auth.logout, activeTab, setActiveTab, darkMode, setDarkMode,
    departments, setDepartments, doctors, setDoctors, patients, setPatients,
    appointments, setAppointments, prescriptions, setPrescriptions, stats,
    showToast, activeModal, setActiveModal, setSelectedItem, selectedItem,
    sidebarOpen, setSidebarOpen, mobileDrawerOpen, setMobileDrawerOpen,
    loadingData, reloadWorkspace, saveDoctor, savePatient, saveDepartment, saveAppointment,
    savePrescription, changeAppointmentStatus,
    saveAvailability,
  };

  return (
    <AppContext.Provider value={value}>
      <div className={`${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'} min-h-screen flex flex-col font-sans transition-colors duration-200`}>
        {/* Top Sticky Header */}
        <Header />

        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar Navigation */}
          <Sidebar />

          {/* Main Content Workspace */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {loadingData ? <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">Loading your hospital workspace...</div> : <MainRouter />}
          </main>
        </div>

        {/* Dynamic Interactive Modals */}
        <ModalManager />

        {/* Global Toast Message */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </AppContext.Provider>
  );
}

function AuthenticationScreen() {
  const [registering, setRegistering] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    setDarkMode(window.localStorage.getItem('hospital-theme') === 'dark');
  }, []);

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-slate-50 font-sans text-slate-800 dark:bg-slate-950 dark:text-slate-100`}>
      <header className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/90 md:px-10">
        <a href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><HeartPulse size={23} /></span>
          <span><strong className="block text-lg leading-tight">MedCare</strong><span className="text-xs font-medium text-blue-600 dark:text-blue-400">Hospital System</span></span>
        </a>
        <button onClick={() => setDarkMode(current => { const next = !current; window.localStorage.setItem('hospital-theme', next ? 'dark' : 'light'); return next; })} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Toggle theme">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
      </header>
      <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-12 px-5 py-10 lg:grid-cols-[1fr_0.9fr] lg:px-10">
        <section className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300"><Shield size={16} /> Private, role-based workspace</div>
          <h1 className="mt-6 max-w-2xl text-5xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Better coordinated care starts here.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-500 dark:text-slate-400">Appointments, clinical teams, patient records, and prescriptions—organized in one secure hospital workspace.</p>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[['01', 'Appointments'], ['02', 'Care teams'], ['03', 'Records']].map(([number, label]) => <div key={number} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><span className="text-xs font-bold text-blue-600">{number}</span><p className="mt-2 text-sm font-semibold">{label}</p></div>)}
          </div>
        </section>
        <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-9">
          {registering ? <Register /> : <Login />}
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {registering ? 'Already have a patient account?' : 'New patient?'}
            {' '}
            <button onClick={() => setRegistering(current => !current)} className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">{registering ? 'Sign in' : 'Create an account'}</button>
          </p>
          <p className="mt-5 border-t border-slate-100 pt-4 text-center text-xs leading-5 text-slate-400 dark:border-slate-800">Administrator and staff accounts are created by an authorized hospital administrator.</p>
        </section>
      </main>
    </div>
  );
}

// ==========================================
// 2. LAYOUT & NAVIGATION COMPONENTS
// ==========================================

export function Header() {
  const { role, user, logout, darkMode, setDarkMode, mobileDrawerOpen, setMobileDrawerOpen, activeTab } = useContext(AppContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const initials = (user?.name || 'MedCare').split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left Side: Drawer Toggle & Brand */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight leading-none block">MedCare</span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Hospital System</span>
            </div>
          </div>
        </div>

        {/* Middle: Active Context Breadcrumb */}
        <div className="hidden md:flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 font-medium capitalize">
          <span>Portal</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-blue-600 dark:text-blue-400 font-semibold">{role} View</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200">{activeTab}</span>
        </div>

        {/* Right Actions: Role Selector, Dark Mode, Profile */}
        <div className="flex items-center space-x-3">
          <span className="hidden rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 sm:block">{role}</span>

          {/* Theme Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Avatar Menu */}
          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                {initials}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {role.toUpperCase()}
                  </span>
                </div>
                <button 
                  onClick={() => { setProfileOpen(false); logout(); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" /> <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function Sidebar() {
  const { role, activeTab, setActiveTab, sidebarOpen, setSidebarOpen, mobileDrawerOpen, setMobileDrawerOpen } = useContext(AppContext);

  // Dynamic Navigation Map Based on User Role
  const navItems = useMemo(() => {
    const common = [{ id: 'dashboard', label: 'Dashboard', icon: Activity }];
    
    if (role === 'Admin') {
      return [
        ...common,
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'doctors', label: 'Doctors', icon: Stethoscope },
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'departments', label: 'Departments', icon: Building },
        { id: 'staff', label: 'Staff', icon: UserCheck },
        { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
      ];
    }
    if (role === 'Doctor') {
      return [
        ...common,
        { id: 'appointments', label: 'My Schedule', icon: Calendar },
        { id: 'patients', label: 'My Patients', icon: Users },
        { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
        { id: 'availability', label: 'Availability', icon: Clock },
      ];
    }
    if (role === 'Patient') {
      return [
        ...common,
        { id: 'book-appointment', label: 'Book Appointment', icon: Plus },
        { id: 'my-appointments', label: 'My Bookings', icon: Calendar },
        { id: 'medical-records', label: 'Medical History', icon: FileText },
      ];
    }
    if (role === 'Receptionist') {
      return [
        ...common,
        { id: 'appointments', label: 'Desk Schedule', icon: Calendar },
        { id: 'patients', label: 'Patient Register', icon: Users },
        { id: 'doctors', label: 'Doctor Roster', icon: Stethoscope },
      ];
    }
    return common;
  }, [role]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 py-4 w-64 transition-all">
      <div className="flex-1 px-3 space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-100 dark:border-slate-700">
        <div className="bg-blue-50 dark:bg-slate-700/50 p-3 rounded-xl border border-blue-100 dark:border-slate-600">
          <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold">MedCare System</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">v2.4 Pro â€¢ Active Sync</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block h-full">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative z-50 w-64 max-w-xs bg-white dark:bg-slate-800 h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

// ==========================================
// 3. ROUTER / WORKSPACE SWITCHER
// ==========================================

function MainRouter() {
  const { role, activeTab } = useContext(AppContext);

  if (activeTab === 'dashboard') {
    if (role === 'Admin') return <AdminDashboard />;
    if (role === 'Doctor') return <DoctorDashboard />;
    if (role === 'Patient') return <PatientDashboard />;
    if (role === 'Receptionist') return <AdminDashboard />; // Shared streamlined dashboard
  }

  // Common Modules Across Roles
  switch (activeTab) {
    case 'appointments':
    case 'my-appointments':
      return <AppointmentsModule />;
    case 'doctors':
      return <DoctorsModule />;
    case 'patients':
      return <PatientsModule />;
    case 'departments':
      return <DepartmentsModule />;
    case 'staff':
      return <ManageStaff />;
    case 'prescriptions':
    case 'medical-records':
      return <PrescriptionsModule />;
    case 'book-appointment':
      return <BookAppointmentWizard />;
    case 'availability':
      return <DoctorAvailabilityModule />;
    default:
      return <AdminDashboard />;
  }
}

// ==========================================
// 4. ROLE DASHBOARDS
// ==========================================

export function AdminDashboard() {
  const { role, stats, appointments, setActiveModal, setSelectedItem, changeAppointmentStatus, showToast } = useContext(AppContext);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const analyticsData = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    const key = localDateKey(day);
    const dailyAppointments = appointments.filter(appointment => appointment.date === key);
    return {
      date: day.toLocaleDateString(undefined, { weekday: 'short' }),
      appointments: dailyAppointments.length,
      completed: dailyAppointments.filter(appointment => appointment.status === 'Completed').length,
      cancelled: dailyAppointments.filter(appointment => appointment.status === 'Cancelled').length,
    };
  }), [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesStatus = statusFilter === 'All' || apt.status === statusFilter;
      const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            apt.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchQuery]);

  // Donut Chart Status Data
  const pieData = useMemo(() => {
    const counts = { Confirmed: 0, Pending: 0, Completed: 0, Cancelled: 0 };
    appointments.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });
    return [
      { name: 'Confirmed', value: counts.Confirmed, color: '#2563EB' },
      { name: 'Pending', value: counts.Pending, color: '#F59E0B' },
      { name: 'Completed', value: counts.Completed, color: '#16A34A' },
      { name: 'Cancelled', value: counts.Cancelled, color: '#DC2626' },
    ];
  }, [appointments]);

  const updateStatus = async (id, newStatus) => {
    try {
      await changeAppointmentStatus(id, newStatus);
      showToast(`Appointment status changed to ${newStatus}`);
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Hospital Executive Command Dashboard</h1>
          <p className="text-blue-100 text-sm max-w-xl">
            Real-time insights across hospital admissions, doctor availability, patient queues, and department analytics.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {role === 'Admin' && <button onClick={() => setActiveModal('addDoctor')} className="bg-white text-blue-800 hover:bg-blue-50 font-semibold px-4 py-2 rounded-xl text-xs transition shadow-sm flex items-center space-x-1">
              <Plus className="w-4 h-4" /> <span>Add Doctor</span>
            </button>}
            {['Admin', 'Receptionist'].includes(role) && <button onClick={() => setActiveModal('registerPatient')} className="bg-blue-600/60 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl text-xs backdrop-blur-md transition flex items-center space-x-1">
              <UserCheck className="w-4 h-4" /> <span>Register Patient</span>
            </button>}
          </div>
        </div>
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
          <Building className="w-64 h-64" />
        </div>
      </div>

      {/* Grid Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} color="blue" subtitle="+12% this month" />
        <StatCard title="Total Doctors" value={stats.totalDoctors} icon={Stethoscope} color="teal" subtitle="Active Staff" />
        <StatCard title="Today's Appts" value={stats.todaysAppts} icon={Calendar} color="indigo" subtitle="Scheduled" />
        <StatCard title="Pending Requests" value={stats.pendingAppts} icon={Clock} color="amber" subtitle="Requires Action" />
        <StatCard title="Completed Consults" value={stats.completedAppts} icon={CheckCircle2} color="emerald" subtitle="All-time" />
        <StatCard title="Departments" value={stats.totalDeps} icon={Building} color="purple" subtitle="Operational" />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Patient Visit Trends</h3>
              <p className="text-xs text-slate-500">Weekly breakdown of hospital patient visits</p>
            </div>
            <span className="text-xs bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full font-medium">Last 7 Days</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#94A3B8" />
                <YAxis tick={{fontSize: 12}} stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="appointments" stroke="#2563EB" fillOpacity={1} fill="url(#colorAppts)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Appointment Breakdown</h3>
            <p className="text-xs text-slate-500">Current status proportions</p>
          </div>
          <div className="h-52 my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Appointments Desk Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Live Appointment Queue</h3>
            <p className="text-xs text-slate-500">Monitor and update active consultations</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search appts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg font-medium outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                <th className="p-4">Appt ID</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Doctor</th>
                <th className="p-4">Department</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 text-sm">
                    No matching appointments found.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition">
                    <td className="p-4 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">{apt.id}</td>
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{apt.patientName}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{apt.doctorName}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-xs">{apt.department}</td>
                    <td className="p-4 text-xs font-medium">
                      <div className="text-slate-800 dark:text-slate-200">{apt.date}</div>
                      <div className="text-slate-400">{apt.time}</div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        {apt.status === 'Pending' && (
                          <button 
                            onClick={() => updateStatus(apt.id, 'Confirmed')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Confirm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {apt.status === 'Confirmed' && (
                          <button 
                            onClick={() => updateStatus(apt.id, 'Completed')}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Mark Complete"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                          <button 
                            onClick={() => updateStatus(apt.id, 'Cancelled')}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function DoctorDashboard() {
  const { appointments, setActiveModal, setSelectedItem, user } = useContext(AppContext);
  const myAppointments = appointments.filter(appointment => appointment.doctorUserId === user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-teal-600/50 px-3 py-1 rounded-full">Doctor Clinical Desk</span>
          <h1 className="text-2xl font-bold mt-2">Welcome back, {user.name}</h1>
          <p className="text-teal-100 text-sm mt-1">You have {myAppointments.length} assigned patient consultations queued for today.</p>
        </div>
        <button 
          disabled={!myAppointments.length}
          onClick={() => { if (myAppointments[0]) { setSelectedItem(myAppointments[0]); setActiveModal('prescribe'); } }}
          className="bg-white text-teal-800 hover:bg-teal-50 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md flex items-center space-x-2"
        >
          <Edit3 className="w-4 h-4" /> <span>Issue Prescription</span>
        </button>
      </div>

      {/* Patient Queue */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
        <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4">Today's Consultation Schedule</h3>
        <div className="space-y-3">
          {myAppointments.map(apt => (
            <div key={apt.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-bold flex items-center justify-center">
                  {apt.patientName.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">{apt.patientName}</h4>
                  <p className="text-xs text-slate-500">Reason: <span className="text-slate-700 dark:text-slate-300 font-medium">{apt.reason}</span></p>
                  <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /> <span>{apt.time}</span></span>
                    <span className="flex items-center space-x-1"><Calendar className="w-3.5 h-3.5" /> <span>{apt.date}</span></span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                <StatusBadge status={apt.status} />
                <button 
                  onClick={() => { setSelectedItem(apt); setActiveModal('prescribe'); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Prescribe
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PatientDashboard() {
  const { appointments, prescriptions, setActiveTab, setSelectedItem, setActiveModal, user } = useContext(AppContext);
  const myAppts = appointments.filter(appointment => appointment.patientUserId === user.id);
  const myPrescriptions = prescriptions.filter(prescription => prescription.patientUserId === user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Patient Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hello, {user.name}</h1>
          <p className="text-blue-100 text-sm mt-1">Access your health records, scheduled visits, and prescriptions.</p>
        </div>
        <button 
          onClick={() => setActiveTab('book-appointment')}
          className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-md flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" /> <span>Book New Appointment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Visits */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4">My Booked Visits</h3>
          <div className="space-y-3">
            {myAppts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No scheduled appointments.</p>
            ) : (
              myAppts.map(apt => (
                <div key={apt.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm text-slate-800 dark:text-white">{apt.doctorName}</p>
                    <p className="text-xs text-slate-500">{apt.department} â€¢ {apt.date} at {apt.time}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Prescriptions */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4">Recent Prescriptions</h3>
          <div className="space-y-3">
            {myPrescriptions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No active prescriptions on record.</p>
            ) : (
              myPrescriptions.map(rx => (
                <div key={rx.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm text-slate-800 dark:text-white">{rx.diagnosis}</p>
                    <p className="text-xs text-slate-500">Issued by {rx.doctorName} on {rx.date}</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedItem(rx); setActiveModal('printPrescription'); }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="View & Print"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. APPOINTMENT BOOKING STEP-WIZARD
// ==========================================

export function BookAppointmentWizard() {
  const { departments, doctors, saveAppointment, showToast, setActiveTab, user } = useContext(AppContext);
  const [step, setStep] = useState(1);

  // Form State
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoc, setSelectedDoc] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const availableDoctors = useMemo(() => {
    if (!selectedDept) return [];
    return doctors.filter(d => d.departmentId === selectedDept);
  }, [doctors, selectedDept]);

  const timeSlots = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:30 PM'];

  const nextStep = () => {
    const requirements = {
      1: [selectedDept, 'Please choose a department.'],
      2: [selectedDoc, 'Please choose a doctor.'],
      3: [date && date >= localDateKey(), 'Choose a valid appointment date.'],
      4: [timeSlot, 'Please choose an appointment time.'],
      5: [reason.trim(), 'Please add a reason for your visit.'],
    };
    const requirement = requirements[step];
    if (requirement && !requirement[0]) {
      showToast(requirement[1], 'warning');
      return;
    }
    setStep(current => Math.min(7, current + 1));
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoc || !date || !timeSlot || !reason.trim()) {
      showToast('Complete all appointment details before booking.', 'warning');
      return;
    }
    setSaving(true);
    try {
      await saveAppointment({ doctor: selectedDoc, department: selectedDept, date, time: timeSlot, reason: reason.trim() });
      showToast('Appointment request saved. Awaiting hospital confirmation.');
      setActiveTab('my-appointments');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">7-Step Interactive Appointment Booking</h2>
        <p className="text-xs text-slate-500">Configure your medical consultation with our specialist doctors.</p>
      </div>

      {/* Progress Indicators */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto py-2">
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
              step === s ? 'bg-blue-600 text-white shadow-md' : step > s ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
            }`}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 7 && <div className={`w-6 sm:w-10 h-0.5 mx-1 ${step > s ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
          </div>
        ))}
      </div>

      {/* Step Contents */}
      <div className="min-h-[220px]">
        {step === 1 && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Step 1: Select Medical Department</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {departments.map(d => (
                <div 
                  key={d.id}
                  onClick={() => { setSelectedDept(d.id); setSelectedDoc(''); }}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selectedDept === d.id ? 'border-blue-600 bg-blue-50/50 dark:bg-slate-700/60 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">{d.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{d.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Step 2: Choose Attending Specialist</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableDoctors.length === 0 ? (
                <p className="text-xs text-slate-400">Please select a department first.</p>
              ) : (
                availableDoctors.map(doc => (
                  <div 
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      selectedDoc === doc.id ? 'border-blue-600 bg-blue-50/50 dark:bg-slate-700/60 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">{doc.name}</h4>
                    <p className="text-xs text-slate-500">{doc.specialization} â€¢ {doc.qualification}</p>
                    <p className="text-xs font-semibold text-blue-600 mt-2">Consultation Fee: ${doc.fee}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Step 3: Pick Appointment Date</label>
            <input 
              type="date"
              value={date}
              min={localDateKey()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-sm outline-none focus:border-blue-600"
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Step 4: Select Available Time Slot</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {timeSlots.map(slot => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeSlot(slot)}
                  className={`p-3 rounded-xl border text-xs font-semibold transition ${
                    timeSlot === slot ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Step 5: Symptoms & Reason for Visit</label>
            <textarea
              rows="4"
              placeholder="Describe your symptoms or reason for consulting the doctor..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-sm outline-none focus:border-blue-600"
            />
          </div>
        )}

        {step === 6 && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Step 6: Patient Identification</label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-700"><p className="font-semibold">{user.name}</p><p className="mt-1 text-slate-500">{user.email}</p><p className="mt-2 text-xs text-slate-400">Booking will be saved to your signed-in patient record.</p></div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-3 bg-slate-50 dark:bg-slate-700/40 p-4 rounded-xl border border-slate-200 dark:border-slate-600">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Step 7: Final Review & Confirmation</h4>
            <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <p><strong>Department:</strong> {departments.find(item => item.id === selectedDept)?.name}</p>
              <p><strong>Doctor:</strong> {doctors.find(item => item.id === selectedDoc)?.name}</p>
              <p><strong>Date & Time:</strong> {date} at {timeSlot}</p>
              <p><strong>Patient:</strong> {user.name}</p>
              <p><strong>Reason:</strong> {reason}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="mt-8 flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-4">
        <button
          disabled={step === 1}
          onClick={() => setStep(step - 1)}
          className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 disabled:opacity-40"
        >
          Previous
        </button>

        {step < 7 ? (
          <button
            onClick={nextStep}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition flex items-center space-x-1"
          >
            <span>Next Step</span> <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleConfirmBooking}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Confirm & Save Booking'}
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 6. MODULES (DOCTORS, PATIENTS, DEPTS)
// ==========================================

export function DoctorsModule() {
  const { doctors, role, setActiveModal } = useContext(AppContext);
  const [search, setSearch] = useState('');

  const filtered = doctors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Medical Specialists Roster</h2>
          <p className="text-xs text-slate-500">Manage hospital doctors and consultation schedules.</p>
        </div>
        {role === 'Admin' && <button 
          onClick={() => setActiveModal('addDoctor')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-1 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> <span>Add New Doctor</span>
        </button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map(doc => (
          <div key={doc.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 font-bold flex items-center justify-center text-base mb-3">
                {doc.name.replace('Dr. ', '').split(' ').map(n=>n[0]).join('')}
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">{doc.name}</h3>
              <p className="text-xs font-medium text-teal-600 dark:text-teal-400">{doc.specialization}</p>
              <p className="text-xs text-slate-400 mt-1">{doc.department} â€¢ {doc.qualification}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs flex justify-between items-center text-slate-500">
              <span>Fee: <strong>${doc.fee}</strong></span>
              <span className="text-emerald-600 font-semibold">{doc.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PatientsModule() {
  const { patients, role, setActiveModal } = useContext(AppContext);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Registered Patient Registry</h2>
          <p className="text-xs text-slate-500">View medical profiles and register new patients.</p>
        </div>
        {['Admin', 'Receptionist'].includes(role) && <button 
          onClick={() => setActiveModal('registerPatient')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-1"
        >
          <UserCheck className="w-4 h-4" /> <span>Register Patient</span>
        </button>}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 text-xs uppercase font-semibold">
              <th className="p-4">Patient Name</th>
              <th className="p-4">Contact</th>
              <th className="p-4">DOB / Gender</th>
              <th className="p-4">Blood Group</th>
              <th className="p-4">Registered Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
            {patients.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
                <td className="p-4 font-bold text-slate-800 dark:text-white">{p.name}</td>
                <td className="p-4 text-xs text-slate-500">{p.phone}<br/>{p.email}</td>
                <td className="p-4 text-xs text-slate-600 dark:text-slate-300">{p.dob} ({p.gender})</td>
                <td className="p-4"><span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">{p.bloodGroup}</span></td>
                <td className="p-4 text-xs text-slate-400">{p.registeredDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AppointmentsModule() {
  const { appointments, role, setActiveModal, changeAppointmentStatus, showToast } = useContext(AppContext);
  const canUpdate = ['Admin', 'Doctor', 'Patient', 'Receptionist'].includes(role);
  const canBook = ['Admin', 'Receptionist'].includes(role);
  const updateStatus = async (appointment, status) => {
    try {
      await changeAppointmentStatus(appointment.id, status);
      showToast(`Appointment ${status.toLowerCase()}.`);
    } catch (error) {
      showToast(error.message, 'error');
    }
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-800 dark:text-white">{role === 'Patient' ? 'My Appointments' : 'Master Appointments Register'}</h2><p className="mt-1 text-xs text-slate-500">View and manage appointment requests.</p></div>{canBook && <button onClick={() => setActiveModal('bookAppointment')} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"><Plus size={16} />Book for patient</button>}</div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 text-xs uppercase font-semibold">
              <th className="p-4">ID</th>
              <th className="p-4">Patient</th>
              <th className="p-4">Doctor</th>
              <th className="p-4">Date & Slot</th>
              <th className="p-4">Status</th>
              {canUpdate && <th className="p-4">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
            {appointments.map(a => (
              <tr key={a.id}>
                <td className="p-4 font-mono text-xs text-blue-600 font-bold">{a.id}</td>
                <td className="p-4 font-semibold">{a.patientName}</td>
                <td className="p-4 text-slate-600">{a.doctorName}</td>
                <td className="p-4 text-xs">{a.date} at {a.time}<p className="mt-1 text-slate-400">{a.reason}</p></td>
                <td className="p-4"><StatusBadge status={a.status} /></td>
                {canUpdate && <td className="p-4"><div className="flex flex-wrap gap-1">
                  {role !== 'Patient' && a.status === 'Pending' && <button onClick={() => updateStatus(a, 'Confirmed')} className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">Confirm</button>}
                  {role !== 'Patient' && a.status === 'Confirmed' && <button onClick={() => updateStatus(a, 'Completed')} className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Complete</button>}
                  {['Pending', 'Confirmed'].includes(a.status) && <button onClick={() => updateStatus(a, 'Cancelled')} className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">Cancel</button>}
                </div></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DepartmentsModule() {
  const { departments, doctors, role, setActiveModal } = useContext(AppContext);
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div><h2 className="text-xl font-bold text-slate-800 dark:text-white">Hospital Departments</h2><p className="mt-1 text-xs text-slate-500">Active departments and their specialist teams.</p></div>
        {role === 'Admin' && <button onClick={() => setActiveModal('addDepartment')} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"><Plus size={16} />Add department</button>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {departments.map(d => (
          <div key={d.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-base text-slate-800 dark:text-white">{d.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{d.description}</p>
            <div className="mt-4 text-xs font-semibold text-blue-600">{doctors.filter(doctor => doctor.departmentId === d.id).length} Active Doctors</div>
          </div>
        ))}
        {departments.length === 0 && <p className="col-span-full rounded-xl bg-white p-8 text-center text-sm text-slate-500 dark:bg-slate-800">No departments yet. Ask an administrator to add departments.</p>}
      </div>
    </div>
  );
}

export function PrescriptionsModule() {
  const { prescriptions, setActiveModal, setSelectedItem, role } = useContext(AppContext);
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white">Clinical Prescriptions & Medical Records</h2>
      {role === 'Doctor' && <p className="text-sm text-slate-500">Create prescriptions from a patient’s appointment in My Schedule.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prescriptions.map(p => (
          <div key={p.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{p.id}</span>
              <h3 className="font-bold text-base text-slate-800 dark:text-white mt-1">{p.diagnosis}</h3>
              <p className="text-xs text-slate-500">Patient: {p.patientName} â€¢ Doctor: {p.doctorName}</p>
              <p className="mt-2 text-xs text-slate-500">{p.medicines.map(medicine => `${medicine.name} (${medicine.dosage})`).join(', ')}</p>
            </div>
            <button 
              onClick={() => { setSelectedItem(p); setActiveModal('printPrescription'); }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
        ))}
        {prescriptions.length === 0 && <p className="col-span-full rounded-xl bg-white p-8 text-center text-sm text-slate-500 dark:bg-slate-800">No prescriptions have been recorded.</p>}
      </div>
    </div>
  );
}

export function DoctorAvailabilityModule() {
  const { doctors, user, saveAvailability, showToast } = useContext(AppContext);
  const currentDoctor = doctors.find(doctor => doctor.userId === user.id);
  const [workingHours, setWorkingHours] = useState(currentDoctor?.hours || '');
  const [saving, setSaving] = useState(false);
  useEffect(() => setWorkingHours(currentDoctor?.hours || ''), [currentDoctor?.hours]);
  const handleSave = async event => {
    event.preventDefault();
    setSaving(true);
    try {
      await saveAvailability(workingHours);
      showToast('Availability schedule updated successfully.');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };
  return (
    <form onSubmit={handleSave} className="mx-auto max-w-xl space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h2 className="text-lg font-bold text-slate-800 dark:text-white">Manage Consultation Availability</h2>
      {!currentDoctor && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Your login does not have an active doctor profile. Contact an administrator.</p>}
      <label className="block text-xs font-semibold">Working days and consultation hours<input required maxLength="100" value={workingHours} onChange={event => setWorkingHours(event.target.value)} placeholder="Monday-Friday, 09:00 AM-04:00 PM" className="mt-2 w-full rounded-lg border p-3 text-sm dark:bg-slate-700" /></label>
      <button disabled={saving || !currentDoctor} className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save roster settings'}</button>
    </form>
  );
}

// ==========================================
// 7. UTILITY UI COMPONENTS & MODALS
// ==========================================

export function StatCard({ title, value, icon: Icon, color, subtitle }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        <div className={`p-2 rounded-xl ${colorMap[color] || colorMap.blue}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3">
        <span className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{value}</span>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    Confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
}

export function ModalManager() {
  const { activeModal, setActiveModal, selectedItem, saveDoctor, savePatient, saveDepartment, saveAppointment, savePrescription, showToast } = useContext(AppContext);

  if (!activeModal) return null;

  const submit = async (action, data, message) => {
    try {
      await action(data);
      showToast(message);
      setActiveModal(null);
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-700 relative">
        <button 
          onClick={() => setActiveModal(null)}
          className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        {activeModal === 'addDoctor' && (
          <AddDoctorForm onSave={data => submit(saveDoctor, data, 'Doctor account created. Share the temporary credentials securely.')} />
        )}

        {activeModal === 'registerPatient' && (
          <RegisterPatientForm onSave={data => submit(savePatient, data, 'Patient account and medical record created.')} />
        )}

        {activeModal === 'addDepartment' && (
          <AddDepartmentForm onSave={data => submit(saveDepartment, data, 'Department created successfully.')} />
        )}

        {activeModal === 'bookAppointment' && (
          <StaffAppointmentForm onSave={data => submit(saveAppointment, data, 'Appointment booked successfully.')} />
        )}

        {activeModal === 'prescribe' && (
          <PrescriptionForm item={selectedItem} onSave={data => submit(savePrescription, data, 'Prescription saved to the patient record.')} />
        )}

        {activeModal === 'printPrescription' && selectedItem && (
          <PrintPrescriptionModal rx={selectedItem} onClose={() => setActiveModal(null)} />
        )}
      </div>
    </div>
  );
}

export function StaffAppointmentForm({ onSave }) {
  const { patients, doctors } = useContext(AppContext);
  const [form, setForm] = useState({ patient: '', doctor: '', date: '', time: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const availableDoctors = doctors;
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const handleSubmit = async event => {
    event.preventDefault();
    setSaving(true);
    try {
      const selectedDoctor = doctors.find(doctor => doctor.id === form.doctor);
      await onSave({ ...form, department: selectedDoctor?.departmentId });
    } finally {
      setSaving(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Book an appointment</h3>
      <label className="block text-xs font-semibold">Patient<select required name="patient" value={form.patient} onChange={update} className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:bg-slate-700"><option value="">Select patient</option>{patients.map(patient => <option key={patient.id} value={patient.id}>{patient.name} ({patient.email})</option>)}</select></label>
      <label className="block text-xs font-semibold">Doctor<select required name="doctor" value={form.doctor} onChange={update} className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:bg-slate-700"><option value="">Select doctor</option>{availableDoctors.map(doctor => <option key={doctor.id} value={doctor.id}>{doctor.name} — {doctor.department}</option>)}</select></label>
      {form.doctor && <p className="text-xs text-slate-500">Department and consultation fee are set from the selected doctor’s profile.</p>}
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs font-semibold">Date<input required type="date" min={localDateKey()} name="date" value={form.date} onChange={update} className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:bg-slate-700" /></label>
        <label className="text-xs font-semibold">Time<input required name="time" placeholder="10:00 AM" value={form.time} onChange={update} className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:bg-slate-700" /></label>
      </div>
      <label className="block text-xs font-semibold">Reason for visit<textarea required maxLength="1000" name="reason" rows="3" value={form.reason} onChange={update} className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:bg-slate-700" /></label>
      <button disabled={saving || !patients.length || !doctors.length} className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Booking...' : 'Save appointment'}</button>
    </form>
  );
}

export function AddDoctorForm({ onSave }) {
  const { departments } = useContext(AppContext);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', specialization: '', department: '', qualification: '', experienceYears: 0, consultationFee: 150, workingHours: '' });
  const [saving, setSaving] = useState(false);
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const handleSubmit = async event => {
    event.preventDefault();
    setSaving(true);
    try { await onSave({ ...form, experienceYears: Number(form.experienceYears), consultationFee: Number(form.consultationFee) }); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] space-y-3 overflow-y-auto pr-1">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Create Doctor Account</h3>
      <p className="text-xs text-slate-500">Share the temporary password with the doctor securely.</p>
      <input name="name" required maxLength="120" placeholder="Doctor full name" value={form.name} onChange={update} className="w-full rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
      <div className="grid grid-cols-2 gap-2">
        <input name="email" type="email" required placeholder="Email address" value={form.email} onChange={update} className="min-w-0 rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
        <input name="phone" placeholder="Phone number" value={form.phone} onChange={update} className="min-w-0 rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
      </div>
      <input name="password" type="password" required minLength="8" autoComplete="new-password" placeholder="Temporary password (8+ characters)" value={form.password} onChange={update} className="w-full rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
      <input name="specialization" required placeholder="Specialization" value={form.specialization} onChange={update} className="w-full rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
      <div className="grid grid-cols-2 gap-2">
        <select name="department" required value={form.department} onChange={update} className="min-w-0 rounded-xl border p-2.5 text-sm dark:bg-slate-700">
          <option value="">Select department</option>
          {departments.map(department => <option key={department.id} value={department.id}>{department.name}</option>)}
        </select>
        <input name="qualification" placeholder="Qualification" value={form.qualification} onChange={update} className="min-w-0 rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input name="consultationFee" type="number" required min="0" step="0.01" placeholder="Consultation fee" value={form.consultationFee} onChange={update} className="rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
        <input name="experienceYears" type="number" min="0" max="80" placeholder="Experience (years)" value={form.experienceYears} onChange={update} className="rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
      </div>
      <input name="workingHours" placeholder="Working hours (e.g. Mon-Fri, 9 AM-4 PM)" value={form.workingHours} onChange={update} className="w-full rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
      <button disabled={saving || departments.length === 0} type="submit" className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">
        {saving ? 'Creating account...' : 'Create doctor'}
      </button>
    </form>
  );
}

export function RegisterPatientForm({ onSave }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', dateOfBirth: '', gender: '', bloodGroup: '', address: '', emergencyContact: '' });
  const [saving, setSaving] = useState(false);
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const handleSubmit = async event => {
    event.preventDefault();
    setSaving(true);
    try { await onSave(form); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] space-y-3 overflow-y-auto pr-1">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Create Patient Account</h3>
      <input name="name" required maxLength="120" placeholder="Patient full name" value={form.name} onChange={update} className="w-full rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
      <div className="grid grid-cols-2 gap-2">
        <input name="email" type="email" required placeholder="Email address" value={form.email} onChange={update} className="min-w-0 rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
        <input name="phone" placeholder="Phone number" value={form.phone} onChange={update} className="min-w-0 rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
      </div>
      <input name="password" type="password" required minLength="8" autoComplete="new-password" placeholder="Temporary password (8+ characters)" value={form.password} onChange={update} className="w-full rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
      <div className="grid grid-cols-2 gap-2">
        <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={update} className="min-w-0 rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
        <select name="gender" value={form.gender} onChange={update} className="min-w-0 rounded-xl border p-2.5 text-sm dark:bg-slate-700">
          <option value="">Gender</option><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select name="bloodGroup" value={form.bloodGroup} onChange={update} className="rounded-xl border p-2.5 text-sm dark:bg-slate-700">
          <option value="">Blood group</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => <option key={group}>{group}</option>)}
        </select>
        <input name="emergencyContact" placeholder="Emergency contact" value={form.emergencyContact} onChange={update} className="rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
      </div>
      <textarea name="address" rows="2" placeholder="Address" value={form.address} onChange={update} className="w-full rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
      <button disabled={saving} type="submit" className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">
        {saving ? 'Saving patient...' : 'Create patient record'}
      </button>
    </form>
  );
}

export function AddDepartmentForm({ onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const handleSubmit = async event => {
    event.preventDefault();
    setSaving(true);
    try { await onSave({ name, description }); }
    finally { setSaving(false); }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Add Hospital Department</h3>
      <input required maxLength="100" value={name} onChange={event => setName(event.target.value)} placeholder="Department name" className="w-full rounded-xl border p-3 text-sm dark:bg-slate-700" />
      <textarea maxLength="500" rows="3" value={description} onChange={event => setDescription(event.target.value)} placeholder="Department description" className="w-full rounded-xl border p-3 text-sm dark:bg-slate-700" />
      <button disabled={saving} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Create department'}</button>
    </form>
  );
}

export function PrescriptionForm({ item, onSave }) {
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('');
  const [medicine, setMedicine] = useState({ name: '', dosage: '', frequency: '', duration: '' });
  const [saving, setSaving] = useState(false);
  const updateMedicine = event => setMedicine(current => ({ ...current, [event.target.name]: event.target.value }));
  const handleSubmit = async event => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({ appointment: item?.id, diagnosis, instructions, medicines: [medicine] });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] space-y-3 overflow-y-auto pr-1">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Issue Clinical Prescription</h3>
      {item && <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">Appointment for {item.patientName} with {item.doctorName}</p>}
      {!item && <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Open a patient appointment to create its prescription.</p>}
      <input type="text" required maxLength="500" placeholder="Clinical diagnosis" value={diagnosis} onChange={event => setDiagnosis(event.target.value)} className="w-full rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Medicine details</p>
      <input name="name" required placeholder="Medicine name" value={medicine.name} onChange={updateMedicine} className="w-full rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
      <div className="grid grid-cols-2 gap-2">
        <input name="dosage" required placeholder="Dosage (e.g. 500 mg)" value={medicine.dosage} onChange={updateMedicine} className="rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
        <input name="frequency" required placeholder="Frequency" value={medicine.frequency} onChange={updateMedicine} className="rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
      </div>
      <input name="duration" required placeholder="Duration (e.g. 5 days)" value={medicine.duration} onChange={updateMedicine} className="w-full rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
      <textarea rows="3" maxLength="2000" placeholder="Care instructions" value={instructions} onChange={event => setInstructions(event.target.value)} className="w-full rounded-xl border p-2.5 text-sm dark:bg-slate-700" />
      <button type="submit" disabled={saving || !item} className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50">
        {saving ? 'Saving...' : 'Save prescription'}
      </button>
    </form>
  );
}

export function PrintPrescriptionModal({ rx, onClose }) {
  return (
    <div className="space-y-4" data-print-area>
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-lg font-bold text-slate-800">MedCare Hospital Official Rx</h3>
        <p className="text-xs text-slate-500">Rx ID: {rx.id} â€¢ Date: {rx.date}</p>
      </div>

      <div className="text-xs space-y-2 text-slate-700">
        <p><strong>Patient Name:</strong> {rx.patientName}</p>
        <p><strong>Attending Doctor:</strong> {rx.doctorName}</p>
        <p><strong>Clinical Diagnosis:</strong> {rx.diagnosis}</p>
        <p><strong>Doctor Instructions:</strong> {rx.instructions || 'No additional instructions.'}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600"><tr><th className="p-2">Medicine</th><th className="p-2">Dosage</th><th className="p-2">Frequency</th><th className="p-2">Duration</th></tr></thead>
          <tbody>{rx.medicines.map((medicine, index) => <tr key={`${medicine.name}-${index}`} className="border-t"><td className="p-2">{medicine.name}</td><td className="p-2">{medicine.dosage}</td><td className="p-2">{medicine.frequency}</td><td className="p-2">{medicine.duration}</td></tr>)}</tbody>
        </table>
      </div>

      <div className="pt-4 flex space-x-2">
        <button onClick={() => window.print()} className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-blue-700 transition flex justify-center items-center space-x-1">
          <Printer className="w-4 h-4" /> <span>Print Document</span>
        </button>
        <button onClick={onClose} className="px-4 py-2 border rounded-xl text-xs font-semibold">
          Close
        </button>
      </div>
    </div>
  );
}

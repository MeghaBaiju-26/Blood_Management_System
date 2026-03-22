import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    User, Phone, Mail, Lock, Building2, Hash, FileText,
    Droplets, Database, BedDouble, Clock, ChevronRight, Edit2,
} from 'lucide-react';
import AuthLayout from '../auth/AuthLayout';
import AuthInput from '../auth/AuthInput';
import AuthButton from '../auth/AuthButton';
import CheckboxField from '../auth/CheckboxField';
import FormSection from '../auth/FormSection';
import ProgressSteps from '../auth/ProgressSteps';
import RoleSelector from '../auth/RoleSelector';
import DistrictSelector from '../auth/DistrictSelector';
import BloodTypeSelector from '../auth/BloodTypeSelector';
import { apiFetch } from '../services/http';

// ─── Shared constants ─────────────────────────────────────────────────────────

const REGISTER_ROLES = [
    { id: 'donor', label: 'Donor', icon: '🩸', desc: 'I want to donate blood', color: 'rgba(217,0,37,0.08)' },
    { id: 'hospital', label: 'Hospital', icon: '🏥', desc: 'I manage a hospital or clinic', color: 'rgba(99,102,241,0.08)' },
    { id: 'blood_bank', label: 'Blood Bank', icon: '🔬', desc: 'I manage a blood bank', color: 'rgba(245,158,11,0.08)' },
    { id: 'admin', label: 'Admin', icon: '🛡️', desc: 'Created by system administrator', color: 'rgba(255,255,255,0.04)', noRegister: true },
];

const SERVICES = ['Whole Blood Collection', 'Component Separation', 'Blood Storage Only', 'Emergency Dispatch', 'Mobile Blood Camps'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const ORG_TYPES = [
    { id: 'hospital', label: 'Hospital', icon: '🏥' },
    { id: 'clinic', label: 'Clinic', icon: '🏨' },
    { id: 'govt', label: 'Govt Facility', icon: '🏛' },
    { id: 'private', label: 'Private Hospital', icon: '🏢' },
];

// ─── Slide animation helpers ──────────────────────────────────────────────────

const slide = (dir) => ({
    initial: { opacity: 0, x: dir * 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: dir * -40 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
});

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay },
});

// ─── Shared sub-components ────────────────────────────────────────────────────

function PasswordStrength({ password }) {
    const strength = (() => {
        if (password.length < 8) return 0;
        let s = 0;
        if (/[a-z]/.test(password)) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return s;
    })();
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', 'var(--red)', '#f59e0b', '#eab308', '#22c55e'];
    if (!password) return null;
    return (
        <div style={{ marginTop: 6, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i <= strength ? colors[strength] : 'rgba(255,255,255,0.08)',
                        transition: 'background 0.3s',
                    }} />
                ))}
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: colors[strength] }}>{labels[strength]}</span>
        </div>
    );
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function isStrongPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/.test(String(password || ''));
}

function isValidPhone(phone) {
    const raw = String(phone || '').trim();
    const normalized = raw.replace(/[^\d+]/g, '');
    const digits = normalized.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
}

function ReviewCard({ title, data, onEdit }) {
    return (
        <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '20px 24px', marginBottom: 12, position: 'relative',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</span>
                <button onClick={onEdit} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4,
                    fontFamily: 'var(--font-body)', fontSize: 12, padding: 0,
                    transition: 'color 0.2s',
                }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                >
                    <Edit2 size={12} /> Edit
                </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {data.filter(d => d.val).map(({ label, val }) => (
                    <div key={label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', minWidth: 110, paddingTop: 2 }}>{label}</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', flex: 1 }}>{val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function OrgTypeGrid({ value, onChange }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                ORGANIZATION TYPE <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {ORG_TYPES.map(({ id, label, icon }) => (
                    <button key={id} type="button" onClick={() => onChange(id)} style={{
                        padding: '14px 12px', textAlign: 'center', cursor: 'pointer',
                        background: value === id ? 'rgba(217,0,37,0.1)' : '#0F0F17',
                        border: `1px solid ${value === id ? 'rgba(217,0,37,0.4)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 13,
                        color: value === id ? '#fff' : 'var(--text2)', transition: 'all 0.2s',
                    }}>
                        <span style={{ fontSize: 16 }}>{icon}</span>{label}
                    </button>
                ))}
            </div>
        </div>
    );
}

function GenderSelector({ value, onChange }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                GENDER <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
                {GENDERS.map(g => (
                    <button key={g} type="button" onClick={() => onChange(g)} style={{
                        flex: 1, padding: '10px 6px', cursor: 'pointer', textAlign: 'center',
                        background: value === g ? 'rgba(217,0,37,0.1)' : '#0F0F17',
                        border: `1px solid ${value === g ? 'rgba(217,0,37,0.4)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 10, fontFamily: 'var(--font-body)', fontSize: 12,
                        color: value === g ? '#fff' : 'var(--text2)', transition: 'all 0.2s',
                    }}>{g}</button>
                ))}
            </div>
        </div>
    );
}

function SuccessState({ role }) {
    const isPending = role === 'hospital' || role === 'blood_bank';
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', padding: '20px 0' }}
        >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.15 }}>
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ margin: '0 auto 24px', display: 'block' }}>
                    <circle cx="40" cy="40" r="38" fill="none" stroke="rgba(34,197,94,0.2)" strokeWidth="2" />
                    <circle cx="40" cy="40" r="38" fill="none" stroke="#22c55e" strokeWidth="2"
                        strokeDasharray="239" strokeDashoffset="239"
                        style={{ animation: 'drawCircle 0.6s ease-out 0.2s forwards' }} />
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                        d="M24 40L35 52L56 28" stroke="#22c55e" strokeWidth="3"
                        fill="none" strokeLinecap="round" strokeLinejoin="round"
                    />
                </svg>
            </motion.div>
            <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 26, marginBottom: 12 }}>
                {isPending ? 'Application Submitted!' : 'Welcome to HEM∆!'}
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text2)', lineHeight: 1.7, maxWidth: 340, margin: '0 auto 14px' }}>
                {isPending
                    ? 'Our Kerala team will verify your credentials within 24 hours.'
                    : 'Your donor profile is ready. You can now log in and schedule donations.'}
            </p>
            {isPending && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)', marginBottom: 28 }}>REF: HEM-2025-KL-00847</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320, margin: '0 auto' }}>
                {isPending && (
                    <Link to="/pending-approval" style={{ textDecoration: 'none' }}>
                        <AuthButton variant="ghost" fullWidth>View Application Status →</AuthButton>
                    </Link>
                )}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                    <AuthButton variant={isPending ? 'ghost' : 'primary'} fullWidth>
                        {isPending ? '← Back to Login' : 'Go to Login →'}
                    </AuthButton>
                </Link>
            </div>
            <style>{`@keyframes drawCircle { to { stroke-dashoffset: 0; } }`}</style>
        </motion.div>
    );
}

function AgreementsBlock({ values, setValues }) {
    const toggle = (key) => setValues(v => ({ ...v, [key]: !v[key] }));
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
            <CheckboxField required
                label={<span>I agree to HEM∆ <span style={{ color: 'var(--red)' }}>Terms of Service</span> and <span style={{ color: 'var(--red)' }}>Privacy Policy</span></span>}
                checked={values.terms} onChange={() => toggle('terms')} />
            <CheckboxField required
                label="I accept the NACO Data Handling Agreement for blood bank records"
                checked={values.naco} onChange={() => toggle('naco')} />
            <CheckboxField required
                label="I confirm all information provided is accurate and legally valid"
                checked={values.accuracy} onChange={() => toggle('accuracy')} />
        </div>
    );
}

// ─── DONOR FLOW (3 steps) ─────────────────────────────────────────────────────

function DonorRegister({ onSuccess }) {
    const STEPS = ['Personal Details', 'Health Snapshot', 'Review & Submit'];
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);
    const [loading, setLoading] = useState(false);
    const [agreements, setAgreements] = useState({ terms: false, naco: false, accuracy: false });

    // Step 1
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [phone, setPhone] = useState('');
    const [district, setDistrict] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    // Step 2
    const [weight, setWeight] = useState('');
    const [hemoglobin, setHemoglobin] = useState('');
    const [bp, setBp] = useState('');
    const [conditions, setConditions] = useState('');

    const goTo = (s) => { setDir(s > step ? 1 : -1); setStep(s); };

    const handleSubmit = async () => {
        if (!name || !email || !password || !bloodGroup) {
            toast.error('Please fill required fields: name, email, password and blood group.');
            return;
        }
        if (!isValidEmail(email)) {
            toast.error('Please enter a valid email address.');
            return;
        }
        if (phone && !isValidPhone(phone)) {
            toast.error('Please enter a valid phone number (10 to 15 digits).');
            return;
        }
        if (!isStrongPassword(password)) {
            toast.error('Password must be 8-72 chars and include uppercase, lowercase, number and special character.');
            return;
        }
        if (password !== confirm) {
            toast.error('Password and confirm password do not match.');
            return;
        }

        setLoading(true);
        try {
            const res = await apiFetch('/auth/register/donor', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    age: age ? Number(age) : null,
                    gender,
                    phone_no: phone,
                    blood_group: bloodGroup,
                    city: district,
                    email,
                    password,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message || 'Registration failed');
            }

            onSuccess('donor');
        } catch (error) {
            toast.error(error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ProgressSteps current={step} steps={STEPS} />
            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div key="d0" {...slide(dir)}>
                        <FormSection label="STEP 1 OF 3 · PERSONAL DETAILS">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="FULL NAME" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} icon={User} required />
                                <AuthInput label="AGE" type="number" placeholder="e.g. 25" value={age} onChange={e => setAge(e.target.value)} required />
                            </div>
                            <GenderSelector value={gender} onChange={setGender} />
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 10, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                    BLOOD GROUP <span style={{ color: 'var(--red)' }}>*</span>
                                </label>
                                <BloodTypeSelector value={bloodGroup} onChange={setBloodGroup} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="PHONE NUMBER" type="tel" placeholder="+91 XXXXX XXXXX" value={phone} onChange={e => setPhone(e.target.value)} icon={Phone} required />
                                <DistrictSelector label="DISTRICT" value={district} onChange={setDistrict} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="EMAIL" type="email" value={email} onChange={e => setEmail(e.target.value)} icon={Mail} required />
                                <div>
                                    <AuthInput label="PASSWORD" type="password" value={password} onChange={e => setPassword(e.target.value)} icon={Lock} required />
                                    <PasswordStrength password={password} />
                                </div>
                            </div>
                            <AuthInput label="CONFIRM PASSWORD" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} icon={Lock} required />
                        </FormSection>
                        <AuthButton variant="primary" fullWidth onClick={() => goTo(1)}>Continue to Step 2 →</AuthButton>
                    </motion.div>
                )}
                {step === 1 && (
                    <motion.div key="d1" {...slide(dir)}>
                        <FormSection label="STEP 2 OF 3 · HEALTH SNAPSHOT">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="WEIGHT (KG)" type="number" placeholder="e.g. 65" value={weight} onChange={e => setWeight(e.target.value)} hint="Minimum 50 kg required" />
                                <AuthInput label="HEMOGLOBIN (g/dL)" type="number" placeholder="e.g. 13.5" value={hemoglobin} onChange={e => setHemoglobin(e.target.value)} />
                            </div>
                            <AuthInput label="BLOOD PRESSURE" placeholder="e.g. 120/80 mmHg" value={bp} onChange={e => setBp(e.target.value)} hint="Systolic/Diastolic" />
                            <AuthInput label="KNOWN CONDITIONS / MEDICATIONS" placeholder="None / List any pre-existing conditions" value={conditions} onChange={e => setConditions(e.target.value)} hint="Optional — helps us ensure safe donation" />
                            <div style={{
                                background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
                                borderRadius: 12, padding: '14px 18px', marginBottom: 8,
                            }}>
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#22c55e', lineHeight: 1.6 }}>
                                    ✓ Your health data is encrypted and never shared without consent.
                                </p>
                            </div>
                        </FormSection>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <AuthButton variant="ghost" onClick={() => goTo(0)}>← Back</AuthButton>
                            <AuthButton variant="primary" fullWidth onClick={() => goTo(2)}>Review & Submit →</AuthButton>
                        </div>
                    </motion.div>
                )}
                {step === 2 && (
                    <motion.div key="d2" {...slide(dir)}>
                        <FormSection label="STEP 3 OF 3 · REVIEW & SUBMIT">
                            <ReviewCard title="PERSONAL DETAILS" onEdit={() => goTo(0)} data={[
                                { label: 'Name', val: name },
                                { label: 'Age', val: age ? `${age} years` : undefined },
                                { label: 'Gender', val: gender },
                                { label: 'Blood Group', val: bloodGroup },
                                { label: 'Phone', val: phone },
                                { label: 'District', val: district },
                                { label: 'Email', val: email },
                            ]} />
                            <ReviewCard title="HEALTH SNAPSHOT" onEdit={() => goTo(1)} data={[
                                { label: 'Weight', val: weight ? `${weight} kg` : undefined },
                                { label: 'Hemoglobin', val: hemoglobin ? `${hemoglobin} g/dL` : undefined },
                                { label: 'Blood Pressure', val: bp },
                                { label: 'Conditions', val: conditions || 'None reported' },
                            ]} />
                            <AgreementsBlock values={agreements} setValues={setAgreements} />
                        </FormSection>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <AuthButton variant="ghost" onClick={() => goTo(1)}>← Back</AuthButton>
                            <AuthButton variant="primary" fullWidth loading={loading}
                                disabled={!agreements.terms || !agreements.naco || !agreements.accuracy}
                                onClick={handleSubmit}>
                                Submit Registration
                            </AuthButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ─── HOSPITAL FLOW (4 steps) ──────────────────────────────────────────────────

function HospitalRegister({ onSuccess }) {
    const STEPS = ['Organization', 'Admin Account', 'Facility Details', 'Review & Submit'];
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);
    const [loading, setLoading] = useState(false);
    const [agreements, setAgreements] = useState({ terms: false, naco: false, accuracy: false });

    // Step 1
    const [orgName, setOrgName] = useState('');
    const [orgType, setOrgType] = useState('');
    const [district, setDistrict] = useState('');
    const [contact, setContact] = useState('');
    const [regNumber, setRegNumber] = useState('');
    const [license, setLicense] = useState('');

    // Step 2
    const [adminName, setAdminName] = useState('');
    const [designation, setDesignation] = useState('');
    const [role, setRole] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    // Step 3
    const [beds, setBeds] = useState('');
    const [departments, setDepartments] = useState('');
    const [monthlyVol, setMonthlyVol] = useState('');
    const [bloodTypes, setBloodTypes] = useState([]);
    const [services, setServices] = useState([]);

    const goTo = (s) => { setDir(s > step ? 1 : -1); setStep(s); };

    const handleSubmit = async () => {
        if (!orgName || !email || !password) {
            toast.error('Please fill required fields: hospital name, email and password.');
            return;
        }
        if (!isValidEmail(email)) {
            toast.error('Please enter a valid email address.');
            return;
        }
        if (contact && !isValidPhone(contact)) {
            toast.error('Please enter a valid contact number (10 to 15 digits).');
            return;
        }
        if (!isStrongPassword(password)) {
            toast.error('Password must be 8-72 chars and include uppercase, lowercase, number and special character.');
            return;
        }
        if (password !== confirm) {
            toast.error('Password and confirm password do not match.');
            return;
        }

        setLoading(true);
        try {
            const res = await apiFetch('/auth/register/hospital', {
                method: 'POST',
                body: JSON.stringify({
                    hospital_name: orgName,
                    city: district,
                    contact_no: contact,
                    email,
                    password,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message || 'Registration failed');
            }

            onSuccess('hospital');
        } catch (error) {
            toast.error(error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ProgressSteps current={step} steps={STEPS} />
            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div key="h0" {...slide(dir)}>
                        <FormSection label="STEP 1 OF 4 · ORGANIZATION DETAILS">
                            <AuthInput label="HOSPITAL NAME" placeholder="e.g. KIMS Hospital, Trivandrum"
                                value={orgName} onChange={e => setOrgName(e.target.value)} icon={Building2} required />
                            <OrgTypeGrid value={orgType} onChange={setOrgType} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <DistrictSelector label="KERALA DISTRICT" value={district} onChange={setDistrict} required />
                                <AuthInput label="CONTACT NUMBER" type="tel" placeholder="+91 XXXXX XXXXX"
                                    value={contact} onChange={e => setContact(e.target.value)} icon={Phone} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="REGISTRATION NUMBER" placeholder="KL-HOS-2024-XXXX"
                                    value={regNumber} onChange={e => setRegNumber(e.target.value)} icon={Hash} required hint="Hospital reg. number" />
                                <AuthInput label="HEALTH DEPT. LICENSE" placeholder="License number"
                                    value={license} onChange={e => setLicense(e.target.value)} icon={FileText} required />
                            </div>
                        </FormSection>
                        <AuthButton variant="primary" fullWidth onClick={() => goTo(1)}>Continue to Step 2 →</AuthButton>
                    </motion.div>
                )}
                {step === 1 && (
                    <motion.div key="h1" {...slide(dir)}>
                        <FormSection label="STEP 2 OF 4 · ADMIN ACCOUNT">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="FULL NAME" placeholder="Dr. / Mr. / Ms. Full Name"
                                    value={adminName} onChange={e => setAdminName(e.target.value)} icon={User} required />
                                <AuthInput label="DESIGNATION" placeholder="e.g. Medical Superintendent"
                                    value={designation} onChange={e => setDesignation(e.target.value)} required />
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                    YOUR ROLE IN SYSTEM <span style={{ color: 'var(--red)' }}>*</span>
                                </label>
                                <RoleSelector value={role} onChange={setRole} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="EMAIL" type="email"
                                    value={email} onChange={e => setEmail(e.target.value)} icon={Mail} required />
                                <AuthInput label="PHONE NUMBER" type="tel" placeholder="+91 XXXXX XXXXX"
                                    value={phone} onChange={e => setPhone(e.target.value)} icon={Phone} required hint="OTP sent here" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <AuthInput label="PASSWORD" type="password"
                                        value={password} onChange={e => setPassword(e.target.value)} icon={Lock} required hint="8+ chars with uppercase, lowercase, number, special" />
                                    <PasswordStrength password={password} />
                                </div>
                                <AuthInput label="CONFIRM PASSWORD" type="password"
                                    value={confirm} onChange={e => setConfirm(e.target.value)} icon={Lock} required />
                            </div>
                        </FormSection>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <AuthButton variant="ghost" onClick={() => goTo(0)}>← Back</AuthButton>
                            <AuthButton variant="primary" fullWidth onClick={() => goTo(2)}>Continue to Step 3 →</AuthButton>
                        </div>
                    </motion.div>
                )}
                {step === 2 && (
                    <motion.div key="h2" {...slide(dir)}>
                        <FormSection label="STEP 3 OF 4 · FACILITY DETAILS">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="NUMBER OF BEDS" type="number" placeholder="e.g. 250"
                                    value={beds} onChange={e => setBeds(e.target.value)} icon={BedDouble} />
                                <AuthInput label="KEY DEPARTMENTS" placeholder="ICU, Oncology, Maternity..."
                                    value={departments} onChange={e => setDepartments(e.target.value)} />
                            </div>
                            <AuthInput label="MONTHLY BLOOD VOLUME (UNITS)" type="number" placeholder="e.g. 500"
                                value={monthlyVol} onChange={e => setMonthlyVol(e.target.value)} icon={Droplets} />
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>BLOOD TYPES HANDLED</label>
                                <BloodTypeSelector value={bloodTypes} onChange={setBloodTypes} multi />
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <label style={{ display: 'block', marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>SERVICES OFFERED</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    {SERVICES.map(s => (
                                        <CheckboxField key={s} label={s}
                                            checked={services.includes(s)}
                                            onChange={e => setServices(prev => e.target.checked ? [...prev, s] : prev.filter(x => x !== s))}
                                        />
                                    ))}
                                </div>
                            </div>
                        </FormSection>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <AuthButton variant="ghost" onClick={() => goTo(1)}>← Back</AuthButton>
                            <AuthButton variant="primary" fullWidth onClick={() => goTo(3)}>Review & Submit →</AuthButton>
                        </div>
                    </motion.div>
                )}
                {step === 3 && (
                    <motion.div key="h3" {...slide(dir)}>
                        <FormSection label="STEP 4 OF 4 · REVIEW & SUBMIT">
                            <ReviewCard title="ORGANIZATION" onEdit={() => goTo(0)} data={[
                                { label: 'Name', val: orgName }, { label: 'Type', val: orgType },
                                { label: 'District', val: district }, { label: 'Contact', val: contact },
                                { label: 'Reg. Number', val: regNumber }, { label: 'License', val: license },
                            ]} />
                            <ReviewCard title="ADMIN ACCOUNT" onEdit={() => goTo(1)} data={[
                                { label: 'Name', val: adminName }, { label: 'Designation', val: designation },
                                { label: 'Role', val: role }, { label: 'Email', val: email },
                                { label: 'Phone', val: phone }, { label: 'Password', val: password ? '••••••••' : undefined },
                            ]} />
                            <ReviewCard title="FACILITY" onEdit={() => goTo(2)} data={[
                                { label: 'Beds', val: beds },
                                { label: 'Departments', val: departments },
                                { label: 'Monthly Vol.', val: monthlyVol ? `${monthlyVol} units` : undefined },
                                { label: 'Blood Types', val: bloodTypes.join(', ') || undefined },
                                { label: 'Services', val: services.length > 0 ? services.join(', ') : undefined },
                            ]} />
                            <AgreementsBlock values={agreements} setValues={setAgreements} />
                        </FormSection>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <AuthButton variant="ghost" onClick={() => goTo(2)}>← Back</AuthButton>
                            <AuthButton variant="primary" fullWidth loading={loading}
                                disabled={!agreements.terms || !agreements.naco || !agreements.accuracy}
                                onClick={handleSubmit}>
                                Submit for Approval
                            </AuthButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ─── BLOOD BANK FLOW (4 steps) ────────────────────────────────────────────────

function BloodBankRegister({ onSuccess }) {
    const STEPS = ['Bank Details', 'Admin Account', 'Operations', 'Review & Submit'];
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);
    const [loading, setLoading] = useState(false);
    const [agreements, setAgreements] = useState({ terms: false, naco: false, accuracy: false });

    // Step 1
    const [bankName, setBankName] = useState('');
    const [district, setDistrict] = useState('');
    const [contact, setContact] = useState('');
    const [bankLicense, setBankLicense] = useState('');
    const [nacoNumber, setNacoNumber] = useState('');

    // Step 2
    const [adminName, setAdminName] = useState('');
    const [designation, setDesignation] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    // Step 3
    const [storageCapacity, setStorageCapacity] = useState('');
    const [bloodTypes, setBloodTypes] = useState([]);
    const [equipment, setEquipment] = useState('');
    const [operatingHours, setOperatingHours] = useState('');
    const [componentSep, setComponentSep] = useState(false);
    const [services, setServices] = useState([]);

    const goTo = (s) => { setDir(s > step ? 1 : -1); setStep(s); };

    const handleSubmit = async () => {
        if (!bankName || !email || !password) {
            toast.error('Please fill required fields: bank name, email and password.');
            return;
        }
        if (!isValidEmail(email)) {
            toast.error('Please enter a valid email address.');
            return;
        }
        if (contact && !isValidPhone(contact)) {
            toast.error('Please enter a valid contact number (10 to 15 digits).');
            return;
        }
        if (!isStrongPassword(password)) {
            toast.error('Password must be 8-72 chars and include uppercase, lowercase, number and special character.');
            return;
        }
        if (password !== confirm) {
            toast.error('Password and confirm password do not match.');
            return;
        }

        setLoading(true);
        try {
            const res = await apiFetch('/auth/register/blood-bank', {
                method: 'POST',
                body: JSON.stringify({
                    bank_name: bankName,
                    city: district,
                    contact_no: contact,
                    email,
                    password,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message || 'Registration failed');
            }

            onSuccess('blood_bank');
        } catch (error) {
            toast.error(error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ProgressSteps current={step} steps={STEPS} />
            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div key="bb0" {...slide(dir)}>
                        <FormSection label="STEP 1 OF 4 · BANK DETAILS">
                            <AuthInput label="BLOOD BANK NAME" placeholder="e.g. Kerala State Blood Bank, Thrissur"
                                value={bankName} onChange={e => setBankName(e.target.value)} icon={Building2} required />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <DistrictSelector label="KERALA DISTRICT" value={district} onChange={setDistrict} required />
                                <AuthInput label="CONTACT NUMBER" type="tel" placeholder="+91 XXXXX XXXXX"
                                    value={contact} onChange={e => setContact(e.target.value)} icon={Phone} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="BANK LICENSE NUMBER" placeholder="License number"
                                    value={bankLicense} onChange={e => setBankLicense(e.target.value)} icon={FileText} required />
                                <AuthInput label="NACO REGISTRATION NUMBER" placeholder="NACO-XXXX-XXXX"
                                    value={nacoNumber} onChange={e => setNacoNumber(e.target.value)} icon={Hash} required hint="National AIDS Control Organisation reg." />
                            </div>
                        </FormSection>
                        <AuthButton variant="primary" fullWidth onClick={() => goTo(1)}>Continue to Step 2 →</AuthButton>
                    </motion.div>
                )}
                {step === 1 && (
                    <motion.div key="bb1" {...slide(dir)}>
                        <FormSection label="STEP 2 OF 4 · ADMIN ACCOUNT">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="FULL NAME" placeholder="Dr. / Mr. / Ms. Full Name"
                                    value={adminName} onChange={e => setAdminName(e.target.value)} icon={User} required />
                                <AuthInput label="DESIGNATION" placeholder="e.g. Blood Bank Manager"
                                    value={designation} onChange={e => setDesignation(e.target.value)} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="EMAIL" type="email"
                                    value={email} onChange={e => setEmail(e.target.value)} icon={Mail} required />
                                <AuthInput label="PHONE" type="tel" placeholder="+91 XXXXX XXXXX"
                                    value={phone} onChange={e => setPhone(e.target.value)} icon={Phone} required hint="OTP sent here" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <AuthInput label="PASSWORD" type="password"
                                        value={password} onChange={e => setPassword(e.target.value)} icon={Lock} required />
                                    <PasswordStrength password={password} />
                                </div>
                                <AuthInput label="CONFIRM PASSWORD" type="password"
                                    value={confirm} onChange={e => setConfirm(e.target.value)} icon={Lock} required />
                            </div>
                        </FormSection>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <AuthButton variant="ghost" onClick={() => goTo(0)}>← Back</AuthButton>
                            <AuthButton variant="primary" fullWidth onClick={() => goTo(2)}>Continue to Step 3 →</AuthButton>
                        </div>
                    </motion.div>
                )}
                {step === 2 && (
                    <motion.div key="bb2" {...slide(dir)}>
                        <FormSection label="STEP 3 OF 4 · OPERATIONAL DETAILS">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="STORAGE CAPACITY (UNITS)" type="number" placeholder="e.g. 2000"
                                    value={storageCapacity} onChange={e => setStorageCapacity(e.target.value)} icon={Database} />
                                <AuthInput label="OPERATING HOURS" placeholder="e.g. 24/7 or 8AM–8PM"
                                    value={operatingHours} onChange={e => setOperatingHours(e.target.value)} icon={Clock} />
                            </div>
                            <AuthInput label="EQUIPMENT / TECHNOLOGY" placeholder="e.g. Apheresis, Irradiator, Leukodepletion filters..."
                                value={equipment} onChange={e => setEquipment(e.target.value)}
                                hint="Key equipment available at your facility" />
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>BLOOD TYPES STORED</label>
                                <BloodTypeSelector value={bloodTypes} onChange={setBloodTypes} multi />
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>SERVICES OFFERED</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    {SERVICES.map(s => (
                                        <CheckboxField key={s} label={s}
                                            checked={services.includes(s)}
                                            onChange={e => setServices(prev => e.target.checked ? [...prev, s] : prev.filter(x => x !== s))}
                                        />
                                    ))}
                                </div>
                            </div>
                            <CheckboxField
                                label="Component separation capability (whole blood → packed cells, plasma, platelets)"
                                checked={componentSep}
                                onChange={e => setComponentSep(e.target.checked)}
                            />
                        </FormSection>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <AuthButton variant="ghost" onClick={() => goTo(1)}>← Back</AuthButton>
                            <AuthButton variant="primary" fullWidth onClick={() => goTo(3)}>Review & Submit →</AuthButton>
                        </div>
                    </motion.div>
                )}
                {step === 3 && (
                    <motion.div key="bb3" {...slide(dir)}>
                        <FormSection label="STEP 4 OF 4 · REVIEW & SUBMIT">
                            <ReviewCard title="BANK DETAILS" onEdit={() => goTo(0)} data={[
                                { label: 'Bank Name', val: bankName }, { label: 'District', val: district },
                                { label: 'Contact', val: contact }, { label: 'License', val: bankLicense },
                                { label: 'NACO Number', val: nacoNumber },
                            ]} />
                            <ReviewCard title="ADMIN ACCOUNT" onEdit={() => goTo(1)} data={[
                                { label: 'Name', val: adminName }, { label: 'Designation', val: designation },
                                { label: 'Email', val: email }, { label: 'Phone', val: phone },
                                { label: 'Password', val: password ? '••••••••' : undefined },
                            ]} />
                            <ReviewCard title="OPERATIONS" onEdit={() => goTo(2)} data={[
                                { label: 'Storage', val: storageCapacity ? `${storageCapacity} units` : undefined },
                                { label: 'Hours', val: operatingHours },
                                { label: 'Blood Types', val: bloodTypes.join(', ') || undefined },
                                { label: 'Equipment', val: equipment },
                                { label: 'Component Sep.', val: componentSep ? 'Yes' : undefined },
                                { label: 'Services', val: services.length > 0 ? services.join(', ') : undefined },
                            ]} />
                            <AgreementsBlock values={agreements} setValues={setAgreements} />
                        </FormSection>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <AuthButton variant="ghost" onClick={() => goTo(2)}>← Back</AuthButton>
                            <AuthButton variant="primary" fullWidth loading={loading}
                                disabled={!agreements.terms || !agreements.naco || !agreements.accuracy}
                                onClick={handleSubmit}>
                                Submit for Approval
                            </AuthButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ─── MAIN REGISTER PAGE ───────────────────────────────────────────────────────

export default function Register() {
    const [selectedRole, setSelectedRole] = useState(null);
    const [successRole, setSuccessRole] = useState(null);
    const [hovered, setHovered] = useState(null);

    const panelTaglines = {
        donor: ['JOIN AS A', 'BLOOD', 'DONOR'],
        hospital: ['JOIN THE', 'KERALA', 'NETWORK'],
        blood_bank: ['REGISTER', 'YOUR', 'BLOOD BANK'],
        admin: ['ADMIN', 'ACCESS', 'RESTRICTED'],
    };
    const panelSubtitles = {
        donor: 'Create your donor profile on HEM∆',
        hospital: 'Register your hospital or clinic on HEM∆',
        blood_bank: 'Register your blood bank on HEM∆',
        admin: 'Admin accounts are system-managed only',
    };

    const tagline = selectedRole ? panelTaglines[selectedRole.id] : ['JOIN THE', 'KERALA', 'NETWORK'];
    const subtitle = selectedRole ? panelSubtitles[selectedRole.id] : 'Register your hospital or blood bank on HEM∆';

    if (successRole) {
        return (
            <AuthLayout tagline={tagline} subtitle={subtitle} backTo="/login" backLabel="Back to Login">
                <SuccessState role={successRole} />
            </AuthLayout>
        );
    }

    return (
        <AuthLayout tagline={tagline} subtitle={subtitle} backTo="/login" backLabel="Back to Login">
            <AnimatePresence mode="wait">

                {/* ── ROLE SELECTOR ── */}
                {!selectedRole && (
                    <motion.div key="role-select" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                        <motion.div {...fadeUp(0)} style={{ marginBottom: 28 }}>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', letterSpacing: '0.1em', marginBottom: 10 }}>◈ CREATE ACCOUNT</p>
                            <h1 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 30, marginBottom: 6 }}>Register as...</h1>
                            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 15, color: 'var(--text2)' }}>Choose the account type that fits you</p>
                        </motion.div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                            {REGISTER_ROLES.map((role, i) => (
                                <motion.div key={role.id} {...fadeUp(0.06 * i)}>
                                    <button
                                        onClick={() => {
                                            if (!role.noRegister) setSelectedRole(role);
                                        }}
                                        onMouseEnter={() => setHovered(role.id)}
                                        onMouseLeave={() => setHovered(null)}
                                        style={{
                                            width: '100%', padding: '22px 20px', cursor: role.noRegister ? 'default' : 'pointer',
                                            textAlign: 'left',
                                            background: hovered === role.id && !role.noRegister ? 'rgba(217,0,37,0.07)' : role.color,
                                            border: `1px solid ${hovered === role.id && !role.noRegister ? 'rgba(217,0,37,0.4)' : 'rgba(255,255,255,0.07)'}`,
                                            borderRadius: 16, transition: 'all 0.2s',
                                            display: 'flex', flexDirection: 'column', gap: 6, position: 'relative',
                                            opacity: role.noRegister ? 0.6 : 1,
                                        }}
                                    >
                                        <span style={{ fontSize: 26 }}>{role.icon}</span>
                                        <span style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, color: '#fff' }}>{role.label}</span>
                                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', lineHeight: 1.4 }}>
                                            {role.noRegister ? 'Contact admin@hema.health to create an admin account' : role.desc}
                                        </span>
                                        {!role.noRegister && (
                                            <ChevronRight size={14} color={hovered === role.id ? 'var(--red)' : 'var(--text3)'}
                                                style={{ position: 'absolute', top: 20, right: 16, transition: 'color 0.2s' }} />
                                        )}
                                        {role.noRegister && (
                                            <span style={{
                                                position: 'absolute', top: 14, right: 14,
                                                fontFamily: 'var(--font-mono)', fontSize: 9,
                                                background: 'rgba(255,255,255,0.07)', padding: '3px 8px', borderRadius: 6,
                                                color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase',
                                            }}>Restricted</span>
                                        )}
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div {...fadeUp(0.3)} style={{ textAlign: 'center', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>Already have an account? </span>
                            <Link to="/login" style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: 'var(--red)', textDecoration: 'none' }}>Sign In →</Link>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── DONOR FORM ── */}
                {selectedRole?.id === 'donor' && (
                    <motion.div key="donor-form" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.35 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.25)',
                                borderRadius: 100, padding: '5px 14px',
                                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', letterSpacing: '0.08em',
                            }}>🩸 REGISTERING AS DONOR</div>
                            <button onClick={() => setSelectedRole(null)} style={{
                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)',
                                fontFamily: 'var(--font-body)', fontSize: 13, padding: 0,
                            }}>Change</button>
                        </div>
                        <DonorRegister onSuccess={setSuccessRole} />
                    </motion.div>
                )}

                {/* ── HOSPITAL FORM ── */}
                {selectedRole?.id === 'hospital' && (
                    <motion.div key="hospital-form" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.35 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                                borderRadius: 100, padding: '5px 14px',
                                fontFamily: 'var(--font-mono)', fontSize: 11, color: '#818cf8', letterSpacing: '0.08em',
                            }}>🏥 REGISTERING AS HOSPITAL</div>
                            <button onClick={() => setSelectedRole(null)} style={{
                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)',
                                fontFamily: 'var(--font-body)', fontSize: 13, padding: 0,
                            }}>Change</button>
                        </div>
                        <HospitalRegister onSuccess={setSuccessRole} />
                    </motion.div>
                )}

                {/* ── BLOOD BANK FORM ── */}
                {selectedRole?.id === 'blood_bank' && (
                    <motion.div key="bb-form" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.35 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                                borderRadius: 100, padding: '5px 14px',
                                fontFamily: 'var(--font-mono)', fontSize: 11, color: '#f59e0b', letterSpacing: '0.08em',
                            }}>🔬 REGISTERING AS BLOOD BANK</div>
                            <button onClick={() => setSelectedRole(null)} style={{
                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)',
                                fontFamily: 'var(--font-body)', fontSize: 13, padding: 0,
                            }}>Change</button>
                        </div>
                        <BloodBankRegister onSuccess={setSuccessRole} />
                    </motion.div>
                )}

            </AnimatePresence>
        </AuthLayout>
    );
}

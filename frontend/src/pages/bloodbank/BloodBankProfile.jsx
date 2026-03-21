import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Edit2, Download } from 'lucide-react';
import BloodBankLayout from '../../components/bloodbank/BloodBankLayout';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const DISTRICTS = ['Thiruvananthapuram', 'Ernakulam', 'Thrissur', 'Kozhikode', 'Palakkad', 'Alappuzha'];

const NOTIFS = [
    { id: 'emerg', label: 'Emergency Request Alerts', val: true },
    { id: 'stock', label: 'Low Stock Alerts', val: true },
    { id: 'recall', label: 'Donation Reminders to Donors', val: true },
    { id: 'pay', label: 'Payment Received Alerts', val: true },
    { id: 'expiry', label: 'Stock Expiry Warnings', val: true },
    { id: 'wa', label: 'WhatsApp Notifications', val: false },
];

const CONNECTED_HOSPITALS = [
    { id: 'HSP-001', name: 'General Hospital', city: 'Thiruvananthapuram', requests: 2 },
    { id: 'HSP-002', name: 'Medical College', city: 'Thiruvananthapuram', requests: 1 },
    { id: 'HSP-003', name: 'KIMS Hospital', city: 'Thiruvananthapuram', requests: 1 },
];


function Toggle({ on, onToggle }) {
    return (
        <div onClick={onToggle} style={{ width: 44, height: 24, borderRadius: 12, background: on ? 'var(--red)' : 'rgba(255,255,255,0.08)', border: `1px solid ${on ? 'rgba(217,0,37,0.5)' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', position: 'relative', transition: 'all 0.25s', flexShrink: 0 }}>
            <motion.div animate={{ x: on ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} style={{ position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%', background: on ? '#fff' : 'rgba(255,255,255,0.3)' }} />
        </div>
    );
}

export default function BloodBankProfile() {
    const [tab, setTab] = useState('details');
    const [editable, setEditable] = useState(false);
   const [form, setForm] = useState({
    bank_name: "",
    city: "",
    contact_number: "",
    naco_number: "",
    license_number: "",
    storage_capacity: "",
    operating_hours: ""
});
useEffect(() => {
    const fetchProfile = async () => {
        try {
            const bankId = localStorage.getItem("bank_id");

            const res = await fetch(`http://localhost:5000/blood-banks/${bankId}`);
            const data = await res.json();

            setForm({
                bank_name: data.bank_name || "",
                city: data.city || "",
                contact_number: data.contact_no || "",
                naco_number: data.naco_number || "",
                license_number: data.license_number || "",
                storage_capacity: data.storage_capacity || "",
                operating_hours: data.operating_hours || ""
            });

        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    fetchProfile();
}, []);
    const [savedOk, setSavedOk] = useState(false);
    const [notifs, setNotifs] = useState(NOTIFS.reduce((o, n) => ({ ...o, [n.id]: n.val }), {}));
    const [selectedTypes, setSelectedTypes] = useState(BLOOD_TYPES);
    const [loading, setLoading] = useState(true);

    const toggleType = (t) => setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

    const handleSave = async () => {
    try {
        const bankId = localStorage.getItem("bank_id");

        const response = await fetch(`http://localhost:5000/blood-banks/${bankId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                bank_name: form.bank_name,
                city: form.city,
                contact_no: form.contact_number   // ⚠️ IMPORTANT FIX
            })
        });

        const data = await response.json();

        if (response.ok) {
            setSavedOk(true);
            setEditable(false);
            setTimeout(() => setSavedOk(false), 2000);
        } else {
            alert(data.message);
        }

    } catch (err) {
        console.error(err);
        alert("Update failed");
    }
};
    const iS = (disabled = false) => ({ width: '100%', background: disabled ? '#07070B' : '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box', cursor: disabled ? 'default' : 'text', opacity: disabled ? 0.6 : 1 });
    const lS = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, marginTop: 18 };
    if (loading) {
    return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;
}
    return (
        <BloodBankLayout title="Profile" page="PROFILE">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'linear-gradient(135deg,rgba(217,0,37,0.08)0%,rgba(217,0,37,0.02)50%,transparent)', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 20, padding: 36, display: 'flex', alignItems: 'center', gap: 28 }}>
                    <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Droplets size={36} color="var(--red)" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: '#fff', lineHeight: 1, marginBottom: 10 }}>{form.bank_name}</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                            {['BLOOD BANK', form.city].map(l => <span key={l} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '2px 10px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{l}</span>)}
                            <span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 100, padding: '2px 10px', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#22c55e' }}>NACO VERIFIED</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>ID: {localStorage.getItem("bank_id")} · Cap: {form.storage_capacity} units · Kerala</div>
                    </div>
                    <button onClick={() => setEditable(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', borderRadius: 10, padding: '10px 18px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)', transition: 'border-color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(217,0,37,0.4)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}>
                        <Edit2 size={14} /> Edit Profile
                    </button>
                </motion.div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {[['details', 'Bank Details'], ['settings', 'Account Settings']].map(([k, l]) => (
                        <button key={k} onClick={() => setTab(k)} style={{ background: 'none', border: 'none', borderBottom: `2px solid ${tab === k ? 'var(--red)' : 'transparent'}`, cursor: 'pointer', padding: '12px 24px', fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 15, color: tab === k ? '#fff' : 'var(--text3)', transition: 'all 0.15s' }}>{l}</button>
                    ))}
                </div>

                {tab === 'details' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {/* Edit Form */}
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 4 }}>Bank Information</div>
                            {savedOk && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#22c55e', marginBottom: 8 }}>✓ Changes saved successfully</div>}
                            {[['BANK NAME', 'bank_name', 'text'], ['CONTACT NUMBER', 'contact_number', 'text'], ['NACO REG NUMBER', 'naco_number', 'text'], ['LICENSE NUMBER', 'license_number', 'text'], ['STORAGE CAPACITY (UNITS)', 'storage_capacity', 'number'], ['OPERATING HOURS', 'operating_hours', 'text']].map(([l, k, t]) => (
                                <div key={k}><label style={lS}>{l}</label><input type={t} value={form[k]} disabled={!editable} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={iS(!editable)} /></div>
                            ))}
                            <label style={lS}>CITY / DISTRICT</label>
                            <select value={form.city} disabled={!editable} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} style={{ ...iS(!editable), cursor: editable ? 'pointer' : 'default' }}>
                                {DISTRICTS.map(d => <option key={d} style={{ background: '#0F0F17' }}>{d}</option>)}
                            </select>
                            <label style={lS}>BLOOD TYPES STORED</label>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                                {BLOOD_TYPES.map(t => <button key={t} onClick={() => editable && toggleType(t)} style={{ padding: '5px 10px', borderRadius: 8, cursor: editable ? 'pointer' : 'default', background: selectedTypes.includes(t) ? 'rgba(217,0,37,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${selectedTypes.includes(t) ? 'rgba(217,0,37,0.4)' : 'rgba(255,255,255,0.08)'}`, fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 11, color: selectedTypes.includes(t) ? 'var(--red)' : 'var(--text3)', opacity: editable ? 1 : 0.7 }}>{t}</button>)}
                            </div>
                            <button onClick={handleSave} disabled={!editable} style={{ width: '100%', background: 'var(--red)', border: 'none', borderRadius: 10, padding: '12px 0', cursor: editable ? 'pointer' : 'default', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#fff', opacity: editable ? 1 : 0.4, transition: 'opacity 0.2s' }}>Save Changes</button>
                        </motion.div>
                        {/* Summary */}
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 20 }}>Bank Summary</div>
                            {[
    ['BANK ID', localStorage.getItem("bank_id")],
    ['CITY', form.city],
    ['NACO NUMBER', form.naco_number],
    ['STORAGE CAPACITY', `${form.storage_capacity} units`],
    ['TOTAL UNITS NOW', '-'],
    ['TOTAL DONATIONS', '4'],
    ['ESTABLISHED', '-'],
].map(([l, v]) => (
                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</span>
                                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff' }}>{v}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>STATUS</span>
                                <span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 100, padding: '2px 10px', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#22c55e' }}>ACTIVE</span>
                            </div>
                            <button style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 20, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}>
                                <Download size={14} /> Download Bank Certificate
                            </button>
                        </motion.div>
                    </div>
                )}

                {tab === 'settings' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Security */}
                        <div style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 20 }}>Security</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div><label style={{ ...lS, marginTop: 0 }}>CURRENT PASSWORD</label><input type="password" placeholder="••••••••" style={iS()} /></div>
                                <div><label style={{ ...lS, marginTop: 0 }}>NEW PASSWORD</label><input type="password" placeholder="••••••••" style={iS()} /></div>
                            </div>
                            <button style={{ marginTop: 16, background: 'none', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--red)', fontWeight: 600 }}>Update Password</button>
                        </div>
                        {/* Notifications */}
                        <div style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 20 }}>Notification Preferences</div>
                            {NOTIFS.map(n => (
                                <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff' }}>{n.label}</span>
                                    <Toggle on={notifs[n.id]} onToggle={() => setNotifs(p => ({ ...p, [n.id]: !p[n.id] }))} />
                                </div>
                            ))}
                        </div>
                        {/* Connected Hospitals */}
                        <div style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 20 }}>Connected Hospitals</div>
                            {CONNECTED_HOSPITALS.map((h, i) => (
                                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < CONNECTED_HOSPITALS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                    <div>
                                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: '#fff' }}>{h.name}</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{h.city} · {h.requests} requests</div>
                                    </div>
                                    <button style={{ background: 'none', border: '1px solid rgba(217,0,37,0.25)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--red)' }}>Block</button>
                                </div>
                            ))}
                        </div>
                        {/* Danger Zone */}
                        <div style={{ background: 'rgba(217,0,37,0.04)', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 20, padding: 28 }}>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 16, color: 'var(--red)', marginBottom: 8 }}>Danger Zone</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>Deactivating your account will suspend all operations and blood supply to connected hospitals.</div>
                            <button style={{ background: 'rgba(217,0,37,0.15)', border: '1px solid rgba(217,0,37,0.4)', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--red)', fontWeight: 600 }}>Deactivate Blood Bank Account</button>
                        </div>
                    </motion.div>
                )}
            </div>
        </BloodBankLayout>
    );
}

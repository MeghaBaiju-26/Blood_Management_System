import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Download } from 'lucide-react';
import DonorLayout from '../../components/donor/DonorLayout';
import { EligibilityBadge } from '../../components/donor/DonorSidebar';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const DISTRICTS = ['Ernakulam', 'Thiruvananthapuram', 'Thrissur', 'Kozhikode', 'Kannur', 'Alappuzha', 'Kottayam', 'Idukki', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Kasaragod', 'Wayanad', 'Kollam'];
const TABS = ['Personal Details', 'Account Settings'];

function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

export default function DonorProfile() {

    const [tab, setTab] = useState(0);
    const [donor, setDonor] = useState(null);
    const [loading, setLoading] = useState(true);

    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch("http://localhost:5000/donors/1")
            .then(res => res.json())
            .then(data => {
                setDonor(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching donor:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <DonorLayout title="My Profile">
                <div style={{ padding: 40, color: "white" }}>Loading profile...</div>
            </DonorLayout>
        );
    }

    if (!donor) {
        return (
            <DonorLayout title="My Profile">
                <div style={{ padding: 40, color: "white" }}>No donor found.</div>
            </DonorLayout>
        );
    }

    const initials = donor.name.split(' ').map(n => n[0]).join('');

    const inputStyle = {
        width: '100%',
        background: '#0A0A12',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: '12px 14px',
        fontSize: 14,
        color: '#fff',
        marginBottom: 16
    };

    const labelStyle = {
        display: 'block',
        fontSize: 9,
        color: 'var(--text3)',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: 8
    };

    return (
        <DonorLayout title="My Profile" page="PROFILE">

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'linear-gradient(135deg,#0F0F17 0%,#1A0A0F 100%)',
                        border: '1px solid rgba(217,0,37,0.2)',
                        borderRadius: 20,
                        padding: 36,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 28,
                    }}
                >
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #D90025, #8B0010)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                        color: '#fff'
                    }}>
                        {initials}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 36, color: '#fff', marginBottom: 8 }}>
                            {donor.name}
                        </div>

                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <span style={{
                                background: 'rgba(217,0,37,0.1)',
                                border: '1px solid rgba(217,0,37,0.3)',
                                borderRadius: 100,
                                padding: '3px 12px',
                                fontSize: 12,
                                color: 'var(--red)'
                            }}>
                                {donor.blood_group}
                            </span>

                            <EligibilityBadge status={donor.status} />
                        </div>

                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 10 }}>
                            ID: {donor.donor_id} · {donor.city}, Kerala
                        </div>
                    </div>

                    <button style={{
                        background: 'none',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10,
                        padding: '10px 18px',
                        cursor: 'pointer',
                        color: 'var(--text2)'
                    }}>
                        <Edit2 size={14} /> Edit Profile
                    </button>
                </motion.div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {TABS.map((t, i) => (
                        <button
                            key={t}
                            onClick={() => setTab(i)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '12px 20px',
                                color: tab === i ? '#fff' : 'var(--text3)',
                                borderBottom: tab === i ? '2px solid var(--red)' : 'none'
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {tab === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div style={{
                                background: '#0F0F17',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 20,
                                padding: 28
                            }}>
                                <label style={labelStyle}>Full Name</label>
                                <input value={donor.name} style={inputStyle} readOnly />

                                <label style={labelStyle}>Age</label>
                                <input value={donor.age} style={inputStyle} readOnly />

                                <label style={labelStyle}>Gender</label>
                                <input value={donor.gender} style={inputStyle} readOnly />

                                <label style={labelStyle}>Blood Group</label>
                                <input value={donor.blood_group} style={inputStyle} readOnly />

                                <label style={labelStyle}>Phone</label>
                                <input value={donor.phone_no} style={inputStyle} readOnly />

                                <label style={labelStyle}>City</label>
                                <input value={donor.city} style={inputStyle} readOnly />

                                <label style={labelStyle}>Last Donation</label>
                                <input value={formatDate(donor.last_donation_date)} style={inputStyle} readOnly />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </DonorLayout>
    );
}
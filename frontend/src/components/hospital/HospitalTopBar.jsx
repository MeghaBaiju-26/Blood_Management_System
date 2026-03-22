import { useEffect, useMemo, useState } from 'react';
import { Bell, ChevronDown, AlertTriangle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { mockBloodRequests } from '../../data/hospitalMockData';
import { useAuth } from '../../auth/AuthContext';
import { apiFetch } from '../../services/http';
import EmergencyRequestModal from './EmergencyRequestModal';

const emergencyCount = mockBloodRequests.filter(r => r.priority === 'Emergency' && r.status === 'Pending').length;

export default function HospitalTopBar({ title, page }) {
    const [showModal, setShowModal] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        let mounted = true;

        if (!user?.entity_id) {
            setDisplayName('');
            return () => { mounted = false; };
        }

        apiFetch(`/hospitals/${user.entity_id}`)
            .then(async (res) => {
                const data = await res.json().catch(() => null);
                if (!mounted || !res.ok || !data) return;

                const hospitalName = typeof data.hospital_name === 'string' ? data.hospital_name.trim() : '';
                if (hospitalName) {
                    setDisplayName(hospitalName);
                }
            })
            .catch(() => {});

        return () => { mounted = false; };
    }, [user?.entity_id]);

    const nameToShow = displayName || user?.email || 'Hospital';
    const firstName = nameToShow.split(' ').filter(Boolean)[0] || 'Hospital';
    const initials = useMemo(() => {
        const parts = nameToShow.split(' ').filter(Boolean);
        if (!parts.length) return 'HS';
        return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
    }, [nameToShow]);

    return (
        <>
            <div style={{
                position: 'fixed', top: 0, left: 240, right: 0, height: 64,
                background: 'rgba(7,7,11,0.92)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 32px', zIndex: 30,
            }}>
                {/* Left */}
                <div>
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff', lineHeight: 1.2 }}>{title}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
                        HEM∆ › HOSPITAL › {(page || title).toUpperCase()}
                    </div>
                </div>

                {/* Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Emergency Button */}
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 7,
                            background: 'var(--red)', border: 'none', cursor: 'pointer',
                            padding: '8px 16px', borderRadius: 8,
                            fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 13, color: '#fff',
                            boxShadow: '0 2px 12px rgba(217,0,37,0.4)', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(217,0,37,0.6)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(217,0,37,0.4)'}
                    >
                        <AlertTriangle size={14} /> Emergency Request
                    </button>

                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} />

                    {/* Bell */}
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 4 }}>
                        <Bell size={18} color="var(--text2)" />
                        {emergencyCount > 0 && (
                            <span style={{
                                position: 'absolute', top: 0, right: 0,
                                width: 16, height: 16, background: 'var(--red)', borderRadius: '50%',
                                fontFamily: 'var(--font-mono)', fontSize: 9, color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                            }}>{emergencyCount}</span>
                        )}
                    </button>

                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} />

                    {/* Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'rgba(217,0,37,0.15)', border: '1px solid rgba(217,0,37,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--red)', letterSpacing: 1,
                        }}>
                            {initials}
                        </div>
                        <span style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: '#fff' }}>
                            {firstName}
                        </span>
                        <ChevronDown size={14} color="var(--text3)" />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showModal && <EmergencyRequestModal onClose={() => setShowModal(false)} />}
            </AnimatePresence>
        </>
    );
}

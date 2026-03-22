import { Bell, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { apiFetch } from '../../services/http';
import { EligibilityBadge } from './DonorSidebar';

export default function DonorTopBar({ title, page }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [donorStatus, setDonorStatus] = useState('active');

    useEffect(() => {
        let mounted = true;

        if (!user?.entity_id) {
            setDisplayName('');
            return () => { mounted = false; };
        }

        apiFetch(`/donors/${user.entity_id}`)
            .then(async (res) => {
                const data = await res.json().catch(() => null);
                if (!mounted || !res.ok || !data) return;

                if (typeof data.name === 'string' && data.name.trim()) {
                    setDisplayName(data.name.trim());
                }
                if (typeof data.status === 'string' && data.status.trim()) {
                    setDonorStatus(data.status.trim().toLowerCase());
                }
            })
            .catch(() => {});

        return () => { mounted = false; };
    }, [user?.entity_id]);

    const nameToShow = displayName || user?.email || 'Donor';
    const firstName = nameToShow.split(' ').filter(Boolean)[0] || 'Donor';
    const initials = useMemo(() => {
        const parts = nameToShow.split(' ').filter(Boolean);
        if (!parts.length) return 'DN';
        const chars = parts.slice(0, 2).map((part) => part[0]).join('');
        return chars.toUpperCase();
    }, [nameToShow]);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 240, right: 0, height: 64,
            background: 'rgba(7,7,11,0.92)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 32px', zIndex: 30,
        }}>
            {/* Left — Title + breadcrumb */}
            <div>
                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff', lineHeight: 1.2 }}>
                    {title}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
                    HEM∆ › DONOR › {(page || title).toUpperCase()}
                </div>
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Bell */}
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 4 }}
                    onClick={() => navigate('/donor/notifications')}>
                    <Bell size={18} color="var(--text2)" />
                    <span style={{
                        position: 'absolute', top: 0, right: 0,
                        width: 16, height: 16, background: 'var(--red)', borderRadius: '50%',
                        fontFamily: 'var(--font-mono)', fontSize: 9, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                    }}>3</span>
                </button>

                {/* Divider */}
                <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} />

                {/* Eligibility */}
                <EligibilityBadge status={donorStatus} />

                {/* Divider */}
                <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} />

                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'radial-gradient(circle, #D90025, #8B0010)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontSize: 13, color: '#fff', letterSpacing: 1,
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
    );
}

import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FadeUp, MonoLabel, HeroHeadline, CTABanner } from '../components/UI';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Users,
    ShieldCheck,
    BarChart3,
    AlertTriangle,
    Network
} from 'lucide-react';

const TABS = [
    { name: 'Inventory', icon: <Box size={16} /> },
    { name: 'Donors', icon: <Users size={16} /> },
    { name: 'Compliance', icon: <ShieldCheck size={16} /> },
    { name: 'Analytics', icon: <BarChart3 size={16} /> },
    { name: 'Emergency', icon: <AlertTriangle size={16} /> },
    { name: 'Integrations', icon: <Network size={16} /> }
];

const bloodTypes = [
    { type: 'A+', units: 1240, pct: 78, status: 'Healthy', color: '#22c55e' },
    { type: 'B+', units: 890, pct: 65, status: 'Healthy', color: '#22c55e' },
    { type: 'O+', units: 1100, pct: 75, status: 'Healthy', color: '#22c55e' },
    { type: 'O-', units: 340, pct: 40, status: 'Low ⚠', color: '#f59e0b' },
    { type: 'AB+', units: 420, pct: 50, status: 'Moderate', color: '#f59e0b' },
    { type: 'AB-', units: 87, pct: 18, status: 'Critical 🔴', color: '#D90025' },
];

const integrations = [
    { name: 'HL7/FHIR API', icon: '🔗', status: 'Available', desc: 'Hospital standard integration for seamless data exchange.' },
    { name: 'WhatsApp Business', icon: '💬', status: 'Available', desc: 'Donor recall campaigns and emergency notifications.' },
    { name: 'Government NHP', icon: '🏛️', status: 'Available', desc: 'National Health Portal direct integration.' },
    { name: 'RFID/Barcode', icon: '📦', status: 'Available', desc: 'Unit-level tracking across all facilities.' },
    { name: 'Lab Management', icon: '🧪', status: 'Available', desc: 'Test result sync and cross-match automation.' },
    { name: 'EMR Systems', icon: '🖥️', status: 'Coming Soon', desc: 'Patient record integration for transfusion history.' },
];

const aiCards = [
    { icon: '🧠', title: 'Demand Forecasting', desc: 'AI predicts shortages 2–3 weeks in advance based on historical patterns, seasonal trends, and district-level demand.' },
    { icon: '🔀', title: 'Auto-routing', desc: 'When a facility has surplus expiring stock, AI automatically routes it to the nearest facility with that shortage.' },
    { icon: '🛡️', title: 'Anomaly Detection', desc: 'Real-time detection of unusual patterns — sudden spikes, temperature deviations, or compliance gaps.' },
];

const emergencySteps = [
    { num: '01', icon: '🔴', title: 'Alert Triggered', desc: 'Hospital submits emergency request' },
    { num: '02', icon: '🤖', title: 'AI Matches Units', desc: 'Cross-references 6 compatibility parameters' },
    { num: '03', icon: '📡', title: 'Facility Notified', desc: 'Nearest compatible blood bank alerted' },
    { num: '04', icon: '🚚', title: 'Dispatch Confirmed', desc: 'GPS-tracked courier assigned instantly' },
];

const inventoryFeatures = [
    '◈ Real-time unit location across all facilities',
    '◈ Automated temperature deviation alerts',
    '◈ Smart expiry prediction with 7/3/1 day alerts',
    '◈ Blood type stockout prevention',
    '◈ RFID and QR code unit tracking',
    '◈ Multi-location storage management',
];

const donorFeatures = [
    '◈ Complete donor lifecycle management',
    '◈ Automated eligibility tracking & cooling periods',
    '◈ SMS & WhatsApp donor recall campaigns',
    '◈ Multilingual support (English + Malayalam)',
    '◈ Health screening & deferral records',
    '◈ 12,000+ donor network across Kerala',
];

const complianceFeatures = [
    '◈ Auto-generated NACO monthly reports',
    '◈ Kerala Health Dept. quarterly submissions',
    '◈ Digital audit trail for every unit',
    '◈ FDA & WHO guidelines checklist',
    '◈ Blood bank license renewal packages',
    '◈ Real-time compliance health score',
];

const complianceChecks = [
    { ok: true, text: 'NACO Report — Submitted Jan 2025' },
    { ok: true, text: 'Donor Testing Records — Complete' },
    { ok: true, text: 'Storage Temperature Logs — Within Range' },
    { ok: false, text: 'Staff Training Certificates — 2 Expiring' },
    { ok: true, text: 'Cross-match Records — Up to Date' },
];

// Contextual Unsplash images matching the dark medical theme
const TAB_IMAGES = {
    Inventory: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80&fit=crop',
    Donors: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1200&q=80&fit=crop',
    Compliance: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80&fit=crop',
    Analytics: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&fit=crop',
    Emergency: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&q=80&fit=crop',
    Integrations: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80&fit=crop',
};

function Feat({ children }) {
    return (
        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 15, color: 'var(--text2)', marginBottom: 10 }}>
            {children}
        </div>
    );
}

// Reusable atmospheric image panel
function TabImage({ src, alt, height = 280 }) {
    return (
        <FadeUp delay={0.2}>
            <div style={{
                position: 'relative',
                borderRadius: 20,
                overflow: 'hidden',
                height,
                width: '100%',
                border: '1px solid rgba(217,0,37,0.15)',
            }}>
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        filter: 'grayscale(25%) brightness(0.5)',
                    }}
                />
                {/* Red-tinted gradient overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(217,0,37,0.2) 0%, rgba(7,7,11,0.6) 70%)',
                }} />
                {/* Bottom fade into page bg */}
                <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    height: '55%',
                    background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)',
                }} />
                {/* CRT scan-line texture */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)',
                    pointerEvents: 'none',
                }} />
            </div>
        </FadeUp>
    );
}

function TabInventory() {
    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div className="responsive-grid">
                <FadeUp>
                    <MonoLabel>01 · INVENTORY</MonoLabel>
                    <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 'clamp(32px,4.5vw,52px)', marginBottom: 20 }}>
                        Know Every Drop. Always.
                    </h2>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 16, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 24 }}>
                        Real-time tracking of every blood unit from collection to transfusion. Temperature monitoring, location tracking, and automated expiry management.
                    </p>
                    {inventoryFeatures.map(f => <Feat key={f}>{f}</Feat>)}
                    <a href="#" style={{ display: 'inline-block', marginTop: 8, color: 'var(--red)', fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15 }}>
                        Explore Inventory →
                    </a>
                </FadeUp>
                <FadeUp delay={0.15}>
                    <div className="hema-card" style={{ padding: 28, borderRadius: 20 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
                            LIVE INVENTORY · KIMS Trivandrum
                        </div>
                        {bloodTypes.map(({ type, units, pct, status, color }) => (
                            <div key={type} style={{ display: 'grid', gridTemplateColumns: '48px 64px 1fr 90px', gap: '0 12px', marginBottom: 14, alignItems: 'center' }}>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700 }}>{type}</div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}>{units.toLocaleString()}</div>
                                <div style={{ background: 'var(--bg)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }} />
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase' }}>
                                    {color === '#D90025' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'pulse 1s infinite' }} />}
                                    {status}
                                </div>
                            </div>
                        ))}
                    </div>
                </FadeUp>
            </div>
            {/* Wide atmospheric image below */}
            <div style={{ marginTop: 48 }}>
                <TabImage src={TAB_IMAGES.Inventory} alt="Blood sample tubes in laboratory" height={260} />
            </div>
        </div>
    );
}

function TabDonors() {
    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div className="responsive-grid">
                <FadeUp>
                    <div className="hema-card" style={{ padding: 32, borderRadius: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 22 }}>AJ</div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18 }}>Arjun Jayakumar</div>
                                <div style={{ display: 'inline-block', background: 'rgba(217,0,37,0.15)', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 6, padding: '2px 10px', fontFamily: 'var(--font-head)', fontSize: 18, color: 'var(--red)', marginTop: 4 }}>A+</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
                            {[['23', 'Donations'], ['8 Yrs', 'Active'], ['A+', 'Blood Type']].map(([v, l]) => (
                                <div key={l} style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 20 }}>{v}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase' }}>{l}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', marginBottom: 16 }}>Next Eligible: March 15, 2025</div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <button className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>Send Recall</button>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, color: '#22c55e' }}>98% Eligibility</div>
                        </div>
                    </div>
                </FadeUp>
                <FadeUp delay={0.15}>
                    <MonoLabel>02 · DONOR MANAGEMENT</MonoLabel>
                    <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 'clamp(32px,4.5vw,52px)', marginBottom: 20 }}>
                        Every Donor. Perfectly Managed.
                    </h2>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 16, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 24 }}>
                        Build a loyal donor community with intelligent recall systems matched to your hospital's exact needs.
                    </p>
                    {donorFeatures.map(f => <Feat key={f}>{f}</Feat>)}
                </FadeUp>
            </div>
            <div style={{ marginTop: 48 }}>
                <TabImage src={TAB_IMAGES.Donors} alt="Blood donation" height={260} />
            </div>
        </div>
    );
}

function TabCompliance() {
    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div className="responsive-grid">
                <FadeUp>
                    <MonoLabel>03 · COMPLIANCE</MonoLabel>
                    <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 'clamp(32px,4.5vw,52px)', marginBottom: 20 }}>
                        Zero Paperwork. Full Compliance.
                    </h2>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 16, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 24 }}>
                        Automated reporting and audit trails keep you compliant without the manual effort.
                    </p>
                    {complianceFeatures.map(f => <Feat key={f}>{f}</Feat>)}
                </FadeUp>
                <FadeUp delay={0.15}>
                    <div className="hema-card" style={{ padding: 32, borderRadius: 20 }}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <svg viewBox="0 0 120 120" width="130" height="130">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="8" />
                                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--red)" strokeWidth="8"
                                    strokeDasharray={`${2 * Math.PI * 50 * 0.94} ${2 * Math.PI * 50 * 0.06}`}
                                    strokeDashoffset={2 * Math.PI * 50 * 0.25} strokeLinecap="round" />
                                <text x="60" y="56" textAnchor="middle" fill="#fff" fontSize="22" fontFamily="Syne" fontWeight="800">94%</text>
                                <text x="60" y="71" textAnchor="middle" fill="var(--text2)" fontSize="9" fontFamily="Space Mono">COMPLIANCE</text>
                            </svg>
                        </div>
                        {complianceChecks.map(({ ok, text }) => (
                            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <span>{ok ? '✅' : '⚠️'}</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: ok ? 'var(--text2)' : '#f59e0b' }}>{text}</span>
                            </div>
                        ))}
                    </div>
                </FadeUp>
            </div>
            <div style={{ marginTop: 48 }}>
                <TabImage src={TAB_IMAGES.Compliance} alt="Compliance documentation" height={240} />
            </div>
        </div>
    );
}

function TabAnalytics() {
    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Image banner at top for analytics */}
            <div style={{ marginBottom: 40 }}>
                <TabImage src={TAB_IMAGES.Analytics} alt="Analytics data dashboard" height={280} />
            </div>
            <div className="features-grid" style={{ marginBottom: 40 }}>
                {['Inventory Trend — Last 30 Days', 'District-wise Demand'].map((title, i) => (
                    <FadeUp key={title} delay={i * 0.1}>
                        <div className="hema-card" style={{ padding: 28, height: 220 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 16 }}>{title}</div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
                                {[65, 82, 74, 90, 68, 95, 78, 85, 72, 88].map((h, j) => (
                                    <div key={j} style={{ flex: 1, background: `rgba(217,0,37,${0.25 + j * 0.05})`, borderRadius: '3px 3px 0 0', height: `${h}%`, minWidth: 8 }} />
                                ))}
                            </div>
                        </div>
                    </FadeUp>
                ))}
            </div>
            <div className="three-col">
                {aiCards.map(({ icon, title, desc }, i) => (
                    <FadeUp key={title} delay={i * 0.12}>
                        <div className="hema-card" style={{ padding: '28px 24px' }}>
                            <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{title}</div>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{desc}</p>
                        </div>
                    </FadeUp>
                ))}
            </div>
        </div>
    );
}

function TabEmergency() {
    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Split: giant stat left, image right */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 48,
                marginBottom: 64,
                alignItems: 'center',
            }}>
                <FadeUp>
                    <h2 style={{
                        fontFamily: 'var(--font-head)',
                        fontSize: 'clamp(64px,10vw,130px)',
                        color: 'var(--red)',
                        lineHeight: 0.9,
                        letterSpacing: '0.02em',
                        marginBottom: 20,
                    }}>
                        {'< 8\nMIN'}
                    </h2>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 17, color: 'var(--text2)', maxWidth: 380, lineHeight: 1.7 }}>
                        Average emergency blood request response time across Kerala's HEM∆ network
                    </p>
                </FadeUp>
                <TabImage src={TAB_IMAGES.Emergency} alt="Emergency medical dispatch" height={320} />
            </div>
            <div className="four-col">
                {emergencySteps.map(({ num, icon, title, desc }, i) => (
                    <FadeUp key={num} delay={i * 0.1}>
                        <div className="hema-card" style={{ padding: '24px 20px', borderTop: '3px solid var(--red)' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', marginBottom: 10 }}>{num}</div>
                            <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{title}</div>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}>{desc}</p>
                        </div>
                    </FadeUp>
                ))}
            </div>
        </div>
    );
}

function TabIntegrations() {
    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Header: text left, image right */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 48,
                marginBottom: 60,
                alignItems: 'center',
            }}>
                <FadeUp>
                    <MonoLabel>06 · INTEGRATIONS</MonoLabel>
                    <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 'clamp(32px,4.5vw,48px)', marginBottom: 16 }}>
                        Connects to Your Existing Systems
                    </h2>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 16, color: 'var(--text2)', lineHeight: 1.8 }}>
                        HEM∆ plugs into the software stack hospitals already use — no rip-and-replace. From FHIR APIs to on-premise RFID hardware.
                    </p>
                </FadeUp>
                <TabImage src={TAB_IMAGES.Integrations} alt="Server network infrastructure" height={260} />
            </div>
            <div className="three-col" style={{ marginBottom: 40 }}>
                {integrations.map(({ name, icon, status, desc }, i) => (
                    <FadeUp key={name} delay={i * 0.08}>
                        <div className="hema-card" style={{ padding: '28px 24px' }}>
                            <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 16 }}>{name}</div>
                                <span style={{
                                    fontFamily: 'var(--font-mono)', fontSize: 9, padding: '3px 8px', borderRadius: 6,
                                    background: status === 'Available' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                                    color: status === 'Available' ? '#22c55e' : '#f59e0b',
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                }}>{status}</span>
                            </div>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>{desc}</p>
                            <a href="#" style={{ color: 'var(--red)', fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 13 }}>Connect →</a>
                        </div>
                    </FadeUp>
                ))}
            </div>
        </div>
    );
}

const tabContent = [TabInventory, TabDonors, TabCompliance, TabAnalytics, TabEmergency, TabIntegrations];

function getDirection(next, prev) {
    return next > prev ? 1 : -1;
}

const contentVariants = {
    initial: (dir) => ({
        opacity: 0,
        x: dir * 48,
        scale: 0.97,
        filter: 'blur(4px)',
    }),
    animate: {
        opacity: 1,
        x: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
    exit: (dir) => ({
        opacity: 0,
        x: dir * -32,
        scale: 0.97,
        filter: 'blur(4px)',
        transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
    }),
};

export default function FeaturesPage() {
    const [active, setActive] = useState(0);
    const [direction, setDirection] = useState(1);
    const tabsScrollRef = useRef(null);
    const tabRefs = useRef([]);
    const ActiveTab = tabContent[active];

    // Auto-scroll active tab button into view on narrow screens
    useEffect(() => {
        const container = tabsScrollRef.current;
        const btn = tabRefs.current[active];
        if (!container || !btn) return;
        const cRect = container.getBoundingClientRect();
        const bRect = btn.getBoundingClientRect();
        const offset = bRect.left - cRect.left - cRect.width / 2 + bRect.width / 2;
        container.scrollBy({ left: offset, behavior: 'smooth' });
    }, [active]);

    function handleTabClick(i) {
        setDirection(getDirection(i, active));
        setActive(i);
    }

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Navbar />
            <div className="noise-overlay" />

            {/* HERO */}
            <section className="grid-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '140px 5% 100px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} className="red-glow-r" />
                <div style={{ maxWidth: 880 }}>
                    <FadeUp><MonoLabel>PLATFORM CAPABILITIES</MonoLabel></FadeUp>
                    <FadeUp delay={0.1}>
                        <HeroHeadline size="clamp(64px,9vw,100px)" lines={[
                            { text: 'EVERY FEATURE.', variant: 'solid' },
                            { text: 'PURPOSE-BUILT', variant: 'outline' },
                            { text: 'FOR BLOOD.', variant: 'red' },
                        ]} />
                    </FadeUp>
                    <FadeUp delay={0.2}>
                        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 17, color: 'var(--text2)', maxWidth: 500, lineHeight: 1.75, marginTop: 28 }}>
                            Not a generic health SaaS with blood bank bolted on. HEM∆ was designed from the ground up for blood — every screen, every alert, every algorithm.
                        </p>
                    </FadeUp>
                </div>
            </section>

            {/* ─── STICKY TABS — centered ─── */}
            <div style={{
                position: 'sticky',
                top: 62,
                zIndex: 400,
                background: 'rgba(7,7,11,0.92)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderBottom: '1px solid var(--border)',
            }}>
                {/* Progress bar */}
                <motion.div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: 2,
                        background: 'var(--red)',
                        boxShadow: '0 0 14px rgba(217,0,37,0.8)',
                    }}
                    animate={{ width: `${((active + 1) / TABS.length) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 36 }}
                />

                {/* Tab row — justify-content: center centers tabs on desktop */}
                <div
                    ref={tabsScrollRef}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',   // ← centered
                        alignItems: 'center',
                        gap: 4,
                        padding: '10px 5%',
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                        flexWrap: 'nowrap',
                    }}
                >
                    {TABS.map((tab, i) => {
                        const isActive = active === i;
                        return (
                            <motion.button
                                key={tab.name}
                                ref={el => tabRefs.current[i] = el}
                                onClick={() => handleTabClick(i)}
                                whileHover={{ scale: isActive ? 1 : 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                                style={{
                                    position: 'relative',
                                    fontFamily: 'var(--font-sub)',
                                    fontWeight: 700,
                                    fontSize: 13,
                                    textTransform: 'uppercase',
                                    padding: '10px 22px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: isActive ? '#fff' : 'var(--text2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    whiteSpace: 'nowrap',
                                    borderRadius: 100,
                                    letterSpacing: '0.04em',
                                    outline: 'none',
                                    flexShrink: 0,
                                }}
                            >
                                {/* Sliding pill */}
                                {isActive && (
                                    <motion.div
                                        layoutId="tab-pill"
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'var(--red)',
                                            borderRadius: 100,
                                            zIndex: -1,
                                        }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.9 }}
                                    />
                                )}

                                {/* Hover ghost ring */}
                                {!isActive && (
                                    <motion.div
                                        style={{
                                            position: 'absolute', inset: 0,
                                            borderRadius: 100,
                                            border: '1px solid transparent',
                                            zIndex: -1,
                                        }}
                                        whileHover={{
                                            borderColor: 'rgba(217,0,37,0.35)',
                                            background: 'rgba(217,0,37,0.07)',
                                        }}
                                        transition={{ duration: 0.18 }}
                                    />
                                )}

                                {/* Icon bounce on activate */}
                                <motion.span
                                    animate={{
                                        rotate: isActive ? [0, -12, 8, 0] : 0,
                                        scale: isActive ? [1, 1.3, 1] : 1,
                                    }}
                                    transition={{ duration: 0.42, ease: 'easeOut' }}
                                    style={{ display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.55 }}
                                >
                                    {tab.icon}
                                </motion.span>

                                {/* Label slide-up */}
                                <motion.span
                                    animate={{ y: isActive ? [4, 0] : 0, opacity: isActive ? 1 : 0.7 }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    {tab.name}
                                </motion.span>

                                {/* Active dot */}
                                {isActive && (
                                    <motion.span
                                        layoutId="tab-dot"
                                        style={{
                                            position: 'absolute',
                                            bottom: 3,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: 3,
                                            height: 3,
                                            borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.8)',
                                        }}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.15, type: 'spring', stiffness: 500, damping: 25 }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* ─── TAB CONTENT ─── */}
            <section style={{
                padding: 'var(--section-pad) 5%',
                background: 'var(--bg)',
                minHeight: 600,
                overflow: 'hidden',
            }}>
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={active}
                        custom={direction}
                        variants={contentVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        <ActiveTab />
                    </motion.div>
                </AnimatePresence>
            </section>

            <CTABanner
                headline="SEE IT ALL IN ACTION"
                subtext="Book a 30-minute live demo with our Kerala team"
                btn1="Book Demo"
                btn2="View Pricing"
            />
            <Footer />
        </div>
    );
}
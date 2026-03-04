import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, Building2 } from 'lucide-react';
import DonorLayout from '../../components/donor/DonorLayout';

function fmt(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function ChartTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#161622', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>
                {payload[0].value} ml
            </div>
        </div>
    );
}

export default function DonorDonations() {

    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:5000/donations/donor/1")
            .then(res => res.json())
            .then(data => {
                setDonations(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching donations:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <DonorLayout title="My Donations">
                <div style={{ padding: 40 }}>Loading donations...</div>
            </DonorLayout>
        );
    }

    const totalMl = donations.reduce((s, d) => s + d.quantity, 0);

    // Now count unique bank names instead of bank_id
    const banks = new Set(donations.map(d => d.bank_name)).size;

    const areaData = donations.map(d => ({
        date: fmt(d.donation_date),
        ml: d.quantity,
    })).reverse();

    return (
        <DonorLayout title="My Donations" page="DONATIONS">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                    {[
                        { icon: Droplets, label: 'TOTAL DONATIONS', val: donations.length },
                        { icon: Droplets, label: 'TOTAL VOLUME', val: `${totalMl} ml` },
                        { icon: Building2, label: 'BANKS VISITED', val: banks },
                    ].map(({ icon: Icon, label, val }, i) => (
                        <motion.div key={label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.08 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(217,0,37,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={18} color="var(--red)" />
                                </div>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                    {label}
                                </span>
                            </div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: '#fff', lineHeight: 1 }}>
                                {val}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>

                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 20 }}>
                        All Donations
                    </div>

                    {donations.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text3)' }}>
                            No donations found.
                        </div>
                    ) : donations.map((d, i) => (
                        <div key={d.donation_id} style={{
                            display: 'grid',
                            gridTemplateColumns: '40px 1fr 2fr 100px',
                            gap: 12,
                            padding: '16px 0',
                            borderBottom: i < donations.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                        }}>
                            <span style={{ color: 'var(--text3)' }}>0{i + 1}</span>
                            <div>{fmt(d.donation_date)}</div>

                            {/* ✅ Now shows real bank name */}
                            <div>{d.bank_name}, {d.city}</div>

                            <div>{d.quantity} ml</div>
                        </div>
                    ))}
                </motion.div>

                {/* Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>

                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 20 }}>
                        Donation Volume Trend
                    </div>

                    <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={areaData}>
                            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="date" />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="ml" stroke="#D90025" fill="rgba(217,0,37,0.2)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

            </div>
        </DonorLayout>
    );
}
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Clock, Building2, Users, X, Check } from 'lucide-react';
import DonorLayout from '../../components/donor/DonorLayout';
import { mockBloodBanks, mockCamps } from '../../data/mockData';

function fmt(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

/* ===========================
   BOOKING MODAL
=========================== */

function BookingModal({ bank, onClose, onConfirm }) {
    const [date, setDate] = useState(null);
    const [time, setTime] = useState(null);
    const [done, setDone] = useState(false);

    const today = new Date();
    const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        return d;
    });

    const handleConfirm = () => {
        if (date && time) {
            onConfirm({
                bank_name: bank.bank_name,
                date: date.toISOString(),
                time
            });
            setDone(true);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(6px)',
                zIndex: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                    background: '#0F0F17',
                    border: '1px solid rgba(217,0,37,0.2)',
                    borderRadius: 20,
                    padding: 40,
                    width: '100%',
                    maxWidth: 480,
                    position: 'relative'
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <X size={20} color="var(--text3)" />
                </button>

                {done ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: '50%',
                                background: 'rgba(34,197,94,0.15)',
                                border: '1px solid rgba(34,197,94,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px'
                            }}
                        >
                            <Check size={32} color="#22c55e" />
                        </div>

                        <div style={{
                            fontFamily: 'var(--font-sub)',
                            fontWeight: 800,
                            fontSize: 24,
                            color: '#fff',
                            marginBottom: 8
                        }}>
                            Appointment Booked!
                        </div>

                        <div style={{ color: 'var(--text2)', marginBottom: 20 }}>
                            {bank?.bank_name}
                        </div>

                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: 10,
                                padding: '10px 24px',
                                cursor: 'pointer',
                                color: 'var(--text2)'
                            }}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{
                            fontFamily: 'var(--font-sub)',
                            fontWeight: 700,
                            fontSize: 24,
                            color: '#fff',
                            marginBottom: 20
                        }}>
                            Book Donation Slot
                        </div>

                        {/* DATE */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
                                SELECT DATE
                            </div>

                            <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                                {days.map((d, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setDate(d)}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: 8,
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            background: date?.toDateString() === d.toDateString()
                                                ? 'var(--red)'
                                                : 'rgba(255,255,255,0.04)',
                                            color: '#fff',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {d.getDate()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* TIME */}
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
                                SELECT TIME
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {TIME_SLOTS.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTime(t)}
                                        style={{
                                            padding: '8px 14px',
                                            borderRadius: 8,
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            background: time === t ? 'var(--red)' : 'rgba(255,255,255,0.04)',
                                            color: '#fff',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleConfirm}
                            disabled={!date || !time}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: 10,
                                border: 'none',
                                background: date && time ? 'var(--red)' : 'rgba(255,255,255,0.05)',
                                color: '#fff',
                                cursor: date && time ? 'pointer' : 'not-allowed'
                            }}
                        >
                            Confirm Booking
                        </button>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

/* ===========================
   MAIN COMPONENT
=========================== */

export default function DonorSchedule() {
    const [bookingBank, setBookingBank] = useState(null);
    const [appointments, setAppointments] = useState([]);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("appointments");
        if (saved) setAppointments(JSON.parse(saved));
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem("appointments", JSON.stringify(appointments));
    }, [appointments]);

    return (
        <DonorLayout title="Schedule Donation" page="SCHEDULE">

            <AnimatePresence>
                {bookingBank && (
                    <BookingModal
                        bank={bookingBank}
                        onClose={() => setBookingBank(null)}
                        onConfirm={(appointment) =>
                            setAppointments(prev => [...prev, appointment])
                        }
                    />
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* UPCOMING APPOINTMENT */}
                {appointments.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: 'rgba(217,0,37,0.06)',
                            border: '1px solid rgba(217,0,37,0.2)',
                            borderRadius: 16,
                            padding: 20
                        }}
                    >
                        <div style={{ color: 'var(--red)', marginBottom: 8 }}>
                            Upcoming Appointment
                        </div>

                        {appointments.map((a, i) => (
                            <div key={i} style={{ color: 'var(--text2)' }}>
                                {a.bank_name} · {new Date(a.date).toLocaleDateString('en-IN')} · {a.time}
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* BANK LIST */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {mockBloodBanks.map(bank => (
                        <div
                            key={bank.bank_id}
                            style={{
                                background: '#0F0F17',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 16,
                                padding: 24
                            }}
                        >
                            <div style={{ color: '#fff', marginBottom: 10 }}>
                                {bank.bank_name}
                            </div>

                            <button
                                onClick={() => bank.open && setBookingBank(bank)}
                                disabled={!bank.open}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: bank.open ? 'var(--red)' : 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    cursor: bank.open ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {bank.open ? 'Book Appointment' : 'Closed'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </DonorLayout>
    );
}
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Phone } from 'lucide-react';
import DonorLayout from '../../components/donor/DonorLayout';

const KERALA_DISTRICTS = [
  'All Districts',
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Ernakulam',
  'Thrissur',
  'Palakkad',
  'Malappuram',
  'Kozhikode',
  'Wayanad',
  'Kannur',
  'Kasaragod'
];

export default function DonorFindBank() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('All Districts');

  useEffect(() => {
    fetch("http://localhost:5000/blood-bank")
      .then(res => res.json())
      .then(data => {
        setBanks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching blood banks:", err);
        setLoading(false);
      });
  }, []);

  const filtered = banks.filter(b => {
    const matchSearch =
      b.bank_name.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase());

    const matchDistrict =
      district === 'All Districts' || b.city === district;

    return matchSearch && matchDistrict;
  });

  return (
    <DonorLayout title="Find Blood Bank" page="FIND-BANK">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'gray' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search blood banks..."
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                borderRadius: 8,
                border: '1px solid #333',
                background: '#111',
                color: '#fff'
              }}
            />
          </div>

          <select
            value={district}
            onChange={e => setDistrict(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: 8,
              background: '#111',
              color: '#fff',
              border: '1px solid #333'
            }}
          >
            {KERALA_DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ color: '#aaa' }}>Loading blood banks...</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: '#aaa' }}>No blood banks found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {filtered.map((bank, i) => (
              <motion.div
                key={bank.bank_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: '#0F0F17',
                  padding: 20,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 10 }}>
                  {bank.bank_name}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: '#aaa' }}>
                  <MapPin size={14} /> {bank.city}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#aaa' }}>
                  <Phone size={14} /> {bank.contact_no}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DonorLayout>
  );
}
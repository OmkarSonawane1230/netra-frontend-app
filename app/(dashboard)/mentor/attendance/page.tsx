"use client"
import { useState, useEffect } from 'react';
import { getAttendance } from '@/services/api';
import LiveStream from '@/app/components/ui/LiveStream';
import { useAuth } from '@/app/context/AuthContext';
import attendanceStyles from '@/app/styles/views/AttendanceManagement.module.css';
import { Loader2 } from 'lucide-react';

export default function MentorAttendancePage() {
  const { user, isVerifying, currentLecture } = useAuth();
  const [snapshot, setSnapshot] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshot = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAttendance();
      setSnapshot(data || {});
    } catch (err: any) {
      setError(err?.message || 'Failed to load live attendance');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSnapshot(); }, []);

  return (
    <div className={attendanceStyles.attendanceManagement}>
      <div className={attendanceStyles.header}><h2 className={attendanceStyles.title}>Live Attendance Snapshot</h2></div>
      {loading && <div className={attendanceStyles.centered}><Loader2 className="animate-spin" size={28} /> <span>Loading...</span></div>}
      {error && <p className={attendanceStyles.error}>{error}</p>}
      {!loading && !error && (
        <div>
          {/* If verification is active show LiveStream like the old frontend. Otherwise show snapshot */}
          {isVerifying && currentLecture ? (
            <LiveStream />
          ) : (
            <div>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(snapshot, null, 2)}</pre>
              <button onClick={fetchSnapshot} className={attendanceStyles.iconButton} style={{ marginTop: 12 }}>Refresh</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
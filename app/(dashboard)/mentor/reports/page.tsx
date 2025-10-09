"use client"
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getMyAttendanceRecords, getAbsentRecords, AttendanceRecord } from '@/services/api';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import styles from '@/app/styles/views/ReportsModule.module.css';
import attendanceStyles from '@/app/styles/views/AttendanceManagement.module.css';

// --- Attendance Report Component for Mentor (teacher-specific) ---
const MentorAttendanceReport = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  // groupedRecords: year -> sessionKey -> { sessionInfo, records: AttendanceRecord[] }
  const [groupedRecords, setGroupedRecords] = useState<{ [year: string]: { [sessionKey: string]: { sessionInfo: any; records: AttendanceRecord[] } } }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<{ [year: string]: boolean }>({});
  const [sessionCollapsed, setSessionCollapsed] = useState<{ [sessionKey: string]: boolean }>({});
  const [sessionAbsent, setSessionAbsent] = useState<{ [sessionKey: string]: any[] | null }>({});
  const [sessionLoading, setSessionLoading] = useState<{ [sessionKey: string]: boolean }>({});
  const [sessionError, setSessionError] = useState<{ [sessionKey: string]: string | null }>({});
  const [selectedDay, setSelectedDay] = useState<string>('');

  useEffect(() => {
    const initialCollapsed: { [year: string]: boolean } = {};
    Object.keys(groupedRecords).forEach(year => { initialCollapsed[year] = true; });
    setCollapsedGroups(initialCollapsed);
  }, [groupedRecords]);

  const toggleGroup = (year: string) => setCollapsedGroups(prev => ({ ...prev, [year]: !prev[year] }));

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch only the records available to this teacher (backend will filter by current_user)
      // If a day is selected, normalize it to ISO (YYYY-MM-DD) before passing to the API
      const normalizeToISO = (input: string) => {
        if (!input) return null;
        // If already in ISO format (yyyy-mm-dd), return as-is
        if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
        // Try Date parsing (covers many browser-localized formats)
        const parsed = new Date(input);
        if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0,10);
        // Try slash-separated formats (dd/mm/yyyy or mm/dd/yyyy)
        if (input.includes('/')) {
          const parts = input.split('/').map(p => p.trim());
          if (parts.length === 3) {
            // If first part has 4 digits assume yyyy/mm/dd
            if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`;
            // Otherwise assume dd/mm/yyyy -> convert to yyyy-mm-dd
            return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
          }
        }
        // Fallback: return original input (backend will likely not match)
        return input;
      };

      const isoDay = selectedDay ? normalizeToISO(selectedDay) : null;
      const data = await getMyAttendanceRecords(isoDay || null);
      setRecords(data || []);
      // Group by year, then by lecture session (date+subject+time_slot+student_class)
      const groups = (data || []).reduce((acc: any, record: AttendanceRecord) => {
        const year = new Date(record.date).getFullYear().toString();
        if (!acc[year]) acc[year] = {};
        const sessionKey = `${record.date}||${record.subject}||${record.time_slot}||${record.student_class || ''}`;
        if (!acc[year][sessionKey]) {
          acc[year][sessionKey] = {
            sessionInfo: { date: record.date, subject: record.subject, time_slot: record.time_slot, student_class: record.student_class },
            records: [] as AttendanceRecord[]
          };
        }
        acc[year][sessionKey].records.push(record);
        return acc;
      }, {} as { [year: string]: { [sessionKey: string]: { sessionInfo: any; records: AttendanceRecord[] } } });
      setGroupedRecords(groups);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch mentor records.');
    } finally {
      setLoading(false);
    }
  }, [selectedDay]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  return (
    <div className={attendanceStyles.attendanceManagement}>
      <div className={attendanceStyles.header}>
        <h2 className={attendanceStyles.title}>My Attendance Reports</h2>
        <div className={attendanceStyles.filters} style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label htmlFor="day-selector">Day:</label>
            <input id="day-selector" type="date" value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className={attendanceStyles.filterSelect} />
          </div>
        </div>
      </div>

      {loading && <div className={attendanceStyles.centered}><Loader2 className="animate-spin" size={32} /> <p>Loading records...</p></div>}
      {error && <p className={attendanceStyles.error}>Error: {error}</p>}
      {!loading && !error && Object.keys(groupedRecords).length === 0 && <p className={attendanceStyles.noRecords}>No attendance records found.</p>}

      {Object.entries(groupedRecords).map(([year, sessions]) => {
        const collapsed = collapsedGroups[year];
        // count total records in this year
        const totalCount = Object.values(sessions).reduce((s: number, sess: any) => s + (sess.records?.length || 0), 0);
        return (
          <div key={year} className={attendanceStyles.tableContainer}>
            <div className={attendanceStyles.statsCards} style={{ marginBottom: 0 }}>
              <div className={attendanceStyles.statCard} style={{ flex: 1, minWidth: 0, margin: 0, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className={attendanceStyles.statContent}>
                  <div className={attendanceStyles.statLabel} style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Year: {year}</div>
                  <div style={{ fontSize: '13px', color: 'hsl(220, 15%, 45%)' }}><span><strong>Total Records:</strong> {totalCount}</span></div>
                </div>
                <button className={attendanceStyles.iconButton} style={{ marginLeft: 'auto' }} onClick={() => toggleGroup(year)} aria-label={collapsed ? 'Expand table' : 'Collapse table'}>
                  {collapsed ? <ChevronRight size={22} /> : <ChevronDown size={22} />}
                </button>
              </div>
            </div>
            {!collapsed && (
              <div>
                {Object.entries(sessions).map(([sessionKey, sessionObj]) => {
                  const { sessionInfo, records: sessionRecords } = sessionObj;
                  const sessCollapsed = sessionCollapsed[sessionKey] ?? true;
                  const presentCount = sessionRecords.length;
                  const cls = sessionInfo.student_class || '-';
                  const date = sessionInfo.date;
                  const subject = sessionInfo.subject;
                  const time_slot = sessionInfo.time_slot;

                  const toggleSession = () => setSessionCollapsed(prev => ({ ...prev, [sessionKey]: !sessCollapsed }));

                  const loadAbsentees = async () => {
                    // If already loaded, refresh
                    setSessionLoading(prev => ({ ...prev, [sessionKey]: true }));
                    setSessionError(prev => ({ ...prev, [sessionKey]: null }));
                    try {
                      if (!cls || cls === '-') throw new Error('Session has no student_class info to compute absentees');
                      const abs = await getAbsentRecords(date, subject, time_slot, cls);
                      setSessionAbsent(prev => ({ ...prev, [sessionKey]: abs || [] }));
                    } catch (e: any) {
                      setSessionError(prev => ({ ...prev, [sessionKey]: e?.message || 'Failed to load absentees' }));
                    } finally {
                      setSessionLoading(prev => ({ ...prev, [sessionKey]: false }));
                    }
                  };

                  return (
                    <div key={sessionKey} style={{ marginBottom: 16, border: '1px solid var(--muted)', borderRadius: 8, padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{subject} — {date} — {time_slot}</div>
                          <div style={{ fontSize: 13, color: 'hsl(220, 15%, 45%)' }}>Class: {cls} • Present: {presentCount}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button className={attendanceStyles.iconButton} onClick={toggleSession} aria-label={sessCollapsed ? 'Expand session' : 'Collapse session'}>
                            {sessCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                          </button>
                          <button className={attendanceStyles.iconButton} onClick={loadAbsentees} disabled={sessionLoading[sessionKey]}>
                            {sessionLoading[sessionKey] ? 'Loading Absentees...' : 'Load Absentees'}
                          </button>
                        </div>
                      </div>

                      {!sessCollapsed && (
                        <div style={{ marginTop: 12 }}>
                          <table className={attendanceStyles.attendanceTable}>
                            <thead>
                              <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sessionRecords.map(r => (
                                <tr key={r.id}>
                                  <td>{r.roll_no}</td>
                                  <td>{r.name}</td>
                                  <td><span className={`${attendanceStyles.statusBadge} ${attendanceStyles.present}`}>present</span></td>
                                </tr>
                              ))}
                              {/* Also list absentees if loaded */}
                              {sessionAbsent[sessionKey] && sessionAbsent[sessionKey].length > 0 && (
                                <>
                                  <tr><td colSpan={3}><strong>Absentees</strong></td></tr>
                                  {sessionAbsent[sessionKey].map((a: any) => (
                                    <tr key={a.roll_no}>
                                      <td>{a.roll_no}</td>
                                      <td>{a.name}</td>
                                      <td><span className={`${attendanceStyles.statusBadge} ${attendanceStyles.absent}`}>absent</span></td>
                                    </tr>
                                  ))}
                                </>
                              )}
                            </tbody>
                          </table>
                          {sessionError[sessionKey] && <p className={attendanceStyles.error}>{sessionError[sessionKey]}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function MentorReportsPage() {
  return (
    <div className={styles.reportsModule}>
      <MentorAttendanceReport />
    </div>
  );
}
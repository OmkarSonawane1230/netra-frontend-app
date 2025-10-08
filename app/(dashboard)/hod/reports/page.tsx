"use client"
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getMyAttendanceRecords, getAbsentRecords, getAttendanceRecords, AttendanceRecord } from '@/services/api';
import { DownloadIcon, FilterIcon, BarChart3Icon, PieChartIcon, TrendingUpIcon, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import styles from '@/app/styles/views/ReportsModule.module.css';
import attendanceStyles from '@/app/styles/views/AttendanceManagement.module.css';

// --- Attendance Report Component ---
interface LectureGroup {
  [key: string]: AttendanceRecord[];
}

const AttendanceReportComponent = () => {
  // Selector state
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [collapsedGroups, setCollapsedGroups] = useState<{ [year: string]: boolean }>({});

  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [groupedRecords, setGroupedRecords] = useState<{ [year: string]: AttendanceRecord[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const initialCollapsed: { [year: string]: boolean } = {};
    Object.keys(groupedRecords).forEach(year => {
      initialCollapsed[year] = true;
    });
    setCollapsedGroups(initialCollapsed);
  }, [groupedRecords]);
  const toggleGroup = (year: string) => {
    setCollapsedGroups(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAttendanceRecords();
      setRecords(data);
      // Group by year
      const groups: { [year: string]: AttendanceRecord[] } = data.reduce((acc, record) => {
        const year = new Date(record.date).getFullYear().toString();
        if (!acc[year]) acc[year] = [];
        acc[year].push(record);
        return acc;
      }, {} as { [year: string]: AttendanceRecord[] });
      setGroupedRecords(groups);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Removed filter logic and filter value collections for HOD department year-wise report

  return (
    <div className={attendanceStyles.attendanceManagement}>
      <div className={attendanceStyles.header}>
        <h2 className={attendanceStyles.title}>Department Attendance Report (Year-wise)</h2>
        <div className={attendanceStyles.filters} style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="day-selector">Day:</label>
            <input
              type="date"
              id="day-selector"
              value={selectedDay}
              onChange={e => setSelectedDay(e.target.value)}
              className={attendanceStyles.filterSelect}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="year-selector">Year:</label>
            <select
              id="year-selector"
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className={attendanceStyles.filterSelect}
            >
              <option value="">All Years</option>
              <option value="FE">First Year</option>
              <option value="SE">Second Year</option>
              <option value="TE">Third Year</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="month-selector">Month:</label>
            <select
              id="month-selector"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className={attendanceStyles.filterSelect}
            >
              <option value="">All Months</option>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
        </div>
      </div>
      {loading && <div className={attendanceStyles.centered}><Loader2 className="animate-spin" size={32} /> <p>Loading records...</p></div>}
      {error && <p className={attendanceStyles.error}>Error: {error}</p>}
      {!loading && !error && Object.keys(groupedRecords).length === 0 && (
        <p className={attendanceStyles.noRecords}>No attendance records found.</p>
      )}
      {Object.entries(groupedRecords).map(([year, group]) => {
        const collapsed = collapsedGroups[year];
        // Only filter by selectedDay for now
        const filteredGroup = selectedDay
          ? group.filter(rec => rec.date === selectedDay)
          : group;
        return (
          <div key={year} className={attendanceStyles.tableContainer}>
            <div className={attendanceStyles.statsCards} style={{ marginBottom: '0' }}>
              <div className={attendanceStyles.statCard} style={{ flex: 1, minWidth: 0, margin: 0, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className={attendanceStyles.statContent}>
                  <div className={attendanceStyles.statLabel} style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Year: {year}</div>
                  <div style={{ fontSize: '13px', color: 'hsl(220, 15%, 45%)' }}>
                    <span><strong>Total Records:</strong> {filteredGroup.length}</span>
                  </div>
                </div>
                <button
                  className={attendanceStyles.iconButton}
                  style={{ marginLeft: 'auto' }}
                  onClick={() => toggleGroup(year)}
                  aria-label={collapsed ? 'Expand table' : 'Collapse table'}
                >
                  {collapsed ? <ChevronRight size={22} /> : <ChevronDown size={22} />}
                </button>
              </div>
            </div>
            {!collapsed && (
              <table className={attendanceStyles.attendanceTable}>
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroup.map(rec => (
                    <tr key={rec.id}>
                      <td>{rec.roll_no}</td>
                      <td>{rec.name}</td>
                      <td>{rec.date}</td>
                      <td>
                        <span className={`${attendanceStyles.statusBadge} ${rec.status === 'present' ? attendanceStyles.present : attendanceStyles.absent}`}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
};


// --- Main Reports Module ---
export default function ReportsModule() {
  return (
    <div className={styles.reportsModule}>
      <AttendanceReportComponent />
    </div>
  );
}
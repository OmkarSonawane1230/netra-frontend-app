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
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [groupedRecords, setGroupedRecords] = useState<{ [key: string]: AttendanceRecord[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState('2025-10-02');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAttendanceRecords(date);
      setRecords(data);
      const groups: { [key: string]: AttendanceRecord[] } = data.reduce((acc, record) => {
        const key = `${record.subject} (${record.time_slot})`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(record);
        return acc;
      }, {} as { [key: string]: AttendanceRecord[] });
      setGroupedRecords(groups);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance records.');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Filter logic
  const filteredGroups = Object.entries(groupedRecords).filter(([key, group]) => {
    const first = group[0];
    return (
      (!subjectFilter || first.subject === subjectFilter) &&
      (!classFilter || first.student_class === classFilter) &&
      (!teacherFilter || first.teacher === teacherFilter)
    );
  });

  // Collect unique filter values
  const subjects = Array.from(new Set(records.map(r => r.subject))).filter(Boolean);
  const classes = Array.from(new Set(records.map(r => r.student_class))).filter(Boolean);
  const teachers = Array.from(new Set(records.map(r => r.teacher))).filter(Boolean);


  const [collapsedGroups, setCollapsedGroups] = useState<{ [key: string]: boolean }>({});

  // Collapse all groups by default when groupedRecords changes
  useEffect(() => {
    const initialCollapsed: { [key: string]: boolean } = {};
    Object.keys(groupedRecords).forEach(key => {
      initialCollapsed[key] = true;
    });
    setCollapsedGroups(initialCollapsed);
  }, [groupedRecords]);

  const toggleGroup = (key: string) => {
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={attendanceStyles.attendanceManagement}>
      <div className={attendanceStyles.header}>
        <h2 className={attendanceStyles.title}>Attendance Report</h2>
        <div className={attendanceStyles.controls}>
          <div className={attendanceStyles.filters}>
            <label htmlFor="report-date">Date:</label>
            <input
              type="date"
              id="report-date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={attendanceStyles.filterSelect}
            />
            <label>Subject:</label>
            <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className={attendanceStyles.filterSelect}>
              <option value="">All</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <label>Class:</label>
            <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className={attendanceStyles.filterSelect}>
              <option value="">All</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label>Teacher:</label>
            <select value={teacherFilter} onChange={e => setTeacherFilter(e.target.value)} className={attendanceStyles.filterSelect}>
              <option value="">All</option>
              {teachers.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>
      {loading && <div className={attendanceStyles.centered}><Loader2 className="animate-spin" size={32} /> <p>Loading records...</p></div>}
      {error && <p className={attendanceStyles.error}>Error: {error}</p>}
      {!loading && !error && filteredGroups.length === 0 && (
        <p className={attendanceStyles.noRecords}>No attendance records found for the selected filters.</p>
      )}
      {filteredGroups.map(([key, group]) => {
        const collapsed = collapsedGroups[key];
        return (
          <div key={key} className={attendanceStyles.tableContainer}>
            <div className={attendanceStyles.statsCards} style={{ marginBottom: '0' }}>
              <div className={attendanceStyles.statCard} style={{ flex: 1, minWidth: 0, margin: 0, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className={attendanceStyles.statContent}>
                  <div className={attendanceStyles.statLabel} style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{key}</div>
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '13px', color: 'hsl(220, 15%, 45%)' }}>
                    <span><strong>Teacher:</strong> {group[0].teacher}</span>
                    <span><strong>Class:</strong> {group[0].student_class || '-'}</span>
                    <span><strong>Hall:</strong> {group[0].hall || '-'}</span>
                    <span><strong>Date:</strong> {group[0].date}</span>
                  </div>
                </div>
                <button
                  className={attendanceStyles.iconButton}
                  style={{ marginLeft: 'auto' }}
                  onClick={() => toggleGroup(key)}
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
                    <th>Timestamp</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {group.map(rec => (
                    <tr key={rec.id}>
                      <td>{rec.roll_no}</td>
                      <td>{rec.name}</td>
                      <td>{new Date(rec.timestamp).toLocaleTimeString()}</td>
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
  const [selectedReportType, setSelectedReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState('this-month');

  const reportTypes = [
    { id: 'attendance', name: 'Attendance Report', icon: BarChart3Icon },
    { id: 'academic', name: 'Academic Performance', icon: TrendingUpIcon },
    { id: 'staff', name: 'Staff Report', icon: PieChartIcon },
    { id: 'department', name: 'Department Analysis', icon: BarChart3Icon },
  ];

  // No more mock data. For non-attendance types, you may want to fetch real data here in future.
  const currentData: any[] = [];

  const handleGenerateReport = () => {
    console.log(`Generate ${selectedReportType} report for ${dateRange} triggered`);
  };

  const handleExportReport = () => {
    console.log(`Export ${selectedReportType} report triggered`);
  };

  return (
    <div className={styles.reportsModule}>
      <div className={styles.header}>
        <h2 className={styles.title}>Reports & Analytics</h2>
        <div className={styles.headerActions}>
          <button
            className={styles.primaryButton}
            onClick={handleGenerateReport}
            data-testid="button-generate-report"
          >
            <BarChart3Icon size={24} />
            Generate Report
          </button>
          <button
            className={styles.secondaryButton}
            onClick={handleExportReport}
            data-testid="button-export-report"
          >
            <DownloadIcon size={24} />
            Export
          </button>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Report Type:</label>
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
            className={styles.filterSelect}
            data-testid="select-report-type"
          >
            {reportTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Date Range:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className={styles.filterSelect}
            data-testid="select-date-range"
          >
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="this-quarter">This Quarter</option>
            <option value="this-year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <button
          className={styles.iconButton}
          onClick={() => console.log('Advanced filters clicked')}
          data-testid="button-advanced-filters"
          title="Advanced Filters"
        >
          <FilterIcon size={24} />
        </button>
      </div>

      <div className={styles.reportCards}>
        {reportTypes.map((type) => {
          const Icon = type.icon;
          return (
            <div
              key={type.id}
              className={`${styles.reportCard} ${selectedReportType === type.id ? styles.active : ''}`}
              onClick={() => setSelectedReportType(type.id)}
              data-testid={`card-${type.id}`}
            >
              <div className={styles.cardIcon}>
                <Icon size={24} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{type.name}</h3>
                <p className={styles.cardDescription}>
                  {type.id === 'attendance' && 'Track student attendance patterns'}
                  {type.id === 'academic' && 'Analyze academic performance trends'}
                  {type.id === 'staff' && 'Monitor staff activities and performance'}
                  {type.id === 'department' && 'Department-wise analysis and insights'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        {selectedReportType === 'attendance' ? (
          <AttendanceReportComponent />
        ) : (
          <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>
              {reportTypes.find(type => type.id === selectedReportType)?.name} - {dateRange.replace('-', ' ')}
            </h3>

            {currentData.length > 0 && (
              <div className={styles.dataTable}>
                <table className={styles.reportTable} data-testid="table-report-data">
                  <thead>
                    <tr>
                      {selectedReportType === 'academic' && (
                        <>
                          <th>Subject</th>
                          <th>Average Score</th>
                          <th>Pass Rate %</th>
                          <th>Fail Rate %</th>
                        </>
                      )}
                      {selectedReportType === 'staff' && (
                        <>
                          <th>Staff Name</th>
                          <th>Lectures Taken</th>
                          <th>Avg. Attendance</th>
                        </>
                      )}
                      {selectedReportType === 'department' && (
                        <>
                          <th>Department</th>
                          <th>Total Students</th>
                          <th>Avg. Pass Rate</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((row: any, index: number) => (
                      <tr key={index} data-testid={`row-data-${index}`}>
                        {selectedReportType === 'academic' && (
                          <>
                            <td>{row.subject}</td>
                            <td>{row.average.toFixed(1)}</td>
                            <td>{row.pass}%</td>
                            <td>{row.fail}%</td>
                          </>
                        )}
                        {selectedReportType === 'staff' && (
                          <>
                            <td>{row.name}</td>
                            <td>{row.lectures}</td>
                            <td>{row.avgAttendance}%</td>
                          </>
                        )}
                        {selectedReportType === 'department' && (
                          <>
                            <td>{row.name}</td>
                            <td>{row.students}</td>
                            <td>{row.passRate}%</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {currentData.length === 0 && (
              <div className={styles.noData}>
                <p>No data available for this report type. Please select another category or check back later.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
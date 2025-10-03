'use client'
import { useState } from 'react';
import { SearchIcon, FilterIcon, DownloadIcon, PlusIcon } from 'lucide-react';
import styles from '@/app/styles/views/AttendanceManagement.module.css';

export default function AttendanceManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  // TODO: remove mock data functionality - replace with real API calls
  const attendanceData = [
    { id: 1, studentName: 'Alice Johnson', rollNo: 'A001', class: '10A', present: true, date: '2024-01-15' },
    { id: 2, studentName: 'Bob Smith', rollNo: 'A002', class: '10A', present: false, date: '2024-01-15' },
    { id: 3, studentName: 'Carol Brown', rollNo: 'A003', class: '10A', present: true, date: '2024-01-15' },
    { id: 4, studentName: 'David Wilson', rollNo: 'A004', class: '10B', present: true, date: '2024-01-15' },
    { id: 5, studentName: 'Eva Davis', rollNo: 'A005', class: '10B', present: false, date: '2024-01-15' },
  ];

  const filteredData = attendanceData.filter(record => 
    (selectedClass === 'all' || record.class === selectedClass) &&
    (record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     record.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleToggleAttendance = (id: number) => {
    console.log(`Toggle attendance for student ${id}`);
  };

  return (
    <div className={styles.attendanceManagement}>
      <div className={styles.header}>
        <h2 className={styles.title}>Attendance Management</h2>
        <button 
          className={styles.primaryButton}
          onClick={() => console.log('Mark attendance action triggered')}
          data-testid="button-mark-attendance"
        >
          <PlusIcon size={20} />
          Mark Attendance
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <SearchIcon size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            data-testid="input-search-students"
          />
        </div>

        <div className={styles.filters}>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className={styles.filterSelect}
            data-testid="select-class-filter"
          >
            <option value="all">All Classes</option>
            <option value="10A">Class 10A</option>
            <option value="10B">Class 10B</option>
            <option value="11A">Class 11A</option>
            <option value="11B">Class 11B</option>
          </select>

          <button 
            className={styles.iconButton}
            onClick={() => console.log('Filter clicked')}
            data-testid="button-filter"
          >
            <FilterIcon size={20} />
          </button>

          <button 
            className={styles.iconButton}
            onClick={() => console.log('Export attendance data')}
            data-testid="button-export"
          >
            <DownloadIcon size={20} />
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.attendanceTable} data-testid="table-attendance">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((record) => (
              <tr key={record.id} data-testid={`row-attendance-${record.id}`}>
                <td>{record.rollNo}</td>
                <td>{record.studentName}</td>
                <td>{record.class}</td>
                <td>{record.date}</td>
                <td>
                  <span 
                    className={`${styles.status} ${record.present ? styles.present : styles.absent}`}
                    data-testid={`status-${record.id}`}
                  >
                    {record.present ? 'Present' : 'Absent'}
                  </span>
                </td>
                <td>
                  <button
                    className={styles.toggleButton}
                    onClick={() => handleToggleAttendance(record.id)}
                    data-testid={`button-toggle-${record.id}`}
                  >
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
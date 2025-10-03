"use client"
import { useState } from 'react';
import { DownloadIcon, FilterIcon, BarChart3Icon, PieChartIcon, TrendingUpIcon } from 'lucide-react';
import styles from '@/app/styles/views/ReportsModule.module.css';

export default function ReportsModule() {
  const [selectedReportType, setSelectedReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState('this-month');

  // TODO: remove mock data functionality - replace with real API calls
  const reportTypes = [
    { id: 'attendance', name: 'Attendance Report', icon: BarChart3Icon },
    { id: 'academic', name: 'Academic Performance', icon: TrendingUpIcon },
    { id: 'staff', name: 'Staff Report', icon: PieChartIcon },
    { id: 'department', name: 'Department Analysis', icon: BarChart3Icon },
  ];

  // TODO: remove mock data functionality - replace with real API calls
  const mockReportData = {
    attendance: [
      { class: '10A', present: 95, absent: 5, total: 100 },
      { class: '10B', present: 88, absent: 12, total: 100 },
      { class: '11A', present: 92, absent: 8, total: 100 },
      { class: '11B', present: 87, absent: 13, total: 100 },
    ],
    academic: [
      { subject: 'Mathematics', average: 85.5, pass: 92, fail: 8 },
      { subject: 'Physics', average: 78.2, pass: 87, fail: 13 },
      { subject: 'Chemistry', average: 82.1, pass: 90, fail: 10 },
      { subject: 'Biology', average: 88.3, pass: 95, fail: 5 },
    ]
  };

  const currentData = mockReportData[selectedReportType as keyof typeof mockReportData] || [];

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

      <div className={styles.dataVisualization}>
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>
            {reportTypes.find(type => type.id === selectedReportType)?.name} - {dateRange.replace('-', ' ')}
          </h3>
          
          {currentData.length > 0 && (
            <div className={styles.dataTable}>
              <table className={styles.reportTable} data-testid="table-report-data">
                <thead>
                  <tr>
                    {selectedReportType === 'attendance' && (
                      <>
                        <th>Class</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Total</th>
                        <th>Attendance %</th>
                      </>
                    )}
                    {selectedReportType === 'academic' && (
                      <>
                        <th>Subject</th>
                        <th>Average Score</th>
                        <th>Pass Rate %</th>
                        <th>Fail Rate %</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row: any, index: number) => (
                    <tr key={index} data-testid={`row-data-${index}`}>
                      {selectedReportType === 'attendance' && (
                        <>
                          <td>{row.class}</td>
                          <td>{row.present}</td>
                          <td>{row.absent}</td>
                          <td>{row.total}</td>
                          <td>{((row.present / row.total) * 100).toFixed(1)}%</td>
                        </>
                      )}
                      {selectedReportType === 'academic' && (
                        <>
                          <td>{row.subject}</td>
                          <td>{row.average.toFixed(1)}</td>
                          <td>{row.pass}%</td>
                          <td>{row.fail}%</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
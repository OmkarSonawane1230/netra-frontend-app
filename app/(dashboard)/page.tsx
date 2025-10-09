'use client'

import { UsersIcon, ClipboardListIcon, BookOpenIcon, TrendingUpIcon } from 'lucide-react';
import styles from '@/app/styles/views/DashboardOverview.module.css';
import SubjectSummaryCard from '@/app/components/charts/SubjectSummaryCard';
import { useAuth } from '@/app/context/AuthContext';

export default function DashboardOverview() {
  // TODO: remove mock data functionality - replace with real API calls
  const stats = [
    { 
      title: 'Total Students', 
      value: '2,847', 
      change: '+12%', 
      changeType: 'positive' as const, 
      icon: UsersIcon 
    },
    { 
      title: 'Present Today', 
      value: '2,654', 
      change: '+5%', 
      changeType: 'positive' as const, 
      icon: ClipboardListIcon 
    },
    { 
      title: 'Total Subjects', 
      value: '156', 
      change: '+3%', 
      changeType: 'positive' as const, 
      icon: BookOpenIcon 
    },
    { 
      title: 'Attendance Rate', 
      value: '93.2%', 
      change: '+2.1%', 
      changeType: 'positive' as const, 
      icon: TrendingUpIcon 
    },
  ];

  // TODO: remove mock data functionality - replace with real API calls
  const recentActivities = [
    { id: 1, action: 'New student registered', user: 'John Doe', time: '2 hours ago' },
    { id: 2, action: 'Attendance marked for Class 10A', user: 'Mrs. Smith', time: '3 hours ago' },
    { id: 3, action: 'New subject added', user: 'Dr. Brown', time: '5 hours ago' },
    { id: 4, action: 'HOD assigned to Department', user: 'Prof. Wilson', time: '1 day ago' },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={styles.statCard} data-testid={`stat-card-${index}`}>
              <div className={styles.statHeader}>
                <div className={styles.statIcon}>
                  <Icon size={24} />
                </div>
                <div className={`${styles.statChange} ${styles[stat.changeType]}`}>
                  {stat.change}
                </div>
              </div>
              <div className={styles.statValue} data-testid={`stat-value-${index}`}>
                {stat.value}
              </div>
              <div className={styles.statTitle}>{stat.title}</div>
            </div>
          );
        })}
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.activityCard}>
          <h3 className={styles.cardTitle}>Recent Activities</h3>
          <div className={styles.activityList}>
            {recentActivities.map((activity) => (
              <div key={activity.id} className={styles.activityItem} data-testid={`activity-${activity.id}`}>
                <div className={styles.activityContent}>
                  <div className={styles.activityAction}>{activity.action}</div>
                  <div className={styles.activityMeta}>
                    <span className={styles.activityUser}>{activity.user}</span>
                    <span className={styles.activityTime}>{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.quickActions}>
          <h3 className={styles.cardTitle}>Quick Actions</h3>
          <div className={styles.actionButtons}>
            <button 
              className={styles.actionButton} 
              onClick={() => console.log('Add student action triggered')}
              data-testid="button-add-student"
            >
              Add New Student
            </button>
            <button 
              className={styles.actionButton} 
              onClick={() => console.log('Mark attendance action triggered')}
              data-testid="button-mark-attendance"
            >
              Mark Attendance
            </button>
            <button 
              className={styles.actionButton} 
              onClick={() => console.log('Generate report action triggered')}
              data-testid="button-generate-report"
            >
              Generate Report
            </button>
            <button 
              className={styles.actionButton} 
              onClick={() => console.log('View timetable action triggered')}
              data-testid="button-view-timetable"
            >
              View Timetable
            </button>
          </div>
          {/* Monthly summary card (previous month) */}
          <div style={{ marginTop: 16 }}>
            {/* Only show summary if user is authenticated to avoid 401 API calls */}
            <AuthSummaryPlaceholder />
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthSummaryPlaceholder() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return (
      <div style={{ border: '1px solid var(--muted)', borderRadius: 8, padding: 12, background: 'var(--card)' }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Subject-wise Average</h3>
        <div style={{ color: 'hsl(220, 15%, 45%)' }}>Sign in to view monthly attendance summaries.</div>
      </div>
    );
  }

  const today = new Date();
  const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const year = prevMonth.getFullYear();
  const month = prevMonth.getMonth() + 1;
  return <SubjectSummaryCard year={year} month={month} />;
}
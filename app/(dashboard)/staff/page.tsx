"use client"
import SubjectSummaryCard from '@/app/components/charts/SubjectSummaryCard';
import { useAuth } from '@/app/context/AuthContext';

export default function StaffDashboard() {
  const { user, isAuthenticated } = useAuth();
  const today = new Date();
  const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const year = prevMonth.getFullYear();
  const month = prevMonth.getMonth() + 1;

  if (!isAuthenticated) return <div style={{ padding: 24 }}>Please sign in to view your dashboard.</div>;

  return (
    <div>
      <h2 style={{ marginBottom: 12 }}>My Monthly Subject Report ({month}/{year})</h2>
      <div style={{ maxWidth: 820 }}>
        <SubjectSummaryCard year={year} month={month} />
      </div>
    </div>
  );
}
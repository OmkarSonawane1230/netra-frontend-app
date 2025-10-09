"use client"
import { useAuth } from '@/app/context/AuthContext';
import SubjectSummaryCard from '@/app/components/charts/SubjectSummaryCard';

export default function MentorPage() {
  const { user, isAuthenticated } = useAuth();
  const today = new Date();
  const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const year = prevMonth.getFullYear();
  const month = prevMonth.getMonth() + 1;

  if (!isAuthenticated) return <div style={{ padding: 24 }}>Please sign in to view your mentor dashboard.</div>;

  return (
    <div>
      <h2 style={{ marginBottom: 12 }}>My Monthly Subject Report ({month}/{year})</h2>
      <div style={{ maxWidth: 900 }}>
        <SubjectSummaryCard year={year} month={month} teacher={user?.fullName} />
      </div>
    </div>
  );
}
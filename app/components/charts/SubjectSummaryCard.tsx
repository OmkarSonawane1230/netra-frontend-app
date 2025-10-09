"use client"
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { getMonthlySummary, getMonthlySummaryForTeacher } from '@/services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function SubjectSummaryCard({ year, month, teacher }: { year: number; month: number; teacher?: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
  const loader = teacher ? getMonthlySummaryForTeacher(teacher, year, month) : getMonthlySummary(year, month);
  loader.then((resp) => {
      if (!mounted) return;
      // resp may be an object (principal with departments) or an array for staff/hod
      if (Array.isArray(resp)) {
        setData(resp);
      } else if (typeof resp === 'object') {
        // pick first department if object
        const first = Object.values(resp)[0] as any[];
        setData(first || []);
      } else {
        setData([]);
      }
    }).catch((e) => setError(e.message || 'Failed to load')).finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [year, month]);

  if (loading) return <div style={{ padding: 12 }}>Loading summary...</div>;
  if (error) {
    // If unauthorized, show sign-in prompt
    const errAny: any = error;
    if (errAny && (errAny.status === 401 || errAny.status === 403)) {
      return (
        <div style={{ border: '1px solid var(--muted)', borderRadius: 8, padding: 12, background: 'var(--card)' }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Subject-wise Average ({month}/{year})</h3>
          <div style={{ color: 'hsl(220, 15%, 45%)' }}>You must be signed in to view this data.</div>
        </div>
      );
    }
    return <div style={{ padding: 12, color: 'var(--danger)' }}>{error}</div>;
  }
  if (!data || data.length === 0) return <div style={{ padding: 12 }}>No summary data for the selected month.</div>;

  // Filter to entries that have percentage data
  const usable = data.filter(d => d && typeof d.average_percentage === 'number');
  if (!usable || usable.length === 0) {
    // No percentage data available; show a simple list instead of an empty chart
    return (
      <div style={{ border: '1px solid var(--muted)', borderRadius: 8, padding: 12, background: 'var(--card)' }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Subject-wise Average ({month}/{year})</h3>
        <div style={{ color: 'hsl(220, 15%, 45%)' }}>No percentage information available for these subjects this month.</div>
        <ul style={{ marginTop: 8 }}>
          {data.map(d => (
            <li key={d.subject} style={{ marginBottom: 6 }}>
              <strong>{d.subject}</strong>: {d.total_present ?? 0} present across {d.total_lectures ?? 0} lectures
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const labels = usable.map(d => d.subject);
  const values = usable.map(d => d.average_percentage ?? 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Average Attendance %',
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { min: 0, max: 100 } }
  } as any;

  return (
    <div style={{ border: '1px solid var(--muted)', borderRadius: 8, padding: 12, background: 'var(--card)' }}>
      <h3 style={{ margin: '0 0 8px 0' }}>Subject-wise Average ({month}/{year})</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
}

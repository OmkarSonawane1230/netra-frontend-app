"use client"
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { getSubjectTimeseries } from '@/services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function SubjectTimeseriesChart({ year, month, subject }: { year: number; month: number; subject: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getSubjectTimeseries(year, month, subject).then((resp) => {
      if (!mounted) return;
      setData(resp || []);
    }).catch((e) => setError(e.message || 'Failed to load')).finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [year, month, subject]);

  if (loading) return <div style={{ padding: 12 }}>Loading timeseries...</div>;
  if (error) return <div style={{ padding: 12, color: 'var(--danger)' }}>{error}</div>;
  if (!data || data.length === 0) return <div style={{ padding: 12 }}>No timeseries data for {subject}.</div>;

  const labels = data.map(d => `${d.date} ${d.time_slot}`);
  const values = data.map(d => d.percentage ?? 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: `${subject} - Attendance %`,
        data: values,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)'
      }
    ]
  };

  const options = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } } as any;

  return (
    <div style={{ border: '1px solid var(--muted)', borderRadius: 8, padding: 12, background: 'var(--card)' }}>
      <h4 style={{ margin: '0 0 8px 0' }}>{subject} — Timeseries ({month}/{year})</h4>
      <Line data={chartData} options={options} />
    </div>
  );
}

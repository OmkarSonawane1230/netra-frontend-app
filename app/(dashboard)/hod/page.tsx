"use client"
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import SubjectSummaryCard from '@/app/components/charts/SubjectSummaryCard';
import { getMonthlySummary, getSubjectsWithStaff } from '@/services/api';

export default function HodPage() {
    const { user, isAuthenticated } = useAuth();
    const today = new Date();
    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const year = prevMonth.getFullYear();
    const month = prevMonth.getMonth() + 1;

    const [deptFallback, setDeptFallback] = useState<any[] | null>(null);
    const [loadingDeptCheck, setLoadingDeptCheck] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoadingDeptCheck(true);
        // Load department summary and decide if we need to show the fallback subject->staff list
        getMonthlySummary(year, month)
            .then((resp) => {
                if (!mounted) return;
                // Role-aware endpoint: for HOD it returns an array for the department
                const arr = Array.isArray(resp) ? resp : (Array.isArray(Object.values(resp)[0]) ? Object.values(resp)[0] : []);
                const hasPercentage = Array.isArray(arr) && arr.some((it: any) => typeof it.average_percentage === 'number' && it.average_percentage > 0);
                if (!hasPercentage) {
                    // fetch subjects with staff mapping
                    return getSubjectsWithStaff().then((list) => {
                        if (!mounted) return;
                        setDeptFallback(Array.isArray(list) ? list : []);
                    }).catch(() => {
                        if (!mounted) return;
                        setDeptFallback([]);
                    });
                }
                setDeptFallback(null); // summary has data, no fallback
            })
            .catch((e) => {
                // On error, show fallback if available
                if (!mounted) return;
                console.error('Failed to fetch monthly summary for HOD:', e);
                getSubjectsWithStaff().then((list) => {
                    if (!mounted) return;
                    setDeptFallback(Array.isArray(list) ? list : []);
                }).catch(() => { if (mounted) setDeptFallback([]); });
            })
            .finally(() => { if (mounted) setLoadingDeptCheck(false); });

        return () => { mounted = false; };
    }, [year, month]);

    if (!isAuthenticated) return <div style={{ padding: 24 }}>Please sign in to view HOD dashboard.</div>;

    return (
        <div style={{ padding: 20 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>HOD Dashboard</h1>
            <p style={{ marginBottom: 12 }}>Welcome, {user?.fullName || 'HOD'} — Department: {user?.department || 'N/A'}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                    <h3>My Subject Summary</h3>
                    <SubjectSummaryCard year={year} month={month} teacher={user?.fullName} />
                </div>
                <div>
                    <h3>Department Summary</h3>
                    {/* If deptFallback is null -> department summary has data and SubjectSummaryCard will show it.
                        If deptFallback is an array (possibly empty) -> show subject->staff list instead. */}
                    {loadingDeptCheck ? (
                        <div style={{ padding: 12 }}>Checking department data...</div>
                    ) : (
                        deptFallback === null ? (
                            <SubjectSummaryCard year={year} month={month} />
                        ) : (
                            <div style={{ border: '1px solid var(--muted)', borderRadius: 8, padding: 12, background: 'var(--card)' }}>
                                <h4 style={{ margin: '0 0 8px 0' }}>Subjects & Assigned Staff</h4>
                                {deptFallback.length === 0 ? (
                                    <div style={{ color: 'hsl(220, 15%, 45%)' }}>No subjects found for your department.</div>
                                ) : (
                                    <ul style={{ marginTop: 8 }}>
                                        {deptFallback.map((s: any) => (
                                            <li key={s.id} style={{ marginBottom: 8 }}>
                                                <strong>{s.name || s.subject || s.abbreviation}</strong>
                                                {s.staff && s.staff.length > 0 ? (
                                                    <div style={{ marginTop: 4, color: 'hsl(220, 15%, 35%)' }}>
                                                        Assigned: {s.staff.map((st: any) => st.full_name || st.name || st).join(', ')}
                                                    </div>
                                                ) : (
                                                    <div style={{ marginTop: 4, color: 'hsl(220, 15%, 45%)' }}>No staff assigned</div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
"use client"
import { useState, useCallback, useEffect, useMemo } from 'react';


import { useAuth } from '@/app/context/AuthContext';
import { getTimetable, saveTimetable, getSubjects, getStaff, getAvailableClasses } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { FormModal, FormField } from '@/app/components/FormModal';

import { PlusIcon, EditIcon, TrashIcon, CalendarIcon } from 'lucide-react';
import styles from '@/app/styles/views/TimetableManagement.module.css';

// A template for a new, empty timetable for a class
type Lecture = {
  id: number;
  subject: string;
  teacher: string;
  hall: string;
  class: string;
};

type Timetable = {
  timeSlots: string[];
  schedule: Record<string, Record<string, Lecture[]>>;
};

const createNewTimetable = (): Timetable => ({
  timeSlots: [],
  schedule: {
    Monday: {},
    Tuesday: {},
    Wednesday: {},
    Thursday: {},
    Friday: {},
    Saturday: {},
  },
});

export default function TimetableManagement() {
  // Tab navigation states
  const [activeTab, setActiveTab] = useState<string>(''); // FE, SE, TE, etc.
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  // Timetable states
  const [allTimetables, setAllTimetables] = useState<Record<string, Timetable>>({});
  const [subjects, setSubjects] = useState<any[]>([]); // TODO: type from API
  const [staff, setStaff] = useState<any[]>([]); // TODO: type from API
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newTimeSlot, setNewTimeSlot] = useState<{ start: string; end: string }>({ start: '09:00', end: '10:00' });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Remove unused states
  // const [selectedClass, setSelectedClass] = useState('10A');
  // const [selectedDay, setSelectedDay] = useState('monday');

  // js code start

  const { user } = useAuth();

  // Handler: Save Timetable to backend
  const handleSaveTimetable = async () => {
    try {
      await saveTimetable(allTimetables);
      alert('Timetable saved successfully!');
    } catch (error: any) {
      alert('Failed to save timetable: ' + error.message);
    }
  };

  // Handler: Change a lecture field inline (subject, teacher, hall)
  const handleLectureChange = (
    day: string,
    slot: string,
    lectureId: number,
    field: keyof Lecture,
    value: string
  ) => {
    const timetable = { ...activeTimetable };
    const lectures = timetable.schedule[day]?.[slot] || [];
    const updatedLectures = lectures.map(lec =>
      lec.id === lectureId ? { ...lec, [field]: value } : lec
    );
    timetable.schedule[day][slot] = updatedLectures;
    handleUpdateActiveTimetable(timetable);
  };

  // Handler: Remove a time slot from the timetable
  const handleRemoveTimeSlot = (slot: string) => {
    if (!window.confirm('Are you sure you want to remove this time slot?')) return;
    const timetable = { ...activeTimetable };
    timetable.timeSlots = timetable.timeSlots.filter(s => s !== slot);
    // Remove slot from all days
    Object.keys(timetable.schedule).forEach(day => {
      if (timetable.schedule[day][slot]) {
        delete timetable.schedule[day][slot];
      }
    });
    handleUpdateActiveTimetable(timetable);
    // Save to backend after removal
    saveTimetable({ ...allTimetables, [activeTab]: timetable });
  };


  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [timetableData, subjectsData, staffData, availableClassesData] = await Promise.all([
        getTimetable(), getSubjects(), getStaff(), getAvailableClasses()
      ]);

      // Initialize timetables for all available classes
      const initializedTimetables: Record<string, Timetable> = {};
      availableClassesData.forEach((cls: string) => {
        if (timetableData && timetableData[cls]) {
          // Use existing data from backend but ensure all days are present
          const existingTimetable = timetableData[cls];
          initializedTimetables[cls] = {
            timeSlots: existingTimetable.timeSlots || [],
            schedule: {
              Monday: existingTimetable.schedule?.Monday || {},
              Tuesday: existingTimetable.schedule?.Tuesday || {},
              Wednesday: existingTimetable.schedule?.Wednesday || {},
              Thursday: existingTimetable.schedule?.Thursday || {},
              Friday: existingTimetable.schedule?.Friday || {},
              Saturday: existingTimetable.schedule?.Saturday || {},
            }
          };
        } else {
          initializedTimetables[cls] = createNewTimetable();
        }
      });

      setAllTimetables(initializedTimetables);
      setSubjects(subjectsData || []);
      setStaff(staffData || []);
      setAvailableClasses(availableClassesData || []);
      if (availableClassesData.length > 0 && !activeTab) {
        setActiveTab(availableClassesData[0]);
      }
    } catch (error: any) {
      console.error('Error loading timetable data:', error);
      alert('Failed to load timetable data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  // Derived state for the currently active timetable, makes logic much cleaner
  const activeTimetable: Timetable = useMemo(() => {
    const timetable = allTimetables[activeTab] || createNewTimetable();
    // Ensure all days are present in the schedule
    const fullSchedule: Timetable['schedule'] = {
      Monday: {},
      Tuesday: {},
      Wednesday: {},
      Thursday: {},
      Friday: {},
      Saturday: {},
      ...timetable.schedule
    };
    return {
      ...timetable,
      schedule: fullSchedule
    };
  }, [allTimetables, activeTab]);

  const handleUpdateActiveTimetable = (newTimetable: Timetable) => {
    setAllTimetables(prev => ({
      ...prev,
      [activeTab]: newTimetable,
    }));
  };

  const handleAddTimeSlot = () => {
    const { start, end } = newTimeSlot;
    if (!start || !end || start >= end) {
      alert('Invalid time slot. End time must be after start time.');
      return;
    }
    const newSlot = `${start}-${end}`;
    const timetable = { ...activeTimetable };
    // Add to timeSlots if not present
    if (!timetable.timeSlots.includes(newSlot)) {
      timetable.timeSlots.push(newSlot);
      timetable.timeSlots.sort();
    }
    // Ensure slot exists for all days
    Object.keys(timetable.schedule).forEach(day => {
      if (!timetable.schedule[day][newSlot]) {
        timetable.schedule[day][newSlot] = [];
      }
    });
    // Add lecture only for selected day
    timetable.schedule[selectedDay][newSlot] = [{
      id: Date.now(),
      subject: '',
      teacher: '',
      hall: '',
      class: activeTab,
    }];
    handleUpdateActiveTimetable(timetable);
    setIsModalOpen(false);
  };
    

  // js code end

  // --- Tab Navigation for Timetable Classes ---
  if (isLoading) {
    return (
      <div className={styles.timetableManagement}>
        <div className={styles.header} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 12, marginBottom: 8 }}>
          <span className={styles.title}>
            <CalendarIcon size={22} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Timetable Management
          </span>
        </div>
        {/* Skeleton Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ width: 80, height: 32, borderRadius: 8, background: '#e5e7eb', opacity: 0.6 }} />
          ))}
        </div>
        {/* Skeleton Actions */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 120, height: 36, borderRadius: 8, background: '#e5e7eb', opacity: 0.6 }} />
          <div style={{ width: 120, height: 36, borderRadius: 8, background: '#e5e7eb', opacity: 0.6 }} />
          <div style={{ width: 120, height: 36, borderRadius: 8, background: '#e5e7eb', opacity: 0.6 }} />
        </div>
        {/* Skeleton Grid */}
        <div style={{ overflowX: 'auto', borderRadius: 12, background: '#f8fafc', boxShadow: '0 1px 4px rgba(30,41,59,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr className={styles.dayHeader}>
                <th colSpan={5} style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ width: 120, height: 24, margin: '0 auto', background: '#e5e7eb', borderRadius: 8, opacity: 0.7 }} />
                </th>
              </tr>
              <tr style={{ background: '#e5e7eb' }}>
                <th style={{ padding: '10px 16px', fontWeight: 600, fontSize: 15, color: '#334155', textAlign: 'left' }}>
                  <div style={{ width: 60, height: 16, background: '#e5e7eb', borderRadius: 6, opacity: 0.6 }} />
                </th>
                {[1,2,3,4].map(i => (
                  <th key={i} style={{ padding: '10px 16px', fontWeight: 500, fontSize: 14, color: '#334155' }}>
                    <div style={{ width: 60, height: 16, background: '#e5e7eb', borderRadius: 6, opacity: 0.6 }} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[selectedDay].map(day => (
                <tr key={day} style={{ background: '#fff' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 500, color: '#334155', background: '#f1f5f9', borderRadius: '0 0 0 12px', textAlign: 'center' }}>{day}</td>
                  {[1,2,3,4].map(i => (
                    <td key={i} style={{ padding: '8px 8px', minWidth: 180, borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                      <div style={{ width: '100%', height: 32, background: '#e5e7eb', borderRadius: 8, opacity: 0.4 }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 16, textAlign: 'right', fontSize: 13, color: '#64748b' }}>
          Loading timetable data...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.timetableManagement}>
      <div className={styles.header} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 12, marginBottom: 8 }}>
        <span className={styles.title}>
          <CalendarIcon size={22} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Timetable for {activeTab}
        </span>
      </div>
      {/* Tab Navigation */}
      <div className={styles.tabContainer} style={{ marginBottom: 16 }}>
        <div className={styles.tabs} style={{ gap: 8, display: 'flex', flexWrap: 'wrap' }}>
          {availableClasses.map((className) => (
            <Button
              key={className}
              onClick={() => setActiveTab(className)}
              className={activeTab === className ? styles.activeTab : styles.tabButton}
              style={{
                fontWeight: activeTab === className ? 'bold' : 'normal',
                borderRadius: 8,
                background: activeTab === className ? '#e5e7eb' : '#fff',
                color: '#334155',
                border: '1px solid #e5e7eb',
                minWidth: 80,
                minHeight: 32,
                boxShadow: activeTab === className ? '0 2px 8px rgba(30,41,59,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {className}
            </Button>
          ))}
        </div>
      </div>

      {/* Actions + Day Selector */}
      <div className={styles.actions} style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <label htmlFor="day-select" style={{ fontWeight: 500, marginRight: 8 }}>Day:</label>
        <select
          id="day-select"
          value={selectedDay}
          onChange={e => setSelectedDay(e.target.value)}
          style={{
            borderRadius: 6,
            padding: '6px 12px',
            fontSize: 15,
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            outline: 'none',
            transition: 'border 0.2s',
            marginRight: 16,
          }}
          onFocus={e => e.currentTarget.style.border = '1.5px solid #2563eb'}
          onBlur={e => e.currentTarget.style.border = '1px solid #cbd5e1'}
        >
          {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
        <Button onClick={() => setIsModalOpen(true)} className={styles.primaryButton}>
          <PlusIcon size={18} style={{ marginRight: 4 }} /> Add Time Slot
        </Button>
        <Button onClick={handleSaveTimetable} className={styles.primaryButton} style={{ background: '#2563eb' }}>
          Save Timetable
        </Button>
      </div>

      {/* Timetable Grid for selected day only */}
      <div className={styles.gridContainer} style={{ overflowX: 'auto', borderRadius: 12, background: '#fff', boxShadow: '0 1px 4px rgba(30,41,59,0.04)' }}>
        <table className={styles.timetableGrid} style={{ width: '100%', borderCollapse: 'collapse', borderSpacing: 0 }}>
          <thead>
            <tr className={styles.dayHeader}>
              <th colSpan={6} style={{ textAlign: 'center', fontWeight: 600, fontSize: 16, color: '#334155', padding: '16px 0' }}>{selectedDay}</th>
            </tr>
            <tr style={{ background: '#e5e7eb' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#334155', textAlign: 'left' }}>Time</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#334155', textAlign: 'left' }}>Subject</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#334155', textAlign: 'left' }}>Teacher</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#334155', textAlign: 'left' }}>Hall</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {activeTimetable.timeSlots.map((slot) => {
              let lectures = activeTimetable.schedule[selectedDay]?.[slot];
              if (!lectures || lectures.length === 0) {
                lectures = [{
                  id: Date.now(),
                  subject: '',
                  teacher: '',
                  hall: '',
                  class: activeTab,
                }];
                activeTimetable.schedule[selectedDay][slot] = lectures;
              }
              const foundLecture = lectures[0];
              if (foundLecture && (foundLecture.subject === 'Break' || foundLecture.subject === 'Lunch Break')) {
                return (
                  <tr key={selectedDay + slot} style={{ background: '#fffbe6' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{slot}</td>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#f59e42', fontWeight: 600, fontSize: 16 }}>{foundLecture.subject}</td>
                    <td></td>
                  </tr>
                );
              }
              return (
                <tr key={selectedDay + slot} style={{ background: '#fff' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{slot}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    <select
                      value={foundLecture.subject}
                      onChange={e => handleLectureChange(selectedDay, slot, foundLecture.id, 'subject', e.target.value)}
                      style={{
                        borderRadius: 6,
                        padding: '6px 12px',
                        fontSize: 15,
                        minWidth: 120,
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        outline: 'none',
                        transition: 'border 0.2s',
                      }}
                      onFocus={e => e.currentTarget.style.border = '1.5px solid #2563eb'}
                      onBlur={e => e.currentTarget.style.border = '1px solid #cbd5e1'}
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s.id} value={s.abbreviation}>{s.name} ({s.abbreviation})</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      value={foundLecture.teacher}
                      onChange={e => handleLectureChange(selectedDay, slot, foundLecture.id, 'teacher', e.target.value)}
                      style={{
                        borderRadius: 6,
                        padding: '6px 12px',
                        fontSize: 15,
                        minWidth: 120,
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        outline: 'none',
                        transition: 'border 0.2s',
                      }}
                      onFocus={e => e.currentTarget.style.border = '1.5px solid #2563eb'}
                      onBlur={e => e.currentTarget.style.border = '1px solid #cbd5e1'}
                    >
                      <option value="">Select Teacher</option>
                      {staff.map(s => <option key={s.id} value={s.full_name}>{s.full_name}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <input
                      type="text"
                      value={foundLecture.hall}
                      onChange={e => handleLectureChange(selectedDay, slot, foundLecture.id, 'hall', e.target.value)}
                      style={{
                        borderRadius: 6,
                        padding: '6px 12px',
                        fontSize: 15,
                        minWidth: 60,
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        outline: 'none',
                        transition: 'border 0.2s',
                      }}
                      onFocus={e => e.currentTarget.style.border = '1.5px solid #2563eb'}
                      onBlur={e => e.currentTarget.style.border = '1px solid #cbd5e1'}
                      placeholder="Hall No."
                    />
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => handleRemoveTimeSlot(slot)}
                        title="Delete Slot"
                        data-testid={`button-delete-${slot}`}
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal for Adding Time Slot */}
      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Add New Time Slot"
        description="Specify the start and end time for the new slot."
        fields={[
          {
            name: 'start',
            label: 'Start Time',
            type: 'text',
            placeholder: 'HH:MM',
            required: true,
            defaultValue: newTimeSlot.start,
          },
          {
            name: 'end',
            label: 'End Time',
            type: 'text',
            placeholder: 'HH:MM',
            required: true,
            defaultValue: newTimeSlot.end,
          },
        ]}
        onSubmit={(data) => {
          setNewTimeSlot({ start: data.start, end: data.end });
          handleAddTimeSlot();
        }}
        submitText="Add Slot"
        cancelText="Cancel"
      />
      <div style={{ marginTop: 16, textAlign: 'right', fontSize: 13, color: '#64748b' }}>
        Last updated: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
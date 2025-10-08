"use client"
import { useState, useCallback, useEffect, useMemo } from 'react';


import { useAuth } from '@/app/context/AuthContext';
import { getTimetable, saveTimetable, getSubjects, getStaff, getAvailableClasses } from '@/services/api';
import { Button } from '@/app/components/ui/Button';
import { FormModal } from '@/app/components/FormModal';

import { PlusIcon, TrashIcon, CalendarIcon } from 'lucide-react';
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
  // Add a new lecture to a time slot
  const handleAddLecture = (day: string, slot: string) => {
    const timetable = { ...activeTimetable };
    const lectures = timetable.schedule[day]?.[slot] || [];
    lectures.push({
      id: Date.now(),
      subject: '',
      teacher: '',
      hall: '',
      class: activeTab,
    });
    timetable.schedule[day][slot] = lectures;
    handleUpdateActiveTimetable(timetable);
  };

  // Delete a specific lecture from a time slot
  const handleDeleteLecture = (day: string, slot: string, lectureId: number) => {
    const timetable = { ...activeTimetable };
    let lectures = timetable.schedule[day]?.[slot] || [];
    lectures = lectures.filter(lec => lec.id !== lectureId);
    timetable.schedule[day][slot] = lectures;
    // If no lectures remain in this slot for this day, remove the slot from all days and from timeSlots
    if (lectures.length === 0) {
      timetable.timeSlots = timetable.timeSlots.filter(s => s !== slot);
      Object.keys(timetable.schedule).forEach(d => {
        delete timetable.schedule[d][slot];
      });
    }
    handleUpdateActiveTimetable(timetable);
  };
  // Add a new lecture to a time slot
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


  // --- Timetable Management Logic ---

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

  const handleAddTimeSlot = (start: string, end: string) => {
    if (!start || !end || start >= end) {
      alert('Invalid time slot. End time must be after start time.');
      return;
    }
    const newSlot = `${start}-${end}`;
    const timetable = { ...activeTimetable };
    if (!timetable.timeSlots.includes(newSlot)) {
      timetable.timeSlots.push(newSlot);
      timetable.timeSlots.sort();
    }
    Object.keys(timetable.schedule).forEach(day => {
      if (!timetable.schedule[day][newSlot]) {
        timetable.schedule[day][newSlot] = [];
      }
    });
    if (!timetable.schedule[selectedDay][newSlot] || timetable.schedule[selectedDay][newSlot].length === 0) {
      timetable.schedule[selectedDay][newSlot] = [{
        id: Date.now(),
        subject: '',
        teacher: '',
        hall: '',
        class: activeTab,
      }];
    }
    handleUpdateActiveTimetable(timetable);
    setIsModalOpen(false);
  };

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
          {[1, 2, 3].map(i => (
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
                {[1, 2, 3, 4].map(i => (
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
                  {[1, 2, 3, 4].map(i => (
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
      <div className={styles.header}>
        <span className={styles.title}>
          <CalendarIcon size={22} className={styles.calendarIcon} />
          Timetable for {activeTab}
        </span>
      </div>
      {/* Tab Navigation */}
      <div className={styles.tabContainer}>
        <div className={styles.tabs}>
          {availableClasses.map((className) => (
            <Button
              key={className}
              onClick={() => setActiveTab(className)}
              className={activeTab === className ? styles.activeTab : styles.tabButton}
            >
              {className}
            </Button>
          ))}
        </div>
      </div>

      {/* Actions + Day Selector */}
      <div className={styles.actions}>
        <label htmlFor="day-select" className={styles.dayLabel}>Day:</label>
        <select
          id="day-select"
          value={selectedDay}
          onChange={e => setSelectedDay(e.target.value)}
          className={styles.daySelect}
        >
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
        <Button onClick={() => setIsModalOpen(true)} className={styles.primaryButton}>
          <PlusIcon size={18} className={styles.plusIcon} /> Add Time Slot
        </Button>
        <Button onClick={handleSaveTimetable} className={styles.saveButton}>
          Save Timetable
        </Button>
      </div>

      {/* Timetable Grid for selected day only */}
      <div className={styles.gridContainer}>
        <table className={styles.timetableGrid}>
          <thead>
            <tr className={styles.dayHeader}>
              <th colSpan={6} className={styles.dayTitle}>{selectedDay}</th>
            </tr>
            <tr className={styles.gridHeader}>
              <th className={styles.gridHeaderCell}>Time</th>
              <th className={styles.gridHeaderCell}>Subject</th>
              <th className={styles.gridHeaderCell}>Teacher</th>
              <th className={styles.gridHeaderCell}>Hall</th>
              <th className={styles.gridHeaderCell}></th>
            </tr>
          </thead>
          <tbody>
            {activeTimetable.timeSlots.map((slot) => {
              const lectures = activeTimetable.schedule[selectedDay]?.[slot];
              if (!lectures || lectures.length === 0) {
                // Don't render anything for empty slots
                return null;
              }
              // If first lecture is a break, render as before
              const isBreak = lectures[0] && (lectures[0].subject === 'Break' || lectures[0].subject === 'Lunch Break');
              if (isBreak) {
                return (
                  <tr key={selectedDay + slot} className={styles.breakRow}>
                    <td className={styles.breakTime}>{slot}</td>
                    <td colSpan={3} className={styles.breakSubject}>{lectures[0].subject}</td>
                    <td></td>
                  </tr>
                );
              }
              return [
                ...lectures.map((lecture, idx) => (
                  <tr key={selectedDay + slot + '-' + lecture.id} className={idx % 2 === 0 ? styles.evenRow : styles.oddRow}>
                    {idx === 0 && (
                      <td className={styles.timeCell} rowSpan={lectures.length}>{slot}</td>
                    )}
                    <td className={styles.subjectCell}>
                      <select
                        value={lecture.subject}
                        onChange={e => handleLectureChange(selectedDay, slot, lecture.id, 'subject', e.target.value)}
                        className={styles.subjectSelect}
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.abbreviation}>{s.name} ({s.abbreviation})</option>)}
                      </select>
                    </td>
                    <td className={styles.teacherCell}>
                      <select
                        value={lecture.teacher}
                        onChange={e => handleLectureChange(selectedDay, slot, lecture.id, 'teacher', e.target.value)}
                        className={styles.teacherSelect}
                      >
                        <option value="">Select Teacher</option>
                        {staff.map(s => <option key={s.id} value={s.full_name}>{s.full_name}</option>)}
                      </select>
                    </td>
                    <td className={styles.hallCell}>
                      <input
                        type="text"
                        value={lecture.hall}
                        onChange={e => handleLectureChange(selectedDay, slot, lecture.id, 'hall', e.target.value)}
                        className={styles.hallInput}
                        placeholder="Hall No."
                      />
                    </td>
                    <td className={styles.actionCell}>
                      <div className={styles.actionButtons}>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleDeleteLecture(selectedDay, slot, lecture.id)}
                          title="Delete Lecture"
                          data-testid={`button-delete-lecture-${slot}-${lecture.id}`}
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )),
                // Add button row for new lecture
                <tr key={selectedDay + slot + '-add'}>
                  <td colSpan={5} className={styles.addLectureCell}>
                    <Button onClick={() => handleAddLecture(selectedDay, slot)} className={styles.addLectureButton}>
                      <PlusIcon size={16} className={styles.plusIcon} /> Add Lecture
                    </Button>
                  </td>
                </tr>
              ];
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
            type: 'time',
            placeholder: 'HH:MM',
            required: true,
            defaultValue: newTimeSlot.start,
          },
          {
            name: 'end',
            label: 'End Time',
            type: 'time',
            placeholder: 'HH:MM',
            required: true,
            defaultValue: newTimeSlot.end,
          },
        ]}
        onSubmit={(data) => {
          handleAddTimeSlot(data.start, data.end);
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
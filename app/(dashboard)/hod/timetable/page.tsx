"use client"
import { useState } from 'react';
import { PlusIcon, EditIcon, TrashIcon, CalendarIcon } from 'lucide-react';
import styles from '@/app/styles/views/TimetableManagement.module.css';

export default function TimetableManagement() {
  const [selectedClass, setSelectedClass] = useState('10A');
  const [selectedDay, setSelectedDay] = useState('monday');

  // TODO: remove mock data functionality - replace with real API calls
  const timeSlots = [
    '08:00 - 08:45',
    '08:45 - 09:30',
    '09:30 - 10:15',
    '10:15 - 10:30', // Break
    '10:30 - 11:15',
    '11:15 - 12:00',
    '12:00 - 12:45',
    '12:45 - 13:30', // Lunch
    '13:30 - 14:15',
    '14:15 - 15:00'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // TODO: remove mock data functionality - replace with real API calls
  const timetableData: { [key: string]: { subject: string; teacher: string; room: string; }[] } = {
    monday: [
      { subject: 'Mathematics', teacher: 'Dr. Wilson', room: '101' },
      { subject: 'Physics', teacher: 'Prof. Davis', room: '102' },
      { subject: 'Chemistry', teacher: 'Ms. Brown', room: '103' },
      { subject: 'Break', teacher: '', room: '' },
      { subject: 'English', teacher: 'Mr. Smith', room: '104' },
      { subject: 'Biology', teacher: 'Mrs. Johnson', room: '105' },
      { subject: 'History', teacher: 'Dr. Lee', room: '106' },
      { subject: 'Lunch Break', teacher: '', room: '' },
      { subject: 'Physical Education', teacher: 'Coach Miller', room: 'Gym' },
      { subject: 'Computer Science', teacher: 'Ms. Garcia', room: 'Lab 1' }
    ],
    tuesday: [
      { subject: 'Chemistry', teacher: 'Ms. Brown', room: '103' },
      { subject: 'Mathematics', teacher: 'Dr. Wilson', room: '101' },
      { subject: 'English', teacher: 'Mr. Smith', room: '104' },
      { subject: 'Break', teacher: '', room: '' },
      { subject: 'Physics', teacher: 'Prof. Davis', room: '102' },
      { subject: 'Biology', teacher: 'Mrs. Johnson', room: '105' },
      { subject: 'Art', teacher: 'Ms. Taylor', room: 'Art Room' },
      { subject: 'Lunch Break', teacher: '', room: '' },
      { subject: 'Geography', teacher: 'Mr. Anderson', room: '107' },
      { subject: 'Music', teacher: 'Mrs. White', room: 'Music Room' }
    ]
  };

  const currentTimetable = timetableData[selectedDay.toLowerCase()] || timetableData.monday;

  return (
    <div className={styles.timetableManagement}>
      <div className={styles.header}>
        <h2 className={styles.title}>Timetable Management</h2>
        <button 
          className={styles.primaryButton}
          onClick={() => console.log('Create new timetable action triggered')}
          data-testid="button-create-timetable"
        >
          <PlusIcon size={20} />
          Create Timetable
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className={styles.filterSelect}
            data-testid="select-class"
          >
            <option value="10A">Class 10A</option>
            <option value="10B">Class 10B</option>
            <option value="11A">Class 11A</option>
            <option value="11B">Class 11B</option>
            <option value="12A">Class 12A</option>
            <option value="12B">Class 12B</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Day:</label>
          <select
            value={selectedDay.toLowerCase()}
            onChange={(e) => setSelectedDay(e.target.value)}
            className={styles.filterSelect}
            data-testid="select-day"
          >
            {days.map(day => (
              <option key={day} value={day.toLowerCase()}>{day}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.timetableContainer}>
        <div className={styles.timetableHeader}>
          <CalendarIcon size={20} />
          <span>Timetable for {selectedClass} - {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}</span>
        </div>

        <div className={styles.timetableGrid}>
          <div className={styles.timeColumn}>
            <div className={styles.columnHeader}>Time</div>
            {timeSlots.map((time, index) => (
              <div key={index} className={styles.timeSlot} data-testid={`time-slot-${index}`}>
                {time}
              </div>
            ))}
          </div>

          <div className={styles.subjectColumn}>
            <div className={styles.columnHeader}>Subject</div>
            {currentTimetable.map((slot: { subject: string; teacher: string; room: string; }, index: number) => (
              <div 
                key={index} 
                className={`${styles.subjectSlot} ${
                  slot.subject === 'Break' || slot.subject === 'Lunch Break' 
                    ? styles.breakSlot 
                    : styles.classSlot
                }`}
                data-testid={`subject-slot-${index}`}
              >
                {slot.subject === 'Break' || slot.subject === 'Lunch Break' ? (
                  <div className={styles.breakContent}>
                    <span className={styles.breakText}>{slot.subject}</span>
                  </div>
                ) : (
                  <div className={styles.classContent}>
                    <div className={styles.subjectName}>{slot.subject}</div>
                    <div className={styles.teacherName}>{slot.teacher}</div>
                    <div className={styles.roomNumber}>Room: {slot.room}</div>
                    <div className={styles.slotActions}>
                      <button
                        className={styles.actionButton}
                        onClick={() => console.log(`Edit slot ${index} action triggered`)}
                        data-testid={`button-edit-slot-${index}`}
                        title="Edit Slot"
                      >
                        <EditIcon size={14} />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => console.log(`Delete slot ${index} action triggered`)}
                        data-testid={`button-delete-slot-${index}`}
                        title="Delete Slot"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
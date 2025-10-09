"use client";
import { useEffect, useRef } from 'react';
import { getTimetablePublic, notifyAbsenteesPublic, startVerificationPublic, stopVerificationPublic } from '@/services/api';
import { useAuth } from '@/app/context/AuthContext';
import { useState } from 'react';

const timeToMinutes = (timeStr: string) => {
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  } catch (e) {
    console.error('Invalid time format:', timeStr);
    return 0;
  }
};

export const useTimetableScheduler = () => {
  const { user, isVerifying, setIsVerifying, currentLecture, setCurrentLecture } = useAuth();
  const isProcessing = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const checkSchedule = async () => {
      if (isProcessing.current) return;
      let activeLecture: any = null;
      try {
        console.log('SCHEDULER: Checking timetable schedules...');
        const allTimetables = await getTimetablePublic();

        if (!allTimetables || typeof allTimetables !== 'object') {
          console.log('SCHEDULER: No timetables available (getTimetablePublic returned empty)');
          return;
        }

  const scheduleToCheck = allTimetables;
  console.log('SCHEDULER: Timetables loaded for classes:', Object.keys(scheduleToCheck));
        if (Object.keys(scheduleToCheck).length === 0) {
          console.log('No timetable schedules available');
          return;
        }

        const now = new Date();
        const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

        for (const className in scheduleToCheck) {
          const timetable = scheduleToCheck[className];
          if (!timetable || !timetable.timeSlots || !Array.isArray(timetable.timeSlots) || !timetable.schedule) {
            continue;
          }

          for (const timeSlot of timetable.timeSlots) {
            const lecturesInSlot = timetable.schedule[dayOfWeek]?.[timeSlot];
            if (lecturesInSlot && lecturesInSlot.length > 0) {
              const targetLecture = lecturesInSlot[0];
              if (targetLecture) {
                const [startTime, endTime] = timeSlot.split('-').map(timeToMinutes);
                if (currentTimeInMinutes >= startTime && currentTimeInMinutes < endTime) {
                  activeLecture = { ...targetLecture, time: timeSlot, class: className };
                  break;
                }
              }
            }
          }
          if (activeLecture) break;
        }

        if (activeLecture && !isVerifying) {
          isProcessing.current = true;
          try {
            console.log(`SCHEDULER: Auto-starting lecture [${activeLecture.subject}] for class [${activeLecture.class}] at slot [${activeLecture.time}]`);
            await startVerificationPublic(activeLecture);
            if (isMounted) {
              setIsVerifying(true);
              setCurrentLecture(activeLecture);
            }
            console.log('SCHEDULER: Verification started successfully (start_verification returned OK)');
          } catch (startError) {
            console.error('SCHEDULER: Failed to start verification:', startError);
          }
        } else if (!activeLecture && isVerifying) {
          isProcessing.current = true;
          try {
            console.log(`SCHEDULER: Auto-stopping lecture [${currentLecture?.subject}] for class [${currentLecture?.class}]`);
            await stopVerificationPublic();

            const today = new Date().toISOString().split('T')[0];
            const notificationPayload: any = {
              date: today,
              subject: currentLecture?.subject,
              teacher: currentLecture?.teacher,
              time_slot: currentLecture?.time,
              student_class: currentLecture?.class,
            };

            console.log('SCHEDULER: Sending absentee notifications to backend...');
            await (notifyAbsenteesPublic as any)(notificationPayload);
            console.log('SCHEDULER: Notification process finished (notify_absentees returned OK).');

            if (isMounted) {
              setIsVerifying(false);
              setCurrentLecture(null);
            }
          } catch (stopError) {
            console.error('SCHEDULER: Failed to stop verification or send notifications:', stopError);
            if (isMounted) {
              setIsVerifying(false);
              setCurrentLecture(null);
            }
          }
        }
      } catch (error) {
        console.error('Error in schedule check:', (error as Error).message);
      } finally {
        if (isMounted) isProcessing.current = false;
      }
    };

    const interval = setInterval(checkSchedule, 15000);
    checkSchedule();
    return () => { isMounted = false; clearInterval(interval); };
  }, [isVerifying, currentLecture, setCurrentLecture, setIsVerifying]);
};

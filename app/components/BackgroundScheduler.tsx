"use client";
import { useTimetableScheduler } from '@/app/hooks/useTimetableScheduler';

export default function BackgroundScheduler() {
  useTimetableScheduler();
  return null;
}

"use client";
import { useState, useEffect } from 'react';
import { getStreamUrl } from '@/services/api';
import styles from './LiveStream.module.css';
import { Card } from '../ui/Card';
import { useAuth } from '@/app/context/AuthContext';

export default function LiveStream() {
  const { isVerifying } = useAuth();
  const [streamUrl, setStreamUrl] = useState('');

  useEffect(() => {
    if (isVerifying) {
      setStreamUrl(`${getStreamUrl()}?t=${new Date().getTime()}`);
    } else {
      setStreamUrl('');
    }
  }, [isVerifying]);

  return (
    <Card>
      <h2>Live Stream</h2>
      <div className={styles.videoContainer}>
        {isVerifying && streamUrl ? (
          // Using img tag for MJPEG / snapshot style stream
          // The stream URL already provides a snapshot endpoint
          // If you use a different streaming mechanism, replace accordingly
          <img src={streamUrl} alt="Live Stream" />
        ) : (
          <div className={styles.placeholder}>Stream is Off</div>
        )}
      </div>
    </Card>
  );
}

'use client'
import { useState } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, ArrowLeft, Trash2, Check } from 'lucide-react';
import styles from '@/app/styles/views/NotificationsPage.module.css';

interface Notification {
  id: number;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationsPageProps {
  onBack?: () => void;
}

const sampleNotifications: Notification[] = [
  {
    id: 1,
    type: 'success',
    title: 'Attendance Updated',
    message: 'Attendance for CS-101 has been successfully recorded.',
    time: '5 minutes ago',
    isRead: false,
  },
  {
    id: 2,
    type: 'info',
    title: 'New Student Enrolled',
    message: 'John Doe has been enrolled in Computer Science department.',
    time: '1 hour ago',
    isRead: false,
  },
  {
    id: 3,
    type: 'warning',
    title: 'Timetable Conflict',
    message: 'Room 204 has been double-booked for Friday 10:00 AM.',
    time: '2 hours ago',
    isRead: true,
  },
  {
    id: 4,
    type: 'info',
    title: 'Report Generated',
    message: 'Monthly attendance report is ready for download.',
    time: '1 day ago',
    isRead: true,
  },
  {
    id: 5,
    type: 'success',
    title: 'New Staff Member Added',
    message: 'Dr. Sarah Johnson has been added to the Mathematics department.',
    time: '2 days ago',
    isRead: true,
  },
  {
    id: 6,
    type: 'warning',
    title: 'Low Attendance Alert',
    message: 'Class CS-202 has attendance below 75% this week.',
    time: '3 days ago',
    isRead: true,
  },
  {
    id: 7,
    type: 'info',
    title: 'Exam Schedule Published',
    message: 'Final exam schedule for semester has been published.',
    time: '5 days ago',
    isRead: true,
  },
];

export default function NotificationsPage({ onBack }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} />;
      case 'warning':
        return <AlertCircle size={24} />;
      case 'info':
      default:
        return <Info size={24} />;
    }
  };

  return (
    <div className={styles.notificationsPage}>
      <div className={styles.headerSection}>
        {onBack && (
          <button 
            className={styles.backButton}
            onClick={onBack}
            data-testid="button-back"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        )}
        
        <div className={styles.titleSection}>
          <div className={styles.titleWrapper}>
            <Bell size={28} />
            <h1 className={styles.pageTitle}>Notifications</h1>
            {unreadCount > 0 && (
              <span className={styles.badge} data-testid="text-unread-count">{unreadCount}</span>
            )}
          </div>
          
          <div className={styles.actions}>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
                onClick={() => setFilter('all')}
                data-testid="button-filter-all"
              >
                All
              </button>
              <button
                className={`${styles.filterButton} ${filter === 'unread' ? styles.active : ''}`}
                onClick={() => setFilter('unread')}
                data-testid="button-filter-unread"
              >
                Unread ({unreadCount})
              </button>
            </div>
            
            {unreadCount > 0 && (
              <button
                className={styles.markAllButton}
                onClick={handleMarkAllAsRead}
                data-testid="button-mark-all-read"
              >
                <Check size={18} />
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.notificationsList}>
        {filteredNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <Bell size={64} />
            <h3>No notifications</h3>
            <p>{filter === 'unread' ? 'You have no unread notifications' : 'Your notifications will appear here'}</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`${styles.notificationCard} ${!notification.isRead ? styles.unread : ''}`}
              data-testid={`notification-${notification.id}`}
            >
              <div className={`${styles.notificationIcon} ${styles[notification.type]}`}>
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className={styles.notificationContent}>
                <div className={styles.notificationHeader}>
                  <h3 className={styles.notificationTitle} data-testid={`notification-title-${notification.id}`}>
                    {notification.title}
                  </h3>
                  {!notification.isRead && <div className={styles.unreadIndicator} data-testid={`notification-unread-${notification.id}`}></div>}
                </div>
                <p className={styles.notificationMessage} data-testid={`notification-message-${notification.id}`}>
                  {notification.message}
                </p>
                <span className={styles.notificationTime} data-testid={`notification-time-${notification.id}`}>
                  {notification.time}
                </span>
              </div>

              <div className={styles.notificationActions}>
                {!notification.isRead && (
                  <button
                    className={styles.actionButton}
                    onClick={() => handleMarkAsRead(notification.id)}
                    title="Mark as read"
                    data-testid={`button-mark-read-${notification.id}`}
                  >
                    <Check size={18} />
                  </button>
                )}
                <button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => handleDelete(notification.id)}
                  title="Delete"
                  data-testid={`button-delete-${notification.id}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

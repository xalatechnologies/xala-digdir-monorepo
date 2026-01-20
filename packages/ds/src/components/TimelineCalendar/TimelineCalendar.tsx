import React, { useState, useEffect, useRef } from 'react';
import { format, addHours, startOfDay, endOfDay, eachHourOfInterval } from 'date-fns';
import { nb } from 'date-fns/locale';
import './TimelineCalendar.css';

/**
 * Timeline Calendar Component
 * 
 * Features:
 * - Hourly timeline view
 * - Multiple rental objects
 * - Drag and drop booking
 * - Conflict visualization
 * - Activity integration
 */

interface Booking {
  id: string;
  rentalObjectId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  user?: {
    name: string;
  };
}

interface Activity {
  id: string;
  rentalObjectId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  category: string;
}

interface RentalObject {
  id: string;
  name: string;
  category: string;
}

interface TimelineCalendarProps {
  date: Date;
  rentalObjects: RentalObject[];
  bookings: Booking[];
  activities?: Activity[];
  onBookingClick?: (booking: Booking) => void;
  onSlotClick?: (rentalObjectId: string, startTime: Date) => void;
  onRefresh?: () => void;
}

export const TimelineCalendar: React.FC<TimelineCalendarProps> = ({
  date,
  rentalObjects,
  bookings,
  activities = [],
  onBookingClick,
  onSlotClick,
  onRefresh,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (timelineRef.current) {
      const currentHour = currentTime.getHours();
      const scrollTarget = currentHour * 60; // 60px per hour
      timelineRef.current.scrollTop = Math.max(0, scrollTarget - 200);
    }
  }, []);

  // Generate hour slots
  const hours = eachHourOfInterval({
    start: startOfDay(date),
    end: endOfDay(date),
  });

  /**
   * Calculate position and height for booking/activity
   */
  const calculatePosition = (startTime: Date, endTime: Date) => {
    const dayStart = startOfDay(date);
    const startMinutes = (startTime.getTime() - dayStart.getTime()) / (1000 * 60);
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

    return {
      top: startMinutes, // 1px per minute
      height: Math.max(durationMinutes, 30), // Minimum 30px
    };
  };

  /**
   * Check if booking has conflicts
   */
  const hasConflict = (booking: Booking): boolean => {
    return bookings.some(
      b =>
        b.id !== booking.id &&
        b.rentalObjectId === booking.rentalObjectId &&
        b.status !== 'CANCELLED' &&
        b.startTime < booking.endTime &&
        b.endTime > booking.startTime
    );
  };

  /**
   * Render booking block
   */
  const renderBooking = (booking: Booking, rentalObjectId: string) => {
    if (booking.rentalObjectId !== rentalObjectId) return null;

    const { top, height } = calculatePosition(booking.startTime, booking.endTime);
    const conflict = hasConflict(booking);

    return (
      <div
        key={booking.id}
        className={`timeline-booking ${booking.status.toLowerCase()} ${conflict ? 'conflict' : ''}`}
        style={{
          top: `${top}px`,
          height: `${height}px`,
        }}
        onClick={() => onBookingClick?.(booking)}
        title={`${booking.title} - ${booking.user?.name || 'Unknown'}`}
      >
        <div className="booking-time">
          {format(booking.startTime, 'HH:mm', { locale: nb })} -{' '}
          {format(booking.endTime, 'HH:mm', { locale: nb })}
        </div>
        <div className="booking-title">{booking.title}</div>
        {conflict && <div className="conflict-badge">⚠️ Konflikt</div>}
      </div>
    );
  };

  /**
   * Render activity block
   */
  const renderActivity = (activity: Activity, rentalObjectId: string) => {
    if (activity.rentalObjectId !== rentalObjectId) return null;

    const { top, height } = calculatePosition(activity.startTime, activity.endTime);

    return (
      <div
        key={activity.id}
        className="timeline-activity"
        style={{
          top: `${top}px`,
          height: `${height}px`,
        }}
        title={activity.title}
      >
        <div className="activity-category">{activity.category}</div>
        <div className="activity-title">{activity.title}</div>
      </div>
    );
  };

  /**
   * Render current time indicator
   */
  const renderNowLine = () => {
    const dayStart = startOfDay(date);
    const isToday = format(date, 'yyyy-MM-dd') === format(currentTime, 'yyyy-MM-dd');

    if (!isToday) return null;

    const minutes = (currentTime.getTime() - dayStart.getTime()) / (1000 * 60);

    return (
      <div
        className="timeline-now-line"
        style={{ top: `${minutes}px` }}
        title={format(currentTime, 'HH:mm', { locale: nb })}
      >
        <div className="now-indicator">
          <span>{format(currentTime, 'HH:mm', { locale: nb })}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="timeline-calendar">
      {/* Header */}
      <div className="timeline-header">
        <div className="timeline-time-column">
          <button onClick={onRefresh} className="refresh-btn" title="Oppdater">
            🔄
          </button>
        </div>
        {rentalObjects.map(ro => (
          <div key={ro.id} className="timeline-resource-header">
            <div className="resource-name">{ro.name}</div>
            <div className="resource-category">{ro.category}</div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="timeline-body" ref={timelineRef}>
        <div className="timeline-content">
          {/* Time labels */}
          <div className="timeline-time-column">
            {hours.map((hour: Date) => (
              <div key={hour.toISOString()} className="timeline-hour-label">
                {format(hour, 'HH:mm', { locale: nb })}
              </div>
            ))}
          </div>

          {/* Resource columns */}
          {rentalObjects.map(ro => (
            <div key={ro.id} className="timeline-resource-column">
              {/* Hour grid */}
              {hours.map((hour: Date) => (
                <div
                  key={hour.toISOString()}
                  className="timeline-hour-slot"
                  onClick={() => onSlotClick?.(ro.id, hour)}
                />
              ))}

              {/* Bookings */}
              {bookings.map(booking => renderBooking(booking, ro.id))}

              {/* Activities */}
              {activities.map(activity => renderActivity(activity, ro.id))}
            </div>
          ))}

          {/* Current time line */}
          {renderNowLine()}
        </div>
      </div>
    </div>
  );
};

export default TimelineCalendar;

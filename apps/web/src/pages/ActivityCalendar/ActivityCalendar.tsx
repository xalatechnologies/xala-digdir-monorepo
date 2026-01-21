import React, { useState } from 'react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { useT } from '@xalatechnologies/platform/i18n';
import { useActivities, type ActivityCategory } from '@digilist/client-sdk/hooks';
import type { Activity } from '@digilist/client-sdk/services';
import './ActivityCalendar.css';

/**
 * Public Activity Calendar
 *
 * Display upcoming classes, events, and activities at venues
 * Features:
 * - Public activity listing
 * - Category filtering
 * - Registration flow
 * - Calendar integration
 */

export const ActivityCalendar: React.FC = () => {
  const t = useT();
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch activities using SDK hook
  const { data: activitiesData, isLoading } = useActivities({
    date: selectedDate.toISOString(),
    category: selectedCategory ?? undefined,
  });
  const activities = activitiesData?.data ?? [];

  const categories: ActivityCategory[] = ['CLASS', 'EVENT', 'TRAINING', 'WORKSHOP', 'MATCH', 'PERFORMANCE'];

  /**
   * Get availability status
   */
  const getAvailability = (activity: Activity) => {
    if (!activity.maxParticipants) return { status: 'UNLIMITED', spotsLeft: null };
    
    const spotsLeft = activity.maxParticipants - activity.currentParticipants;
    if (spotsLeft <= 0) return { status: 'FULL', spotsLeft: 0 };
    if (spotsLeft <= 5) return { status: 'LIMITED', spotsLeft };
    return { status: 'AVAILABLE', spotsLeft };
  };

  return (
    <div className="activity-calendar">
      <div className="activity-header">
        <h1>{t('activityCalendar.page.title')}</h1>
        <p>{t('activityCalendar.page.description')}</p>
      </div>

      {/* Filters */}
      <div className="activity-filters">
        <button
          onClick={() => setSelectedCategory(null)}
          className={!selectedCategory ? 'filter-btn active' : 'filter-btn'} type="button"
        >
          {t('activityCalendar.all')}
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={selectedCategory === cat ? 'filter-btn active' : 'filter-btn'} type="button"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Activities Grid */}
      {isLoading ? (
        <div className="loading">{t('state.loading')}</div>
      ) : activities.length === 0 ? (
        <div className="empty-state">
          <p>{t('activityCalendar.noActivities')}</p>
        </div>
      ) : (
        <div className="activities-grid">
          {activities.map((activity: Activity) => {
            const availability = getAvailability(activity);
            
            return (
              <div key={activity.id} className="activity-card">
                {activity.imageUrl && (
                  <div className="activity-image" style={{ backgroundImage: `url(${activity.imageUrl})` }} />
                )}
                
                <div className="activity-content">
                  <div className="activity-category">{activity.category}</div>
                  <h3>{activity.title}</h3>
                  <p className="activity-description">{activity.description}</p>
                  
                  <div className="activity-meta">
                    <div>Location: {activity.rentalObjectName}</div>
                    <div>Time: {format(activity.startTime, 'HH:mm', { locale: nb })}</div>
                    {activity.instructorName && <div>Instructor: {activity.instructorName}</div>}
                    {activity.difficulty && <div>Level: {activity.difficulty}</div>}
                  </div>

                  <div className="activity-footer">
                    <div className="activity-price">
                      {activity.registrationFee > 0
                        ? `${activity.registrationFee} kr`
                        : t('activityCalendar.free')}
                    </div>

                    <div className="activity-availability">
                      {availability.status === 'FULL' ? (
                        <span className="availability-full">{t('activityCalendar.availability.full')}</span>
                      ) : availability.status === 'LIMITED' ? (
                        <span className="availability-limited">
                          {t('activityCalendar.availability.limited', { count: availability.spotsLeft })}
                        </span>
                      ) : (
                        <span className="availability-available">{t('activityCalendar.availability.available')}</span>
                      )}
                    </div>
                  </div>

                  <button
                    className="btn-register"
                    disabled={availability.status === 'FULL'} type="button"
                  >
                    {availability.status === 'FULL' ? t('activityCalendar.availability.full') : t('activityCalendar.register')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityCalendar;

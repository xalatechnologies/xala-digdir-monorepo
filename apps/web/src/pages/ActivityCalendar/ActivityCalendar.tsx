import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
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

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  startTime: Date;
  endTime: Date;
  rentalObjectName: string;
  maxParticipants?: number;
  currentParticipants: number;
  instructorName?: string;
  difficulty?: string;
  registrationFee: number;
  imageUrl?: string;
}

export const ActivityCalendar: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch activities
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', selectedCategory, selectedDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        date: selectedDate.toISOString(),
        ...(selectedCategory && { category: selectedCategory }),
      });
      const response = await fetch(`/api/activities?${params}`);
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
  });

  const categories = ['CLASS', 'EVENT', 'TRAINING', 'WORKSHOP', 'MATCH', 'PERFORMANCE'];

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
        <h1>Aktivitetskalender</h1>
        <p>Finn klasser, arrangementer og aktiviteter</p>
      </div>

      {/* Filters */}
      <div className="activity-filters">
        <button
          onClick={() => setSelectedCategory(null)}
          className={!selectedCategory ? 'filter-btn active' : 'filter-btn'}
        >
          Alle
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={selectedCategory === cat ? 'filter-btn active' : 'filter-btn'}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Activities Grid */}
      {isLoading ? (
        <div className="loading">Laster aktiviteter...</div>
      ) : activities.length === 0 ? (
        <div className="empty-state">
          <p>Ingen aktiviteter funnet</p>
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
                    <div>📍 {activity.rentalObjectName}</div>
                    <div>🕐 {format(activity.startTime, 'HH:mm', { locale: nb })}</div>
                    {activity.instructorName && <div>👤 {activity.instructorName}</div>}
                    {activity.difficulty && <div>📊 {activity.difficulty}</div>}
                  </div>

                  <div className="activity-footer">
                    <div className="activity-price">
                      {activity.registrationFee > 0 
                        ? `${activity.registrationFee} kr` 
                        : 'Gratis'}
                    </div>
                    
                    <div className="activity-availability">
                      {availability.status === 'FULL' ? (
                        <span className="availability-full">Fullt</span>
                      ) : availability.status === 'LIMITED' ? (
                        <span className="availability-limited">
                          Kun {availability.spotsLeft} igjen
                        </span>
                      ) : (
                        <span className="availability-available">Ledig</span>
                      )}
                    </div>
                  </div>

                  <button
                    className="btn-register"
                    disabled={availability.status === 'FULL'}
                  >
                    {availability.status === 'FULL' ? 'Fullt' : 'Meld deg på'}
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

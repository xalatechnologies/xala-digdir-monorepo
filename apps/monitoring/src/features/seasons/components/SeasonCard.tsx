/**
 * Season Card Component
 *
 * Wrapper around @digilist/ui SeasonCard with navigation integration.
 * Uses the shared domain component for consistent UI across apps.
 */

import { useNavigate } from 'react-router-dom';
import { SeasonCard as SharedSeasonCard } from '@digilist/ui';
import type { Season } from '@digilist/client-sdk/types';

interface SeasonCardProps {
  season: Season;
  showActions?: boolean;
}

export function SeasonCard({ season, showActions = true }: SeasonCardProps) {
  const navigate = useNavigate();

  const handleViewDetails = (id: string) => {
    navigate(`/seasons/${id}`);
  };

  const handleApply = (id: string) => {
    navigate(`/seasons/${id}?apply=true`);
  };

  // Map SDK Season type to SeasonCardData
  const seasonData = {
    id: season.id,
    name: season.name,
    description: season.description,
    status: season.status as 'draft' | 'open' | 'closed' | 'cancelled' | 'completed',
    startDate: season.startDate,
    endDate: season.endDate,
    applicationDeadline: season.applicationDeadline,
    totalApplications: season.totalApplications,
    approvedApplications: season.approvedApplications,
  };

  return (
    <SharedSeasonCard
      season={seasonData}
      showActions={showActions}
      onViewDetails={handleViewDetails}
      onApply={handleApply}
    />
  );
}

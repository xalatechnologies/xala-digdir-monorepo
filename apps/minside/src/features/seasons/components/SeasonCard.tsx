/**
 * SeasonCard Wrapper
 * 
 * Thin wrapper that maps SDK Season type to DS SeasonCard props
 * and handles navigation callbacks.
 */

import { useNavigate } from 'react-router-dom';
import { SeasonCard as DSSeasonCard, type SeasonCardData } from '@xala/ds';
import type { Season } from '@digilist/client-sdk/types';

interface SeasonCardWrapperProps {
  season: Season;
  showActions?: boolean;
}

/**
 * Maps SDK Season to DS SeasonCardData
 */
function mapSeasonToCardData(season: Season): SeasonCardData {
  return {
    id: season.id,
    name: season.name,
    description: season.description,
    status: season.status as SeasonCardData['status'],
    startDate: season.startDate,
    endDate: season.endDate,
    applicationDeadline: season.applicationDeadline,
    totalApplications: season.totalApplications,
    approvedApplications: season.approvedApplications,
  };
}

export function SeasonCard({ season, showActions = true }: SeasonCardWrapperProps) {
  const navigate = useNavigate();

  return (
    <DSSeasonCard
      season={mapSeasonToCardData(season)}
      showActions={showActions}
      onViewDetails={(id) => navigate(`/seasons/${id}`)}
      onApply={(id) => navigate(`/seasons/${id}?apply=true`)}
    />
  );
}

import {
  InfoIcon,
  ImageIcon,
  MapPinIcon,
  ClipboardListIcon,
  ListIcon,
  CalendarIcon,
  GlobeIcon,
  StarIcon,
  GridIcon,
} from '@xalatechnologies/platform/ui';
import { WizardStepId } from '../../types';

export const WIZARD_ICONS: Record<WizardStepId, React.ReactNode> = {
  category: <GridIcon />,
  basics: <InfoIcon />,
  details: <MapPinIcon />, // Combines location + capacity
  resources: <ClipboardListIcon />, // Combines inventory + pickup
  availability: <CalendarIcon />, // Combines opening-hours + schedule + booking
  packages: <ListIcon />,
  media: <ImageIcon />,
  content: <GlobeIcon />,
  review: <StarIcon />,
};

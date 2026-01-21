import { Paragraph } from '@xalatechnologies/platform/ui';
import { useT } from '@xala/i18n';

interface RentalObjectAvailabilityTabProps {
  rentalObjectId: string;
  rentalObjectName: string;
}

export function RentalObjectAvailabilityTab({ rentalObjectId, rentalObjectName }: RentalObjectAvailabilityTabProps) {
  const t = useT();
  return (
    <Paragraph>
      {t('common.todo_implement_rentalobjectavailabilitytab')} - {rentalObjectName} ({rentalObjectId})
    </Paragraph>
  );
}

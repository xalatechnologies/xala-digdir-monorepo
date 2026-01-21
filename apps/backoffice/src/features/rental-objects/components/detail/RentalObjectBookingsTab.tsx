import { Paragraph } from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';

interface RentalObjectBookingsTabProps {
  rentalObjectId: string;
}

export function RentalObjectBookingsTab({ rentalObjectId }: RentalObjectBookingsTabProps) {
  const t = useT();
  return (
    <Paragraph>
      {t('common.todo_implement_rentalobjectbookingstab')} - {rentalObjectId}
    </Paragraph>
  );
}

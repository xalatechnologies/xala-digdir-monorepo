import { Paragraph } from '@xalatechnologies/platform/ui';
import { useT } from '@xala/i18n';
import type { RentalObject } from '@digilist/client-sdk';

interface RentalObjectOverviewTabProps {
  rentalObject: RentalObject;
}

export function RentalObjectOverviewTab({ rentalObject }: RentalObjectOverviewTabProps) {
  const t = useT();
  return (
    <Paragraph>
      {t('common.todo_implement_rentalobjectoverviewtab')} - {rentalObject.name}
    </Paragraph>
  );
}

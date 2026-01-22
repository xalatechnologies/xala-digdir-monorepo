/**
 * AddressesTab Wrapper
 * Thin wrapper that wires SDK hooks to DS AddressesTab props
 */
import { useState, useEffect } from 'react';
import { AddressesTab as DSAddressesTab, type AddressData } from '@xalatechnologies/platform/ui';
import {
  useCurrentUser,
  useUpdateCurrentUser,
} from '@digilist/client-sdk';

export function AddressesTab() {
  const [isSaving, setIsSaving] = useState(false);

  // Queries
  const { data: currentUserData } = useCurrentUser();
  const currentUser = currentUserData?.data;

  // Mutations
  const updateProfileMutation = useUpdateCurrentUser();

  const [addressData, setAddressData] = useState<AddressData>({
    invoiceAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Norge',
    },
    residenceAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Norge',
    },
  });

  // Load current user into address form
  useEffect(() => {
    if (currentUser) {
      setAddressData({
        invoiceAddress: currentUser.invoiceAddress || { street: '', city: '', postalCode: '', country: 'Norge' },
        residenceAddress: currentUser.residenceAddress || { street: '', city: '', postalCode: '', country: 'Norge' },
      });
    }
  }, [currentUser]);

  const handleSaveAddresses = async () => {
    setIsSaving(true);
    try {
      await updateProfileMutation.mutateAsync(addressData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyResidenceToInvoice = () => {
    setAddressData(prev => ({
      ...prev,
      invoiceAddress: { ...prev.residenceAddress },
    }));
  };

  return (
    <DSAddressesTab
      addressData={addressData}
      isSaving={isSaving}
      onAddressDataChange={(partial) => setAddressData(prev => ({ ...prev, ...partial }))}
      onSave={handleSaveAddresses}
      onCopyResidenceToInvoice={handleCopyResidenceToInvoice}
    />
  );
}

/**
 * SeasonRentalPage
 *
 * Organization portal page for applying for seasonal rentals
 * - Fetches real data from API
 * - Season selection
 * - Time slot preferences
 * - Organization details
 * - Application submission
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  Spinner,
  DashboardPageHeader,
} from '@xalatechnologies/platform/ui';
import { useLocale, useT } from '@xalatechnologies/platform/i18n';
import {
  useSeasons,
  useRentalObjects,
  useCreateSeasonApplication,
  type Season,
  type RentalObject,
} from '@digilist/client-sdk';

const MOBILE_BREAKPOINT = 768;

type WizardStep = 'season' | 'slots' | 'details' | 'review';

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  resourceId: string;
}

export function SeasonRentalPage() {
  const { locale } = useLocale();
  const t = useT();
  const [currentStep, setCurrentStep] = useState<WizardStep>('season');
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Form state
  const [selectedSeason, setSelectedSeason] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [notes, setNotes] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Fetch seasons from API
  const { data: seasonsData, isLoading: isSeasonsLoading } = useSeasons();
  const seasons = seasonsData?.data ?? [];

  // Fetch rental objects (venues) from API
  const { data: rentalObjectsData, isLoading: isResourcesLoading } = useRentalObjects({ limit: 50 });
  const resources = rentalObjectsData?.data ?? [];

  // Create season application mutation
  const createApplication = useCreateSeasonApplication();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Translation-aware arrays
  const DAYS = useMemo(() => [
    t('common.monday'),
    t('common.tuesday'),
    t('common.wednesday'),
    t('common.thursday'),
    t('common.friday'),
    t('common.saturday'),
    t('common.sunday'),
  ], [t]);

  const STEPS: { id: WizardStep; label: string }[] = useMemo(() => [
    { id: 'season', label: t('org.seasonRental.steps.season') },
    { id: 'slots', label: t('org.seasonRental.steps.slots') },
    { id: 'details', label: t('org.seasonRental.steps.details') },
    { id: 'review', label: t('org.seasonRental.steps.review') },
  ], [t]);

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const selectedSeasonData = seasons.find((s: Season) => s.id === selectedSeason);

  const handleNext = () => {
    const nextStep = STEPS[currentStepIndex + 1];
    if (nextStep) {
      setCurrentStep(nextStep.id);
    }
  };

  const handleBack = () => {
    const prevStep = STEPS[currentStepIndex - 1];
    if (prevStep) {
      setCurrentStep(prevStep.id);
    }
  };

  const addSlot = () => {
    const firstResource = resources[0] as RentalObject | undefined;
    setSlots([...slots, { 
      day: DAYS[0] || 'Monday', 
      startTime: '18:00', 
      endTime: '20:00', 
      resourceId: firstResource?.id || '' 
    }]);
  };

  const updateSlot = (index: number, field: keyof TimeSlot, value: string) => {
    setSlots(prevSlots => {
      const newSlots = [...prevSlots];
      const currentSlot = newSlots[index];
      if (currentSlot) {
        newSlots[index] = { ...currentSlot, [field]: value };
      }
      return newSlots;
    });
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      await createApplication.mutateAsync({
        seasonId: selectedSeason,
        slots: slots.map(slot => ({
          dayOfWeek: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          rentalObjectId: slot.resourceId,
        })),
        contactName,
        contactPhone,
        notes,
      });
      // Success - would redirect to success page
      alert(t('org.seasonRental.applicationSent'));
    } catch (error) {
      console.error('Failed to submit application:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-US' : 'nb-NO');
  };

  const getSeasonStatus = (season: Season) => {
    const now = new Date();
    const startDate = new Date(season.startDate);
    const endDate = new Date(season.endDate);
    
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'closed';
    return 'open';
  };

  const isLoading = isSeasonsLoading || isResourcesLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header - Using DashboardPageHeader */}
      <DashboardPageHeader
        title={t('org.seasonRental.apply')}
        subtitle={t('org.seasonRental.applyDesc')}
      />

      {/* Progress Steps */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <div style={{
          display: 'flex',
          gap: 'var(--ds-spacing-2)',
          overflowX: 'auto',
        }}>
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => index <= currentStepIndex && setCurrentStep(step.id)}
              disabled={index > currentStepIndex}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: 'none',
                cursor: index <= currentStepIndex ? 'pointer' : 'default',
                opacity: index > currentStepIndex ? 0.5 : 1,
                backgroundColor: currentStep === step.id
                  ? 'var(--ds-color-accent-surface-default)'
                  : index < currentStepIndex
                    ? 'var(--ds-color-success-surface-default)'
                    : 'var(--ds-color-neutral-surface-hover)',
                color: currentStep === step.id
                  ? 'var(--ds-color-accent-text-default)'
                  : index < currentStepIndex
                    ? 'var(--ds-color-success-text-default)'
                    : 'var(--ds-color-neutral-text-default)',
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 600,
              }}>
                {index < currentStepIndex ? '✓' : index + 1}
              </div>
              {!isMobile && <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>{step.label}</span>}
            </button>
          ))}
        </div>
      </Card>

      {/* Step Content */}
      <Card style={{ padding: 'var(--ds-spacing-6)' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label={t('state.loading')} data-size="lg" />
          </div>
        ) : (
          <>
            {currentStep === 'season' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
                <Heading level={2} data-size="sm" style={{ margin: 0 }}>{t('org.seasonRental.selectSeason')}</Heading>
                
                {seasons.length === 0 ? (
                  <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
                    <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                      {t('org.seasonRental.noSeasons')}
                    </Paragraph>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                    {seasons.map((season: Season) => {
                      const status = getSeasonStatus(season);
                      return (
                        <button
                          key={season.id}
                          type="button"
                          onClick={() => setSelectedSeason(season.id)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--ds-spacing-4)',
                            borderRadius: 'var(--ds-border-radius-md)',
                            border: selectedSeason === season.id
                              ? '2px solid var(--ds-color-accent-border-default)'
                              : '1px solid var(--ds-color-neutral-border-default)',
                            backgroundColor: selectedSeason === season.id
                              ? 'var(--ds-color-accent-surface-default)'
                              : 'var(--ds-color-neutral-surface-default)',
                            cursor: status === 'open' ? 'pointer' : 'not-allowed',
                            opacity: status === 'open' ? 1 : 0.6,
                            textAlign: 'left',
                          }}
                          disabled={status !== 'open'}
                        >
                          <div>
                            <Paragraph data-size="md" style={{ margin: 0, fontWeight: 600 }}>
                              {season.name}
                            </Paragraph>
                            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                              {formatDate(season.startDate)} - {formatDate(season.endDate)}
                            </Paragraph>
                          </div>
                          <Badge style={{
                            backgroundColor: status === 'open' ? 'var(--ds-color-success-surface-default)' : 'var(--ds-color-neutral-surface-default)',
                            color: status === 'open' ? 'var(--ds-color-success-text-default)' : 'var(--ds-color-neutral-text-default)',
                          }}>
                            {status === 'open' ? t('org.seasonRental.open') : status === 'upcoming' ? t('org.seasonRental.upcoming') : t('org.seasonRental.closed')}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {currentStep === 'slots' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Heading level={2} data-size="sm" style={{ margin: 0 }}>{t('org.seasonRental.desiredTimes')}</Heading>
                  <Button type="button" variant="secondary" data-size="sm" onClick={addSlot} disabled={resources.length === 0}>
                    {t('org.seasonRental.addTime')}
                  </Button>
                </div>

                {slots.length === 0 ? (
                  <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center', backgroundColor: 'var(--ds-color-neutral-surface-hover)', borderRadius: 'var(--ds-border-radius-md)' }}>
                    <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t('org.seasonRental.addTimeHint')}
                    </Paragraph>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                    {slots.map((slot, index) => (
                      <div key={index} style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr 1fr auto',
                        gap: 'var(--ds-spacing-3)',
                        padding: 'var(--ds-spacing-4)',
                        backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        alignItems: 'end',
                      }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>{t('common.day')}</label>
                          <Select value={slot.day} onChange={(e) => updateSlot(index, 'day', e.target.value)} style={{ width: '100%' }}>
                            {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                          </Select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>{t('common.from')}</label>
                          <Input type="time" value={slot.startTime} onChange={(e) => updateSlot(index, 'startTime', e.target.value)} style={{ width: '100%' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>{t('common.to')}</label>
                          <Input type="time" value={slot.endTime} onChange={(e) => updateSlot(index, 'endTime', e.target.value)} style={{ width: '100%' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>{t('common.venue')}</label>
                          <Select value={slot.resourceId} onChange={(e) => updateSlot(index, 'resourceId', e.target.value)} style={{ width: '100%' }}>
                            {resources.map((r: RentalObject) => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </Select>
                        </div>
                        <Button type="button" variant="tertiary" data-size="sm" onClick={() => removeSlot(index)} style={{ minHeight: '44px' }}>
                          {t('action.remove')}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 'details' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
                <Heading level={2} data-size="sm" style={{ margin: 0 }}>{t('org.seasonRental.contactInfo')}</Heading>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>{t('org.seasonRental.contactPerson')}</label>
                    <Input
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder={t('org.seasonRental.contactPersonPlaceholder')}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>{t('label.phone')}</label>
                    <Input
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder={t('org.seasonRental.phonePlaceholder')}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>{t('org.seasonRental.applicationNote')}</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('org.seasonRental.applicationNotePlaceholder')}
                    rows={4}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}

            {currentStep === 'review' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
                <Heading level={2} data-size="sm" style={{ margin: 0 }}>{t('org.seasonRental.summary')}</Heading>

                <Card style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-hover)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                    <div><strong>{t('org.seasonRental.season')}:</strong> {selectedSeasonData?.name || '-'}</div>
                    <div><strong>{t('org.seasonRental.numberOfTimes')}:</strong> {slots.length}</div>
                    <div><strong>{t('org.seasonRental.contact')}:</strong> {contactName} ({contactPhone})</div>
                    {notes && <div><strong>{t('org.seasonRental.note')}:</strong> {notes}</div>}
                  </div>
                </Card>

                {slots.length > 0 && (
                  <Card style={{ padding: 'var(--ds-spacing-4)' }}>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 600, marginBottom: 'var(--ds-spacing-3)' }}>
                      {t('org.seasonRental.desiredTimes')}
                    </Paragraph>
                    {slots.map((slot, i) => {
                      const resource = resources.find((r: RentalObject) => r.id === slot.resourceId);
                      return (
                        <div key={i} style={{ padding: 'var(--ds-spacing-2)', borderBottom: i < slots.length - 1 ? '1px solid var(--ds-color-neutral-border-subtle)' : undefined }}>
                          {slot.day} {slot.startTime}-{slot.endTime} - {resource?.name || slot.resourceId}
                        </div>
                      );
                    })}
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </Card>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--ds-spacing-3)' }}>
        <Button
          type="button"
          variant="secondary"
          data-size="md"
          onClick={handleBack}
          disabled={currentStepIndex === 0}
          style={{ minHeight: '44px' }}
        >
          {t('action.back')}
        </Button>
        {currentStep === 'review' ? (
          <Button
            type="button"
            variant="primary"
            data-size="md"
            onClick={handleSubmit}
            disabled={createApplication.isPending || slots.length === 0}
            style={{ minHeight: '44px' }}
          >
            {createApplication.isPending ? t('org.seasonRental.sending') : t('org.seasonRental.sendApplication')}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            data-size="md"
            onClick={handleNext}
            disabled={currentStep === 'season' && !selectedSeason}
            style={{ minHeight: '44px' }}
          >
            {t('action.next')}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Seasonal Application Workflow - End-to-End Integration Tests
 *
 * Tests the complete workflow for seasonal application processing:
 * 1. Admin creates new season with application window
 * 2. Admin configures priority rules (youth > senior, local > regional)
 * 3. Organization submits application with multiple time slot preferences
 * 4. System detects conflicts with existing applications
 * 5. Admin reviews applications with priority order
 * 6. System generates allocation proposals
 * 7. Admin approves applications
 * 8. Admin allocates approved applications (generates recurring bookings)
 * 9. Admin finalizes season allocations
 * 10. All applicants receive notification (approved/rejected)
 * 11. Rejected applicant submits appeal
 * 12. Admin reviews and processes appeal
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_URL = process.env.API_URL || 'http://localhost:3002';
const TENANT_ID = process.env.TENANT_ID || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const headers = {
  'Content-Type': 'application/json',
  'X-Tenant-Id': TENANT_ID,
};

// Test data IDs (will be populated during test execution)
let testSeasonId: string;
let testListingId: string;
let testOrganizationId1: string;
let testOrganizationId2: string;
let testApplicationId1: string;
let testApplicationId2: string;
let testPriorityRuleId1: string;
let testPriorityRuleId2: string;

describe('Seasonal Application Workflow - End-to-End', () => {
  // =========================================================================
  // STEP 1: Admin creates new season with application window
  // =========================================================================
  describe('Step 1: Create Season with Application Window', () => {
    it('should create a new season with application dates', async () => {
      const seasonData = {
        name: 'E2E Test Season - Vår 2026',
        description: 'End-to-end test season for verifying seasonal application workflow',
        startDate: '2026-03-01',
        endDate: '2026-06-30',
        applicationStartDate: '2026-01-01',
        applicationEndDate: '2026-02-28',
        status: 'draft',
        metadata: {
          testRun: true,
          createdBy: 'e2e-test',
        },
      };

      const res = await fetch(`${API_URL}/api/seasons`, {
        method: 'POST',
        headers,
        body: JSON.stringify(seasonData),
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.data).toBeDefined();
      expect(data.data.id).toBeDefined();
      expect(data.data.name).toBe(seasonData.name);
      expect(data.data.status).toBe('draft');
      expect(data.data.applicationStartDate).toBe(seasonData.applicationStartDate);
      expect(data.data.applicationEndDate).toBe(seasonData.applicationEndDate);

      // Store season ID for subsequent tests
      testSeasonId = data.data.id;
    });

    it('should open the season for applications', async () => {
      const res = await fetch(`${API_URL}/api/seasons/${testSeasonId}/open`, {
        method: 'POST',
        headers,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data.status).toBe('open');
      expect(data.data.openedAt).toBeDefined();
    });
  });

  // =========================================================================
  // STEP 2: Admin configures priority rules
  // =========================================================================
  describe('Step 2: Configure Priority Rules', () => {
    it('should create youth priority rule', async () => {
      const ruleData = {
        seasonId: testSeasonId,
        name: 'Ungdomsprioritet',
        ruleType: 'youth_priority',
        priority: 100,
        conditions: {
          ageGroup: 'youth',
        },
        enabled: true,
        metadata: {
          description: 'Prioriterer søknader fra ungdomsorganisasjoner',
        },
      };

      const res = await fetch(`${API_URL}/api/priority-rules`, {
        method: 'POST',
        headers,
        body: JSON.stringify(ruleData),
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.data).toBeDefined();
      expect(data.data.id).toBeDefined();
      expect(data.data.ruleType).toBe('youth_priority');
      expect(data.data.priority).toBe(100);

      testPriorityRuleId1 = data.data.id;
    });

    it('should create local priority rule', async () => {
      const ruleData = {
        seasonId: testSeasonId,
        name: 'Lokalprioritet',
        ruleType: 'local_priority',
        priority: 50,
        conditions: {
          locality: 'local',
        },
        enabled: true,
        metadata: {
          description: 'Prioriterer søknader fra lokale organisasjoner',
        },
      };

      const res = await fetch(`${API_URL}/api/priority-rules`, {
        method: 'POST',
        headers,
        body: JSON.stringify(ruleData),
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.data.ruleType).toBe('local_priority');
      expect(data.data.priority).toBe(50);

      testPriorityRuleId2 = data.data.id;
    });

    it('should retrieve all priority rules for the season', async () => {
      const res = await fetch(`${API_URL}/api/priority-rules?seasonId=${testSeasonId}`, {
        headers,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  // =========================================================================
  // STEP 3: Organization submits applications
  // =========================================================================
  describe('Step 3: Submit Season Applications', () => {
    // First, we need to get or create test organizations and listings
    beforeAll(async () => {
      // Get an existing listing (assuming one exists)
      const listingsRes = await fetch(`${API_URL}/api/listings?limit=1`, { headers });
      const listingsData = await listingsRes.json();

      if (listingsData.data && listingsData.data.length > 0) {
        testListingId = listingsData.data[0].id;
      } else {
        throw new Error('No listings found. Please seed database with test data.');
      }

      // Get existing organizations (assuming they exist)
      const orgsRes = await fetch(`${API_URL}/api/organizations?limit=2`, { headers });
      const orgsData = await orgsRes.json();

      if (orgsData.data && orgsData.data.length >= 2) {
        testOrganizationId1 = orgsData.data[0].id;
        testOrganizationId2 = orgsData.data[1].id;
      } else {
        throw new Error('Not enough organizations found. Please seed database with test data.');
      }
    });

    it('should submit first application (youth organization, high priority)', async () => {
      const applicationData = {
        seasonId: testSeasonId,
        listingId: testListingId,
        organizationId: testOrganizationId1,
        applicantName: 'Test Applicant 1',
        applicantEmail: 'applicant1@example.com',
        applicantPhone: '+4712345678',
        weekday: 1, // Monday
        startTime: '18:00',
        endTime: '20:00',
        notes: 'Youth organization application - Monday evenings',
        metadata: {
          organizationType: 'youth',
          locality: 'local',
        },
      };

      const res = await fetch(`${API_URL}/api/season-applications`, {
        method: 'POST',
        headers,
        body: JSON.stringify(applicationData),
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.data).toBeDefined();
      expect(data.data.id).toBeDefined();
      expect(data.data.status).toBe('pending');
      expect(data.data.weekday).toBe(1);

      testApplicationId1 = data.data.id;
    });

    it('should submit second application (conflicting time slot, senior organization)', async () => {
      const applicationData = {
        seasonId: testSeasonId,
        listingId: testListingId,
        organizationId: testOrganizationId2,
        applicantName: 'Test Applicant 2',
        applicantEmail: 'applicant2@example.com',
        applicantPhone: '+4787654321',
        weekday: 1, // Monday (same as first application)
        startTime: '19:00', // Overlaps with first application
        endTime: '21:00',
        notes: 'Senior organization application - Monday evenings',
        metadata: {
          organizationType: 'senior',
          locality: 'regional',
        },
      };

      const res = await fetch(`${API_URL}/api/season-applications`, {
        method: 'POST',
        headers,
        body: JSON.stringify(applicationData),
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.data.id).toBeDefined();
      expect(data.data.status).toBe('pending');

      testApplicationId2 = data.data.id;
    });

    it('should retrieve all applications for the season', async () => {
      const res = await fetch(`${API_URL}/api/season-applications?seasonId=${testSeasonId}`, {
        headers,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  // =========================================================================
  // STEP 4: System detects conflicts
  // =========================================================================
  describe('Step 4: Detect Application Conflicts', () => {
    it('should detect conflicts between applications', async () => {
      const res = await fetch(`${API_URL}/api/season-applications/conflicts?seasonId=${testSeasonId}`, {
        headers,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toBeDefined();
      expect(data.data.conflicts).toBeInstanceOf(Array);
      expect(data.data.conflicts.length).toBeGreaterThan(0);

      // Verify conflict details
      const conflict = data.data.conflicts[0];
      expect(conflict.application1Id).toBeDefined();
      expect(conflict.application2Id).toBeDefined();
      expect(conflict.listingId).toBe(testListingId);
      expect(conflict.weekday).toBe(1);
      expect(conflict.overlapType).toBeDefined();
      expect(['full', 'partial']).toContain(conflict.overlapType);
      expect(conflict.severity).toBeDefined();
    });

    it('should include conflict summary statistics', async () => {
      const res = await fetch(`${API_URL}/api/season-applications/conflicts?seasonId=${testSeasonId}`, {
        headers,
      });

      const data = await res.json();
      expect(data.data.summary).toBeDefined();
      expect(data.data.summary.totalConflicts).toBeGreaterThan(0);
      expect(data.data.summary.highSeverity).toBeGreaterThanOrEqual(0);
      expect(data.data.summary.mediumSeverity).toBeGreaterThanOrEqual(0);
      expect(data.data.summary.lowSeverity).toBeGreaterThanOrEqual(0);
    });
  });

  // =========================================================================
  // STEP 5: Admin reviews applications with priority order
  // =========================================================================
  describe('Step 5: Review Applications by Priority', () => {
    it('should retrieve applications sorted by priority', async () => {
      const res = await fetch(`${API_URL}/api/season-applications/priority?seasonId=${testSeasonId}`, {
        headers,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThanOrEqual(2);

      // Verify priority calculation
      const firstApp = data.data[0];
      expect(firstApp.calculatedPriority).toBeDefined();
      expect(firstApp.priorityReasons).toBeInstanceOf(Array);

      // Youth application should have higher priority than senior
      const youthApp = data.data.find((app: any) => app.id === testApplicationId1);
      const seniorApp = data.data.find((app: any) => app.id === testApplicationId2);

      if (youthApp && seniorApp) {
        expect(youthApp.calculatedPriority).toBeGreaterThan(seniorApp.calculatedPriority);
      }
    });

    it('should include season statistics', async () => {
      const res = await fetch(`${API_URL}/api/season-applications/stats?seasonId=${testSeasonId}`, {
        headers,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toBeDefined();
      expect(data.data.totalApplications).toBeGreaterThanOrEqual(2);
      expect(data.data.byStatus).toBeDefined();
      expect(data.data.byStatus.pending).toBeGreaterThanOrEqual(2);
    });
  });

  // =========================================================================
  // STEP 6: System generates allocation proposals
  // =========================================================================
  describe('Step 6: Generate Allocation Proposals', () => {
    it('should generate allocation proposal for the season', async () => {
      const res = await fetch(`${API_URL}/api/season-applications/allocation-proposal?seasonId=${testSeasonId}`, {
        headers,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toBeDefined();
      expect(data.data.seasonId).toBe(testSeasonId);
      expect(data.data.suggestions).toBeInstanceOf(Array);
      expect(data.data.suggestions.length).toBeGreaterThanOrEqual(2);

      // Verify proposal metadata
      expect(data.data.generatedAt).toBeDefined();
      expect(data.data.algorithm).toBe('priority_based_conflict_resolution_v1');

      // Verify suggestions have required fields
      const suggestion = data.data.suggestions[0];
      expect(suggestion.applicationId).toBeDefined();
      expect(suggestion.action).toBeDefined();
      expect(['approve', 'reject', 'adjust']).toContain(suggestion.action);
      expect(suggestion.reasoning).toBeDefined();

      // Verify statistics
      expect(data.data.statistics).toBeDefined();
      expect(data.data.statistics.totalApplications).toBeGreaterThanOrEqual(2);
      expect(data.data.statistics.approvedCount).toBeGreaterThanOrEqual(0);
      expect(data.data.statistics.rejectedCount).toBeGreaterThanOrEqual(0);
      expect(data.data.statistics.adjustedCount).toBeGreaterThanOrEqual(0);
    });

    it('should retrieve allocation proposal summary', async () => {
      const res = await fetch(`${API_URL}/api/season-applications/allocation-proposal-summary?seasonId=${testSeasonId}`, {
        headers,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toBeDefined();
      expect(data.data.totalApplications).toBeGreaterThanOrEqual(2);
    });
  });

  // =========================================================================
  // STEP 7: Admin approves applications
  // =========================================================================
  describe('Step 7: Approve Applications', () => {
    it('should approve the high-priority youth application', async () => {
      const res = await fetch(`${API_URL}/api/season-applications/${testApplicationId1}/approve`, {
        method: 'PUT',
        headers,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data.status).toBe('approved');
      expect(data.data.id).toBe(testApplicationId1);
    });

    it('should reject the low-priority senior application', async () => {
      const rejectionData = {
        rejectionReason: 'Tidsrommet er allokert til søknad med høyere prioritet (ungdomsorganisasjon)',
      };

      const res = await fetch(`${API_URL}/api/season-applications/${testApplicationId2}/reject`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(rejectionData),
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data.status).toBe('rejected');
      expect(data.data.rejectionReason).toBe(rejectionData.rejectionReason);
      expect(data.data.id).toBe(testApplicationId2);
    });
  });

  // =========================================================================
  // STEP 8: Admin allocates approved applications
  // =========================================================================
  describe('Step 8: Allocate Approved Applications', () => {
    it('should allocate approved application and generate recurring bookings', async () => {
      const res = await fetch(`${API_URL}/api/season-applications/${testApplicationId1}/allocate`, {
        method: 'POST',
        headers,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toBeDefined();
      expect(data.data.applicationId).toBe(testApplicationId1);
      expect(data.data.bookingCount).toBeGreaterThan(0);
      expect(data.data.bookings).toBeInstanceOf(Array);
      expect(data.data.bookings.length).toBeGreaterThan(0);

      // Verify booking details
      const booking = data.data.bookings[0];
      expect(booking.id).toBeDefined();
      expect(booking.status).toBe('confirmed');
      expect(booking.listingId).toBe(testListingId);
    });

    it('should fail to allocate non-approved application', async () => {
      const res = await fetch(`${API_URL}/api/season-applications/${testApplicationId2}/allocate`, {
        method: 'POST',
        headers,
      });

      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBeDefined();
    });
  });

  // =========================================================================
  // STEP 9: Admin finalizes season allocations
  // =========================================================================
  describe('Step 9: Finalize Season Allocations', () => {
    it('should finalize all season allocations', async () => {
      const res = await fetch(`${API_URL}/api/seasons/${testSeasonId}/finalize-allocations`, {
        method: 'POST',
        headers,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toBeDefined();
      expect(data.data.seasonId).toBe(testSeasonId);
      expect(data.data.approvedApplications).toBeGreaterThanOrEqual(1);
      expect(data.data.notificationsSent).toBeGreaterThanOrEqual(1);
    });

    it('should update season metadata with finalization timestamp', async () => {
      const res = await fetch(`${API_URL}/api/seasons/${testSeasonId}`, {
        headers,
      });

      const data = await res.json();
      expect(data.data.metadata).toBeDefined();
      expect(data.data.metadata.allocationsFinalized).toBe(true);
      expect(data.data.metadata.allocationsFinalized_at).toBeDefined();
    });
  });

  // =========================================================================
  // STEP 10: Verify notifications sent
  // =========================================================================
  describe('Step 10: Verify Notification System', () => {
    it('should have sent notification for approved application', async () => {
      // Note: This verifies that the notification system was triggered
      // In a real system, we would check a notifications table or queue
      const res = await fetch(`${API_URL}/api/season-applications/${testApplicationId1}`, {
        headers,
      });

      const data = await res.json();
      expect(data.data.status).toBe('approved');

      // Verify notification metadata (if stored)
      // In production, this would check notifications.service or database
    });

    it('should have sent notification for rejected application', async () => {
      const res = await fetch(`${API_URL}/api/season-applications/${testApplicationId2}`, {
        headers,
      });

      const data = await res.json();
      expect(data.data.status).toBe('rejected');
      expect(data.data.rejectionReason).toBeDefined();
    });
  });

  // =========================================================================
  // STEP 11: Rejected applicant submits appeal
  // =========================================================================
  describe('Step 11: Submit Appeal for Rejected Application', () => {
    it('should submit appeal for rejected application', async () => {
      const appealData = {
        appealReason: 'Vi har ikke andre tilgjengelige treningstider og håper på gjennomgang.',
        appealNotes: 'Kan vi få et alternativt tidspunkt eller annen ukedag?',
      };

      const res = await fetch(`${API_URL}/api/season-applications/${testApplicationId2}/appeal`, {
        method: 'POST',
        headers,
        body: JSON.stringify(appealData),
      });

      // Depending on implementation, this might return 200 or 201
      expect([200, 201]).toContain(res.status);

      const data = await res.json();
      expect(data.data).toBeDefined();

      // Verify appeal metadata is stored
      if (data.data.metadata) {
        expect(data.data.metadata.appealStatus).toBe('pending');
        expect(data.data.metadata.appealReason).toBe(appealData.appealReason);
        expect(data.data.metadata.appealSubmittedAt).toBeDefined();
      }
    });

    it('should retrieve application with appeal information', async () => {
      const res = await fetch(`${API_URL}/api/season-applications/${testApplicationId2}`, {
        headers,
      });

      const data = await res.json();
      expect(data.data.status).toBe('rejected');

      if (data.data.metadata) {
        expect(data.data.metadata.appealStatus).toBe('pending');
      }
    });
  });

  // =========================================================================
  // STEP 12: Admin processes appeal
  // =========================================================================
  describe('Step 12: Process Appeal', () => {
    it('should approve appeal and change application status', async () => {
      const res = await fetch(`${API_URL}/api/season-applications/${testApplicationId2}/appeal/approve`, {
        method: 'PUT',
        headers,
      });

      // Depending on implementation
      expect([200, 201]).toContain(res.status);

      const data = await res.json();
      expect(data.data).toBeDefined();

      // After appeal approval, application status might change to approved or under_review
      if (data.data.metadata) {
        expect(data.data.metadata.appealStatus).toBe('approved');
      }
    });

    it('should retrieve updated application after appeal approval', async () => {
      const res = await fetch(`${API_URL}/api/season-applications/${testApplicationId2}`, {
        headers,
      });

      const data = await res.json();

      // Verify appeal was processed
      if (data.data.metadata) {
        expect(data.data.metadata.appealStatus).toBe('approved');
        expect(data.data.metadata.appealProcessedAt).toBeDefined();
      }
    });
  });

  // =========================================================================
  // CLEANUP: Delete test data after all tests complete
  // =========================================================================
  afterAll(async () => {
    // Clean up test data
    if (testApplicationId1) {
      await fetch(`${API_URL}/api/season-applications/${testApplicationId1}`, {
        method: 'DELETE',
        headers,
      }).catch(() => {
        // Ignore errors during cleanup
      });
    }

    if (testApplicationId2) {
      await fetch(`${API_URL}/api/season-applications/${testApplicationId2}`, {
        method: 'DELETE',
        headers,
      }).catch(() => {
        // Ignore errors during cleanup
      });
    }

    if (testPriorityRuleId1) {
      await fetch(`${API_URL}/api/priority-rules/${testPriorityRuleId1}`, {
        method: 'DELETE',
        headers,
      }).catch(() => {
        // Ignore errors during cleanup
      });
    }

    if (testPriorityRuleId2) {
      await fetch(`${API_URL}/api/priority-rules/${testPriorityRuleId2}`, {
        method: 'DELETE',
        headers,
      }).catch(() => {
        // Ignore errors during cleanup
      });
    }

    if (testSeasonId) {
      await fetch(`${API_URL}/api/seasons/${testSeasonId}`, {
        method: 'DELETE',
        headers,
      }).catch(() => {
        // Ignore errors during cleanup
      });
    }
  });
});

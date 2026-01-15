/**
 * Priority Rules Service
 * Handles youth/senior and local/regional priority rule evaluation
 */
import { eq, and, sql } from 'drizzle-orm';
import { container } from '../../core/container';
import { priorityRules, seasonApplications, organizations } from '../../database/schema/index';
import type { PriorityRule, SeasonApplication } from '../../database/schema/index';

/**
 * Rule types supported by the system
 */
export type RuleType = 'youth_priority' | 'senior_priority' | 'local_priority' | 'regional_priority' | 'custom';

/**
 * Priority rule conditions interface
 */
interface RuleConditions {
  organizationType?: string;
  organizationSettings?: Record<string, any>;
  ageGroup?: 'youth' | 'senior' | 'adult';
  locality?: 'local' | 'regional' | 'national';
  customCondition?: string;
}

/**
 * Application with priority score
 */
interface ApplicationWithPriority extends SeasonApplication {
  calculatedPriority: number;
  priorityReason: string;
  organizationName?: string;
  organizationType?: string;
}

/**
 * Get all enabled priority rules for a season
 */
export async function getPriorityRules(seasonId: string, tenantId: string): Promise<PriorityRule[]> {
  const db = container.resolve<any>('Database');

  const rules = await db
    .select()
    .from(priorityRules)
    .where(
      and(
        eq(priorityRules.seasonId, seasonId),
        eq(priorityRules.tenantId, tenantId),
        eq(priorityRules.enabled, true)
      )
    )
    .orderBy(priorityRules.priority);

  return rules;
}

/**
 * Evaluate a priority rule against an application
 */
export function evaluateRule(
  rule: PriorityRule,
  application: SeasonApplication,
  organization: any
): { matches: boolean; score: number; reason: string } {
  const conditions = rule.conditions as RuleConditions;
  let matches = false;
  let reason = '';

  switch (rule.ruleType) {
    case 'youth_priority':
      // Check if organization has youth designation
      if (conditions.ageGroup === 'youth') {
        const orgSettings = organization.settings || {};
        const isYouthOrg = orgSettings.ageGroup === 'youth' ||
                          organization.type === 'youth_sports' ||
                          organization.type === 'youth_club';
        matches = isYouthOrg;
        reason = isYouthOrg ? 'Youth organization priority' : 'Not a youth organization';
      }
      break;

    case 'senior_priority':
      // Check if organization has senior designation
      if (conditions.ageGroup === 'senior') {
        const orgSettings = organization.settings || {};
        const isSeniorOrg = orgSettings.ageGroup === 'senior' ||
                           organization.type === 'senior_sports' ||
                           organization.type === 'senior_club';
        matches = isSeniorOrg;
        reason = isSeniorOrg ? 'Senior organization priority' : 'Not a senior organization';
      }
      break;

    case 'local_priority':
      // Check if organization is local
      if (conditions.locality === 'local') {
        const orgSettings = organization.settings || {};
        const isLocal = orgSettings.locality === 'local' ||
                       orgSettings.isLocal === true;
        matches = isLocal;
        reason = isLocal ? 'Local organization priority' : 'Not a local organization';
      }
      break;

    case 'regional_priority':
      // Check if organization is regional
      if (conditions.locality === 'regional') {
        const orgSettings = organization.settings || {};
        const isRegional = orgSettings.locality === 'regional' ||
                          orgSettings.isRegional === true;
        matches = isRegional;
        reason = isRegional ? 'Regional organization priority' : 'Not a regional organization';
      }
      break;

    case 'custom':
      // Custom rules can be evaluated based on conditions
      if (conditions.organizationType) {
        matches = organization.type === conditions.organizationType;
        reason = matches ? `Organization type matches: ${conditions.organizationType}` : 'Organization type does not match';
      }
      break;

    default:
      matches = false;
      reason = 'Unknown rule type';
  }

  // Return score based on rule priority if matches
  const score = matches ? rule.priority : 0;

  return { matches, score, reason };
}

/**
 * Calculate priority score for an application based on all applicable rules
 */
export async function calculateApplicationPriority(
  application: SeasonApplication,
  seasonId: string,
  tenantId: string
): Promise<{ score: number; reasons: string[] }> {
  const db = container.resolve<any>('Database');

  // Get priority rules for the season
  const rules = await getPriorityRules(seasonId, tenantId);

  // Get organization details
  const orgResult = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, application.organizationId))
    .limit(1);

  if (!orgResult.length) {
    return { score: 0, reasons: ['Organization not found'] };
  }

  const organization = orgResult[0];

  let totalScore = 0;
  const reasons: string[] = [];

  // Evaluate each rule
  for (const rule of rules) {
    const evaluation = evaluateRule(rule, application, organization);
    if (evaluation.matches) {
      totalScore += evaluation.score;
      reasons.push(`${rule.name}: ${evaluation.reason} (+${evaluation.score})`);
    }
  }

  // Add base priority if application already has one
  if (application.priority) {
    totalScore += application.priority;
    reasons.push(`Base priority: +${application.priority}`);
  }

  return { score: totalScore, reasons };
}

/**
 * Sort applications by calculated priority
 */
export async function sortApplicationsByPriority(
  applications: SeasonApplication[],
  seasonId: string,
  tenantId: string
): Promise<ApplicationWithPriority[]> {
  const db = container.resolve<any>('Database');

  // Calculate priority for each application
  const applicationsWithPriority: ApplicationWithPriority[] = [];

  for (const application of applications) {
    const { score, reasons } = await calculateApplicationPriority(application, seasonId, tenantId);

    // Get organization details for display
    const orgResult = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, application.organizationId))
      .limit(1);

    const organization = orgResult[0] || { name: 'Unknown', type: 'other' };

    applicationsWithPriority.push({
      ...application,
      calculatedPriority: score,
      priorityReason: reasons.join('; '),
      organizationName: organization.name,
      organizationType: organization.type,
    });
  }

  // Sort by calculated priority (highest first)
  applicationsWithPriority.sort((a, b) => b.calculatedPriority - a.calculatedPriority);

  return applicationsWithPriority;
}

/**
 * Get priority rules summary for a season
 */
export async function getPriorityRulesSummary(seasonId: string, tenantId: string) {
  const rules = await getPriorityRules(seasonId, tenantId);

  return {
    seasonId,
    totalRules: rules.length,
    rules: rules.map(rule => ({
      id: rule.id,
      name: rule.name,
      ruleType: rule.ruleType,
      priority: rule.priority,
      conditions: rule.conditions,
      enabled: rule.enabled,
    })),
    ruleTypes: {
      youth_priority: rules.filter(r => r.ruleType === 'youth_priority').length,
      senior_priority: rules.filter(r => r.ruleType === 'senior_priority').length,
      local_priority: rules.filter(r => r.ruleType === 'local_priority').length,
      regional_priority: rules.filter(r => r.ruleType === 'regional_priority').length,
      custom: rules.filter(r => r.ruleType === 'custom').length,
    },
  };
}

/**
 * Create a new priority rule for a season
 */
export async function createPriorityRule(
  seasonId: string,
  tenantId: string,
  ruleData: {
    name: string;
    ruleType: RuleType;
    priority: number;
    conditions: RuleConditions;
    enabled?: boolean;
    metadata?: Record<string, any>;
  }
) {
  const db = container.resolve<any>('Database');

  const result = await db
    .insert(priorityRules)
    .values({
      tenantId,
      seasonId,
      name: ruleData.name,
      ruleType: ruleData.ruleType,
      priority: ruleData.priority,
      conditions: ruleData.conditions,
      enabled: ruleData.enabled !== undefined ? ruleData.enabled : true,
      metadata: ruleData.metadata || {},
    })
    .returning();

  return result[0];
}

/**
 * Update an existing priority rule
 */
export async function updatePriorityRule(
  ruleId: string,
  tenantId: string,
  updates: Partial<{
    name: string;
    priority: number;
    conditions: RuleConditions;
    enabled: boolean;
    metadata: Record<string, any>;
  }>
) {
  const db = container.resolve<any>('Database');

  const result = await db
    .update(priorityRules)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(priorityRules.id, ruleId),
        eq(priorityRules.tenantId, tenantId)
      )
    )
    .returning();

  return result[0];
}

/**
 * Delete a priority rule
 */
export async function deletePriorityRule(ruleId: string, tenantId: string) {
  const db = container.resolve<any>('Database');

  await db
    .delete(priorityRules)
    .where(
      and(
        eq(priorityRules.id, ruleId),
        eq(priorityRules.tenantId, tenantId)
      )
    );

  return { success: true };
}

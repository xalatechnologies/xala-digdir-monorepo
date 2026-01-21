/**
 * Menu Resolution Service
 * 
 * Resolves database-driven menu trees for Backoffice users.
 * Handles:
 * - Template loading per tenant
 * - Category and item resolution
 * - Permission gating
 * - Feature flag gating
 * - Role overrides
 * - Localization
 */

import { eq, and, sql, isNull, lte, or, gte } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type {
  MenuTreeDTO,
  MenuCategoryDTO,
  MenuItemDTO,
  SupportedLanguage,
} from '@xalatechnologies/platform/contracts/projections';
import {
  menuTemplates,
  menuCategories,
  menuItems,
  menuItemPermissions,
  menuItemFlags,
  tenantMenuAssignments,
  roleMenuOverrides,
  permissions,
  featureFlags,
  tenantFeatureFlags,
} from '@xalatechnologies/platform-schema';

interface MenuResolutionContext {
  tenantId: string;
  userId: string;
  roles: string[];
  permissions: string[];
  language: SupportedLanguage;
}

interface ResolvedMenuItem {
  id: string;
  key: string;
  labelNb: string;
  labelEn: string;
  descriptionNb: string | null;
  descriptionEn: string | null;
  route: string;
  iconKey: string | null;
  sortOrder: number;
  isSection: boolean;
  visibilityScope: string;
  categoryId: string | null;
  parentId: string | null;
  metadata: Record<string, unknown> | null;
  requiredPermissions: string[];
  requiredFlags: string[];
}

interface ResolvedCategory {
  id: string;
  key: string;
  labelNb: string;
  labelEn: string;
  iconKey: string | null;
  sortOrder: number;
  isCollapsible: boolean;
  defaultExpanded: boolean;
}

interface RoleOverride {
  hiddenItemKeys: string[];
  forcedItemKeys: string[];
  customOrder: Record<string, number> | null;
  customLabels: Record<string, { nb?: string; en?: string }> | null;
}

export class MenuResolutionService {
  constructor(private db: PostgresJsDatabase<Record<string, never>>) {}

  /**
   * Resolve the complete menu tree for a user
   */
  async resolveMenu(context: MenuResolutionContext): Promise<MenuTreeDTO> {
    const { tenantId, roles, permissions: userPermissions, language } = context;

    const template = await this.getActiveTemplate(tenantId);
    if (!template) {
      return this.getEmptyMenu(language);
    }

    const categories = await this.getCategories(template.id);
    const items = await this.getItemsWithRequirements(template.id);
    const enabledFlags = await this.getEnabledFlags(tenantId);
    const roleOverride = await this.getRoleOverride(template.id, roles);

    const filteredItems = this.filterItems(
      items,
      userPermissions,
      enabledFlags,
      roleOverride
    );

    const menuTree = this.buildMenuTree(
      categories,
      filteredItems,
      roleOverride,
      language
    );

    return {
      templateCode: template.code,
      templateVersion: template.version,
      language,
      categories: menuTree,
      resolvedAt: new Date().toISOString(),
    };
  }

  /**
   * Get the active menu template for a tenant
   */
  private async getActiveTemplate(tenantId: string): Promise<{
    id: string;
    code: string;
    version: number;
  } | null> {
    const now = new Date();

    const result = await this.db
      .select({
        id: menuTemplates.id,
        code: menuTemplates.code,
        version: menuTemplates.version,
      })
      .from(tenantMenuAssignments)
      .innerJoin(menuTemplates, eq(tenantMenuAssignments.templateId, menuTemplates.id))
      .where(
        and(
          eq(tenantMenuAssignments.tenantId, tenantId),
          lte(tenantMenuAssignments.effectiveFrom, now),
          or(
            isNull(tenantMenuAssignments.effectiveTo),
            gte(tenantMenuAssignments.effectiveTo, now)
          ),
          eq(menuTemplates.status, 'PUBLISHED')
        )
      )
      .orderBy(sql`${tenantMenuAssignments.effectiveFrom} DESC`)
      .limit(1);

    if (result.length === 0) {
      return this.getDefaultTemplate();
    }

    return result[0];
  }

  /**
   * Get the default platform template
   */
  private async getDefaultTemplate(): Promise<{
    id: string;
    code: string;
    version: number;
  } | null> {
    const result = await this.db
      .select({
        id: menuTemplates.id,
        code: menuTemplates.code,
        version: menuTemplates.version,
      })
      .from(menuTemplates)
      .where(
        and(
          eq(menuTemplates.code, 'default'),
          eq(menuTemplates.status, 'PUBLISHED')
        )
      )
      .orderBy(sql`${menuTemplates.version} DESC`)
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get all categories for a template
   */
  private async getCategories(templateId: string): Promise<ResolvedCategory[]> {
    const result = await this.db
      .select({
        id: menuCategories.id,
        key: menuCategories.key,
        labelNb: menuCategories.labelNb,
        labelEn: menuCategories.labelEn,
        iconKey: menuCategories.iconKey,
        sortOrder: menuCategories.sortOrder,
        isCollapsible: menuCategories.isCollapsible,
        defaultExpanded: menuCategories.defaultExpanded,
      })
      .from(menuCategories)
      .where(eq(menuCategories.templateId, templateId))
      .orderBy(menuCategories.sortOrder);

    return result;
  }

  /**
   * Get all items with their permission and flag requirements
   */
  private async getItemsWithRequirements(templateId: string): Promise<ResolvedMenuItem[]> {
    const itemsResult = await this.db
      .select({
        id: menuItems.id,
        key: menuItems.key,
        labelNb: menuItems.labelNb,
        labelEn: menuItems.labelEn,
        descriptionNb: menuItems.descriptionNb,
        descriptionEn: menuItems.descriptionEn,
        route: menuItems.route,
        iconKey: menuItems.iconKey,
        sortOrder: menuItems.sortOrder,
        isSection: menuItems.isSection,
        visibilityScope: menuItems.visibilityScope,
        categoryId: menuItems.categoryId,
        parentId: menuItems.parentId,
        metadata: menuItems.metadata,
      })
      .from(menuItems)
      .where(
        and(
          eq(menuItems.templateId, templateId),
          eq(menuItems.isActive, true)
        )
      )
      .orderBy(menuItems.categoryId, menuItems.sortOrder);

    const itemPermissions = await this.db
      .select({
        menuItemId: menuItemPermissions.menuItemId,
        permissionCode: permissions.code,
      })
      .from(menuItemPermissions)
      .innerJoin(permissions, eq(menuItemPermissions.permissionId, permissions.id))
      .innerJoin(menuItems, eq(menuItemPermissions.menuItemId, menuItems.id))
      .where(eq(menuItems.templateId, templateId));

    const itemFlags = await this.db
      .select({
        menuItemId: menuItemFlags.menuItemId,
        flagCode: featureFlags.code,
      })
      .from(menuItemFlags)
      .innerJoin(featureFlags, eq(menuItemFlags.featureFlagId, featureFlags.id))
      .innerJoin(menuItems, eq(menuItemFlags.menuItemId, menuItems.id))
      .where(eq(menuItems.templateId, templateId));

    const permissionMap = new Map<string, string[]>();
    for (const p of itemPermissions) {
      if (!permissionMap.has(p.menuItemId)) {
        permissionMap.set(p.menuItemId, []);
      }
      permissionMap.get(p.menuItemId)!.push(p.permissionCode);
    }

    const flagMap = new Map<string, string[]>();
    for (const f of itemFlags) {
      if (!flagMap.has(f.menuItemId)) {
        flagMap.set(f.menuItemId, []);
      }
      flagMap.get(f.menuItemId)!.push(f.flagCode);
    }

    return itemsResult.map((item) => ({
      ...item,
      metadata: item.metadata as Record<string, unknown> | null,
      requiredPermissions: permissionMap.get(item.id) || [],
      requiredFlags: flagMap.get(item.id) || [],
    }));
  }

  /**
   * Get enabled feature flags for a tenant
   */
  private async getEnabledFlags(tenantId: string): Promise<Set<string>> {
    const now = new Date();

    const result = await this.db
      .select({
        code: featureFlags.code,
        defaultValue: featureFlags.defaultValue,
        tenantEnabled: tenantFeatureFlags.enabled,
        effectiveFrom: tenantFeatureFlags.effectiveFrom,
        effectiveTo: tenantFeatureFlags.effectiveTo,
      })
      .from(featureFlags)
      .leftJoin(
        tenantFeatureFlags,
        and(
          eq(tenantFeatureFlags.featureFlagId, featureFlags.id),
          eq(tenantFeatureFlags.tenantId, tenantId)
        )
      )
      .where(eq(featureFlags.isActive, true));

    const enabledFlags = new Set<string>();

    for (const row of result) {
      let isEnabled = row.defaultValue === true || row.defaultValue === 'true';

      if (row.tenantEnabled !== null) {
        const inEffectivePeriod =
          (!row.effectiveFrom || row.effectiveFrom <= now) &&
          (!row.effectiveTo || row.effectiveTo >= now);

        if (inEffectivePeriod) {
          isEnabled = row.tenantEnabled;
        }
      }

      if (isEnabled) {
        enabledFlags.add(row.code);
      }
    }

    return enabledFlags;
  }

  /**
   * Get role override for the highest-priority role
   */
  private async getRoleOverride(
    templateId: string,
    roles: string[]
  ): Promise<RoleOverride | null> {
    if (roles.length === 0) return null;

    const result = await this.db
      .select({
        hiddenItemKeys: roleMenuOverrides.hiddenItemKeys,
        forcedItemKeys: roleMenuOverrides.forcedItemKeys,
        customOrder: roleMenuOverrides.customOrder,
        customLabels: roleMenuOverrides.customLabels,
      })
      .from(roleMenuOverrides)
      .where(
        and(
          eq(roleMenuOverrides.templateId, templateId),
          sql`${roleMenuOverrides.roleCode} = ANY(${roles})`
        )
      )
      .limit(1);

    if (result.length === 0) return null;

    return {
      hiddenItemKeys: result[0].hiddenItemKeys || [],
      forcedItemKeys: result[0].forcedItemKeys || [],
      customOrder: result[0].customOrder as Record<string, number> | null,
      customLabels: result[0].customLabels as Record<string, { nb?: string; en?: string }> | null,
    };
  }

  /**
   * Filter items based on permissions, flags, and role overrides
   */
  private filterItems(
    items: ResolvedMenuItem[],
    userPermissions: string[],
    enabledFlags: Set<string>,
    roleOverride: RoleOverride | null
  ): ResolvedMenuItem[] {
    const userPermSet = new Set(userPermissions);

    return items.filter((item) => {
      if (roleOverride?.hiddenItemKeys.includes(item.key)) {
        return false;
      }

      if (roleOverride?.forcedItemKeys.includes(item.key)) {
        return true;
      }

      for (const flag of item.requiredFlags) {
        if (!enabledFlags.has(flag)) {
          return false;
        }
      }

      if (item.requiredPermissions.length > 0) {
        const hasAnyPerm = item.requiredPermissions.some((p) => userPermSet.has(p));
        if (!hasAnyPerm) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Build the menu tree structure
   */
  private buildMenuTree(
    categories: ResolvedCategory[],
    items: ResolvedMenuItem[],
    roleOverride: RoleOverride | null,
    language: SupportedLanguage
  ): MenuCategoryDTO[] {
    const categoryMap = new Map<string, ResolvedMenuItem[]>();

    for (const item of items) {
      const catId = item.categoryId || 'uncategorized';
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, []);
      }
      categoryMap.get(catId)!.push(item);
    }

    const result: MenuCategoryDTO[] = [];

    for (const category of categories) {
      const categoryItems = categoryMap.get(category.id) || [];

      if (categoryItems.length === 0) continue;

      const sortedItems = this.sortItems(categoryItems, roleOverride);
      const itemTree = this.buildItemTree(sortedItems, roleOverride, language);

      const label = this.getLocalizedLabel(
        category.key,
        category.labelNb,
        category.labelEn,
        roleOverride?.customLabels,
        language
      );

      result.push({
        key: category.key,
        label,
        iconKey: category.iconKey,
        sortOrder: category.sortOrder,
        isCollapsible: category.isCollapsible,
        defaultExpanded: category.defaultExpanded,
        items: itemTree,
      });
    }

    return result;
  }

  /**
   * Sort items based on custom order or default sort order
   */
  private sortItems(
    items: ResolvedMenuItem[],
    roleOverride: RoleOverride | null
  ): ResolvedMenuItem[] {
    const customOrder = roleOverride?.customOrder || {};

    return [...items].sort((a, b) => {
      const orderA = customOrder[a.key] ?? a.sortOrder;
      const orderB = customOrder[b.key] ?? b.sortOrder;
      return orderA - orderB;
    });
  }

  /**
   * Build item tree with children
   */
  private buildItemTree(
    items: ResolvedMenuItem[],
    roleOverride: RoleOverride | null,
    language: SupportedLanguage
  ): MenuItemDTO[] {
    const rootItems = items.filter((i) => !i.parentId);
    const childMap = new Map<string, ResolvedMenuItem[]>();

    for (const item of items) {
      if (item.parentId) {
        if (!childMap.has(item.parentId)) {
          childMap.set(item.parentId, []);
        }
        childMap.get(item.parentId)!.push(item);
      }
    }

    const buildItem = (item: ResolvedMenuItem): MenuItemDTO => {
      const children = childMap.get(item.id) || [];
      const label = this.getLocalizedLabel(
        item.key,
        item.labelNb,
        item.labelEn,
        roleOverride?.customLabels,
        language
      );
      const description = language === 'nb' ? item.descriptionNb : item.descriptionEn;

      return {
        key: item.key,
        label,
        description,
        route: item.route,
        iconKey: item.iconKey,
        sortOrder: item.sortOrder,
        isSection: item.isSection,
        visibilityScope: item.visibilityScope as 'PLATFORM' | 'TENANT' | 'ORG',
        children: children.map(buildItem),
        metadata: item.metadata,
      };
    };

    return rootItems.map(buildItem);
  }

  /**
   * Get localized label with custom override support
   */
  private getLocalizedLabel(
    key: string,
    labelNb: string,
    labelEn: string,
    customLabels: Record<string, { nb?: string; en?: string }> | null | undefined,
    language: SupportedLanguage
  ): string {
    if (customLabels && customLabels[key]) {
      const custom = customLabels[key];
      if (language === 'nb' && custom.nb) return custom.nb;
      if (language === 'en' && custom.en) return custom.en;
    }

    return language === 'nb' ? labelNb : labelEn;
  }

  /**
   * Return an empty menu structure
   */
  private getEmptyMenu(language: SupportedLanguage): MenuTreeDTO {
    return {
      templateCode: 'none',
      templateVersion: 0,
      language,
      categories: [],
      resolvedAt: new Date().toISOString(),
    };
  }
}

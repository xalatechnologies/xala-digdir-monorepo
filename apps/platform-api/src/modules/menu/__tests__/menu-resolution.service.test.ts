/**
 * Menu Resolution Service - Unit Tests
 * 
 * Tests the menu resolution engine that builds the menu tree
 * based on user roles, permissions, and feature flags.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('MenuResolutionService', () => {
  describe('resolveMenu', () => {
    it('should return empty categories for user with no permissions', async () => {
      const mockDb = createMockDb({
        templates: [{ id: '1', code: 'default', isDefault: true, isActive: true, version: 1 }],
        categories: [],
        items: [],
        itemPermissions: [],
        itemFlags: [],
        tenantFlags: [],
      });

      const service = new MockMenuResolutionService(mockDb);
      const result = await service.resolveMenu({
        tenantId: 'tenant-1',
        userId: 'user-1',
        roles: [],
        permissions: [],
        language: 'nb',
      });

      expect(result.categories).toHaveLength(0);
      expect(result.templateCode).toBe('default');
    });

    it('should filter items by required permissions', async () => {
      const mockDb = createMockDb({
        templates: [{ id: '1', code: 'default', isDefault: true, isActive: true, version: 1 }],
        categories: [
          { id: 'cat-1', key: 'main', templateId: '1', order: 1, labelNb: 'Hovedmeny', labelEn: 'Main Menu' },
        ],
        items: [
          { id: 'item-1', key: 'dashboard', categoryId: 'cat-1', href: '/', iconKey: 'home', order: 1, labelNb: 'Dashboard', labelEn: 'Dashboard' },
          { id: 'item-2', key: 'admin', categoryId: 'cat-1', href: '/admin', iconKey: 'shield', order: 2, labelNb: 'Admin', labelEn: 'Admin' },
        ],
        itemPermissions: [
          { itemId: 'item-2', permissionCode: 'admin:dashboard:view', isRequired: true },
        ],
        itemFlags: [],
        tenantFlags: [],
      });

      const service = new MockMenuResolutionService(mockDb);

      const resultWithoutPerm = await service.resolveMenu({
        tenantId: 'tenant-1',
        userId: 'user-1',
        roles: ['TENANT_USER'],
        permissions: [],
        language: 'nb',
      });

      expect(resultWithoutPerm.categories[0].items).toHaveLength(1);
      expect(resultWithoutPerm.categories[0].items[0].key).toBe('dashboard');

      const resultWithPerm = await service.resolveMenu({
        tenantId: 'tenant-1',
        userId: 'user-1',
        roles: ['TENANT_ADMIN'],
        permissions: ['admin:dashboard:view'],
        language: 'nb',
      });

      expect(resultWithPerm.categories[0].items).toHaveLength(2);
    });

    it('should filter items by feature flags', async () => {
      const mockDb = createMockDb({
        templates: [{ id: '1', code: 'default', isDefault: true, isActive: true, version: 1 }],
        categories: [
          { id: 'cat-1', key: 'main', templateId: '1', order: 1, labelNb: 'Hovedmeny', labelEn: 'Main Menu' },
        ],
        items: [
          { id: 'item-1', key: 'dashboard', categoryId: 'cat-1', href: '/', iconKey: 'home', order: 1, labelNb: 'Dashboard', labelEn: 'Dashboard' },
          { id: 'item-2', key: 'beta-feature', categoryId: 'cat-1', href: '/beta', iconKey: 'star', order: 2, labelNb: 'Beta', labelEn: 'Beta' },
        ],
        itemPermissions: [],
        itemFlags: [
          { itemId: 'item-2', flagCode: 'BETA_FEATURES', isRequired: true },
        ],
        tenantFlags: [],
      });

      const service = new MockMenuResolutionService(mockDb);

      const resultWithoutFlag = await service.resolveMenu({
        tenantId: 'tenant-1',
        userId: 'user-1',
        roles: ['TENANT_USER'],
        permissions: [],
        language: 'nb',
      });

      expect(resultWithoutFlag.categories[0].items).toHaveLength(1);
      expect(resultWithoutFlag.categories[0].items[0].key).toBe('dashboard');

      const serviceWithFlag = new MockMenuResolutionService({
        ...mockDb,
        tenantFlags: [{ tenantId: 'tenant-1', flagCode: 'BETA_FEATURES', isEnabled: true }],
      });

      const resultWithFlag = await serviceWithFlag.resolveMenu({
        tenantId: 'tenant-1',
        userId: 'user-1',
        roles: ['TENANT_USER'],
        permissions: [],
        language: 'nb',
      });

      expect(resultWithFlag.categories[0].items).toHaveLength(2);
    });

    it('should localize labels based on language parameter', async () => {
      const mockDb = createMockDb({
        templates: [{ id: '1', code: 'default', isDefault: true, isActive: true, version: 1 }],
        categories: [
          { id: 'cat-1', key: 'main', templateId: '1', order: 1, labelNb: 'Hovedmeny', labelEn: 'Main Menu' },
        ],
        items: [
          { id: 'item-1', key: 'dashboard', categoryId: 'cat-1', href: '/', iconKey: 'home', order: 1, labelNb: 'Oversikt', labelEn: 'Dashboard' },
        ],
        itemPermissions: [],
        itemFlags: [],
        tenantFlags: [],
      });

      const service = new MockMenuResolutionService(mockDb);

      const resultNb = await service.resolveMenu({
        tenantId: 'tenant-1',
        userId: 'user-1',
        roles: ['TENANT_USER'],
        permissions: [],
        language: 'nb',
      });

      expect(resultNb.categories[0].label).toBe('Hovedmeny');
      expect(resultNb.categories[0].items[0].label).toBe('Oversikt');

      const resultEn = await service.resolveMenu({
        tenantId: 'tenant-1',
        userId: 'user-1',
        roles: ['TENANT_USER'],
        permissions: [],
        language: 'en',
      });

      expect(resultEn.categories[0].label).toBe('Main Menu');
      expect(resultEn.categories[0].items[0].label).toBe('Dashboard');
    });

    it('should apply role overrides for hidden items', async () => {
      const mockDb = createMockDb({
        templates: [{ id: '1', code: 'default', isDefault: true, isActive: true, version: 1 }],
        categories: [
          { id: 'cat-1', key: 'main', templateId: '1', order: 1, labelNb: 'Hovedmeny', labelEn: 'Main Menu' },
        ],
        items: [
          { id: 'item-1', key: 'dashboard', categoryId: 'cat-1', href: '/', iconKey: 'home', order: 1, labelNb: 'Dashboard', labelEn: 'Dashboard' },
          { id: 'item-2', key: 'hidden-for-user', categoryId: 'cat-1', href: '/hidden', iconKey: 'shield', order: 2, labelNb: 'Hidden', labelEn: 'Hidden' },
        ],
        itemPermissions: [],
        itemFlags: [],
        tenantFlags: [],
        roleOverrides: [
          { roleCode: 'TENANT_USER', itemId: 'item-2', isHidden: true },
        ],
      });

      const service = new MockMenuResolutionService(mockDb);

      const resultAsUser = await service.resolveMenu({
        tenantId: 'tenant-1',
        userId: 'user-1',
        roles: ['TENANT_USER'],
        permissions: [],
        language: 'nb',
      });

      expect(resultAsUser.categories[0].items).toHaveLength(1);
      expect(resultAsUser.categories[0].items[0].key).toBe('dashboard');

      const resultAsAdmin = await service.resolveMenu({
        tenantId: 'tenant-1',
        userId: 'user-1',
        roles: ['TENANT_ADMIN'],
        permissions: [],
        language: 'nb',
      });

      expect(resultAsAdmin.categories[0].items).toHaveLength(2);
    });

    it('should sort items by order field', async () => {
      const mockDb = createMockDb({
        templates: [{ id: '1', code: 'default', isDefault: true, isActive: true, version: 1 }],
        categories: [
          { id: 'cat-1', key: 'main', templateId: '1', order: 1, labelNb: 'Hovedmeny', labelEn: 'Main Menu' },
        ],
        items: [
          { id: 'item-3', key: 'third', categoryId: 'cat-1', href: '/third', iconKey: 'chart', order: 3, labelNb: 'Third', labelEn: 'Third' },
          { id: 'item-1', key: 'first', categoryId: 'cat-1', href: '/first', iconKey: 'home', order: 1, labelNb: 'First', labelEn: 'First' },
          { id: 'item-2', key: 'second', categoryId: 'cat-1', href: '/second', iconKey: 'calendar', order: 2, labelNb: 'Second', labelEn: 'Second' },
        ],
        itemPermissions: [],
        itemFlags: [],
        tenantFlags: [],
      });

      const service = new MockMenuResolutionService(mockDb);

      const result = await service.resolveMenu({
        tenantId: 'tenant-1',
        userId: 'user-1',
        roles: ['TENANT_USER'],
        permissions: [],
        language: 'nb',
      });

      expect(result.categories[0].items[0].key).toBe('first');
      expect(result.categories[0].items[1].key).toBe('second');
      expect(result.categories[0].items[2].key).toBe('third');
    });

    it('should exclude empty categories', async () => {
      const mockDb = createMockDb({
        templates: [{ id: '1', code: 'default', isDefault: true, isActive: true, version: 1 }],
        categories: [
          { id: 'cat-1', key: 'has-items', templateId: '1', order: 1, labelNb: 'Has Items', labelEn: 'Has Items' },
          { id: 'cat-2', key: 'empty', templateId: '1', order: 2, labelNb: 'Empty', labelEn: 'Empty' },
        ],
        items: [
          { id: 'item-1', key: 'dashboard', categoryId: 'cat-1', href: '/', iconKey: 'home', order: 1, labelNb: 'Dashboard', labelEn: 'Dashboard' },
        ],
        itemPermissions: [],
        itemFlags: [],
        tenantFlags: [],
      });

      const service = new MockMenuResolutionService(mockDb);

      const result = await service.resolveMenu({
        tenantId: 'tenant-1',
        userId: 'user-1',
        roles: ['TENANT_USER'],
        permissions: [],
        language: 'nb',
      });

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].key).toBe('has-items');
    });

    it('should use tenant-assigned template over default', async () => {
      const mockDb = createMockDb({
        templates: [
          { id: '1', code: 'default', isDefault: true, isActive: true, version: 1 },
          { id: '2', code: 'custom', isDefault: false, isActive: true, version: 1 },
        ],
        tenantAssignments: [
          { tenantId: 'tenant-1', templateId: '2' },
        ],
        categories: [
          { id: 'cat-1', key: 'default-cat', templateId: '1', order: 1, labelNb: 'Default', labelEn: 'Default' },
          { id: 'cat-2', key: 'custom-cat', templateId: '2', order: 1, labelNb: 'Custom', labelEn: 'Custom' },
        ],
        items: [
          { id: 'item-1', key: 'default-item', categoryId: 'cat-1', href: '/default', iconKey: 'home', order: 1, labelNb: 'Default Item', labelEn: 'Default Item' },
          { id: 'item-2', key: 'custom-item', categoryId: 'cat-2', href: '/custom', iconKey: 'star', order: 1, labelNb: 'Custom Item', labelEn: 'Custom Item' },
        ],
        itemPermissions: [],
        itemFlags: [],
        tenantFlags: [],
      });

      const service = new MockMenuResolutionService(mockDb);

      const result = await service.resolveMenu({
        tenantId: 'tenant-1',
        userId: 'user-1',
        roles: ['TENANT_USER'],
        permissions: [],
        language: 'nb',
      });

      expect(result.templateCode).toBe('custom');
      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].key).toBe('custom-cat');
    });
  });
});

interface MockDbData {
  templates: Array<{ id: string; code: string; isDefault: boolean; isActive: boolean; version: number }>;
  tenantAssignments?: Array<{ tenantId: string; templateId: string }>;
  categories: Array<{ id: string; key: string; templateId: string; order: number; labelNb: string; labelEn: string }>;
  items: Array<{ id: string; key: string; categoryId: string; href: string; iconKey: string; order: number; labelNb: string; labelEn: string }>;
  itemPermissions: Array<{ itemId: string; permissionCode: string; isRequired: boolean }>;
  itemFlags: Array<{ itemId: string; flagCode: string; isRequired: boolean }>;
  tenantFlags: Array<{ tenantId: string; flagCode: string; isEnabled: boolean }>;
  roleOverrides?: Array<{ roleCode: string; itemId: string; isHidden?: boolean; customLabel?: string; customOrder?: number }>;
}

function createMockDb(data: MockDbData) {
  return data;
}

interface UserContext {
  tenantId: string;
  userId: string;
  roles: string[];
  permissions: string[];
  language: 'nb' | 'en';
}

interface MenuItemResult {
  key: string;
  label: string;
  description?: string;
  href: string;
  iconKey: string;
  order: number;
  badge?: number;
  badgeColor?: string;
}

interface MenuCategoryResult {
  key: string;
  label: string;
  order: number;
  items: MenuItemResult[];
}

interface MenuTreeResult {
  templateCode: string;
  templateVersion: number;
  language: string;
  categories: MenuCategoryResult[];
  resolvedAt: string;
}

class MockMenuResolutionService {
  constructor(private db: MockDbData) {}

  async resolveMenu(context: UserContext): Promise<MenuTreeResult> {
    const template = this.getTemplate(context.tenantId);
    const categories = this.getCategories(template.id);
    const enabledFlags = this.getEnabledFlags(context.tenantId);
    const roleOverrides = this.getRoleOverrides(context.roles);

    const resolvedCategories: MenuCategoryResult[] = [];

    for (const category of categories) {
      const items = this.getItems(category.id);
      const visibleItems: MenuItemResult[] = [];

      for (const item of items) {
        if (this.isHiddenByOverride(item.id, roleOverrides)) {
          continue;
        }

        if (!this.hasRequiredPermissions(item.id, context.permissions)) {
          continue;
        }

        if (!this.hasRequiredFlags(item.id, enabledFlags)) {
          continue;
        }

        visibleItems.push({
          key: item.key,
          label: context.language === 'nb' ? item.labelNb : item.labelEn,
          href: item.href,
          iconKey: item.iconKey,
          order: item.order,
        });
      }

      if (visibleItems.length > 0) {
        visibleItems.sort((a, b) => a.order - b.order);

        resolvedCategories.push({
          key: category.key,
          label: context.language === 'nb' ? category.labelNb : category.labelEn,
          order: category.order,
          items: visibleItems,
        });
      }
    }

    resolvedCategories.sort((a, b) => a.order - b.order);

    return {
      templateCode: template.code,
      templateVersion: template.version,
      language: context.language,
      categories: resolvedCategories,
      resolvedAt: new Date().toISOString(),
    };
  }

  private getTemplate(tenantId: string) {
    const assignment = this.db.tenantAssignments?.find(a => a.tenantId === tenantId);
    if (assignment) {
      const template = this.db.templates.find(t => t.id === assignment.templateId && t.isActive);
      if (template) return template;
    }
    return this.db.templates.find(t => t.isDefault && t.isActive)!;
  }

  private getCategories(templateId: string) {
    return this.db.categories.filter(c => c.templateId === templateId);
  }

  private getItems(categoryId: string) {
    return this.db.items.filter(i => i.categoryId === categoryId);
  }

  private getEnabledFlags(tenantId: string): string[] {
    return this.db.tenantFlags
      .filter(f => f.tenantId === tenantId && f.isEnabled)
      .map(f => f.flagCode);
  }

  private getRoleOverrides(roles: string[]) {
    return this.db.roleOverrides?.filter(o => roles.includes(o.roleCode)) ?? [];
  }

  private isHiddenByOverride(itemId: string, overrides: Array<{ itemId: string; isHidden?: boolean }>) {
    return overrides.some(o => o.itemId === itemId && o.isHidden);
  }

  private hasRequiredPermissions(itemId: string, userPermissions: string[]): boolean {
    const required = this.db.itemPermissions.filter(p => p.itemId === itemId && p.isRequired);
    if (required.length === 0) return true;
    return required.every(p => userPermissions.includes(p.permissionCode));
  }

  private hasRequiredFlags(itemId: string, enabledFlags: string[]): boolean {
    const required = this.db.itemFlags.filter(f => f.itemId === itemId && f.isRequired);
    if (required.length === 0) return true;
    return required.every(f => enabledFlags.includes(f.flagCode));
  }
}

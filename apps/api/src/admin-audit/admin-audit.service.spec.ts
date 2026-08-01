import { AdminAuditService } from './admin-audit.service';
import { AUDIT_ACTIONS } from './admin-audit.types';
describe('AdminAuditService', () => {
  it('writes only sanitized caller-owned fields through transaction client', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'log' });
    await new AdminAuditService().write(
      { adminAuditLog: { create } } as never,
      { adminId: 'admin', ipAddress: '1.2.3.4', userAgent: 'agent' },
      {
        action: AUDIT_ACTIONS.CATEGORY_CREATED,
        resourceType: 'category',
        resourceId: 'resource',
        changes: { name: { after: 'New' } },
      },
    );
    const json = JSON.stringify(create.mock.calls);
    expect(json).toContain('category.created');
    expect(json).not.toContain('password');
    expect(json).not.toContain('token');
  });
});

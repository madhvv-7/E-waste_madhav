const fs = require('fs');
const path = require('path');

describe('AGENTS.md Documentation', () => {
  let agentsContent;

  beforeAll(() => {
    const agentsPath = path.join(__dirname, '..', '..', 'AGENTS.md');
    agentsContent = fs.readFileSync(agentsPath, 'utf-8');
  });

  describe('Role-Based Access Control Descriptions', () => {
    test('should document all four roles', () => {
      expect(agentsContent).toMatch(/Role-Based Access Control/i);
      expect(agentsContent).toMatch(/\*\*user\*\*/);
      expect(agentsContent).toMatch(/\*\*agent\*\*/);
      expect(agentsContent).toMatch(/\*\*recycler\*\*/);
      expect(agentsContent).toMatch(/\*\*admin\*\*/);
    });

    test('should describe user role permissions', () => {
      expect(agentsContent).toMatch(/user.*Create.*pickup requests/i);
    });

    test('should describe agent role permissions', () => {
      expect(agentsContent).toMatch(/agent.*View assigned requests/i);
      expect(agentsContent).toMatch(/agent.*mark collected/i);
    });

    test('should describe recycler role permissions', () => {
      expect(agentsContent).toMatch(/recycler.*View incoming e-waste/i);
      expect(agentsContent).toMatch(/recycler.*mark as recycled/i);
    });

    test('should describe admin role permissions', () => {
      expect(agentsContent).toMatch(/admin.*View all requests/i);
      expect(agentsContent).toMatch(/admin.*assign agents/i);
    });
  });

  describe('API Route Structure Details', () => {
    test('should document API prefix', () => {
      expect(agentsContent).toMatch(/All routes prefixed with `\/api`/);
    });

    test('should document auth routes', () => {
      expect(agentsContent).toMatch(/`\/auth`.*Registration and login/i);
    });

    test('should document pickup routes with role requirement', () => {
      expect(agentsContent).toMatch(/`\/pickup`.*User pickup requests.*\(user role\)/i);
    });

    test('should document agent routes with role requirement', () => {
      expect(agentsContent).toMatch(/`\/agent`.*Collection agent operations.*\(agent role\)/i);
    });

    test('should document recycler routes with role requirement', () => {
      expect(agentsContent).toMatch(/`\/recycler`.*Recycler operations.*\(recycler role\)/i);
    });

    test('should document admin routes with role requirement', () => {
      expect(agentsContent).toMatch(/`\/admin`.*Admin operations.*\(admin role\)/i);
    });
  });

  describe('Authentication Flow Documentation', () => {
    test('should document JWT token storage', () => {
      expect(agentsContent).toMatch(/JWT tokens stored in localStorage/i);
    });

    test('should document Authorization header format', () => {
      expect(agentsContent).toMatch(/Authorization: Bearer/);
    });

    test('should document AuthContext for auth state management', () => {
      expect(agentsContent).toMatch(/AuthContext\.jsx.*manages auth state/i);
      expect(agentsContent).toMatch(/useAuth\(\)/);
    });

    test('should document axios token injection', () => {
      expect(agentsContent).toMatch(/api\.js.*axios.*token injection/i);
    });

    test('should document server-side auth middleware', () => {
      expect(agentsContent).toMatch(/middleware\/auth\.js/);
      expect(agentsContent).toMatch(/`protect`.*validates JWT/i);
      expect(agentsContent).toMatch(/`authorize\(\.\.\.roles\)`.*role-based access/i);
    });
  });
});

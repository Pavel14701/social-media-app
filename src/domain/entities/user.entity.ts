export type UserAddress = { city: string; country: string; street: string };
export type UserAudit = { action: string; at: Date; actor?: string };
export type UserSecurity = { twoFactorEnabled?: boolean; failedLoginAttempts?: number; lockedUntil?: Date };


export class UserDm {
  id?: string;
  username!: string;
  email!: string;
  passwordHash!: string;
  biography: string = '';
  isAdmin = false;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roles: string[] = [];
  status = 'active';
  lastLoginAt?: Date;
  lastSeenAt?: Date;
  isActive = true;
  conversations: string[] = [];
  friends: string[] = [];
  followers: string[] = [];
  following: string[] = [];
  notificationsEnabled = true;
  preferences: Record<string, string> = {};
  security: UserSecurity = {};
  verified = false;
  birthDate?: Date;
  gender?: string;
  addresses: UserAddress[] = [];
  auditLog: UserAudit[] = [];
  metadata: Record<string, any> = {};
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: Partial<UserDm> = {}) {
    Object.assign(this, props);
  }

  static fromDoc(doc: any): UserDm {
    return new UserDm({
      id: doc._id?.toString(),
      username: doc.username,
      email: doc.email,
      passwordHash: doc.passwordHash,
      biography: doc.biography,
      isAdmin: !!doc.isAdmin,
      firstName: doc.firstName,
      lastName: doc.lastName,
      phoneNumber: doc.phoneNumber,
      avatarUrl: doc.avatarUrl,
      roles: doc.roles ?? [],
      status: doc.status,
      lastLoginAt: doc.lastLoginAt,
      lastSeenAt: doc.lastSeenAt,
      isActive: !!doc.isActive,
      conversations: (doc.conversations ?? []).map((c: any) => c.toString()),
      friends: (doc.friends ?? []).map((f: any) => f.toString()),
      followers: (doc.followers ?? []).map((f: any) => f.toString()),
      following: (doc.following ?? []).map((f: any) => f.toString()),
      notificationsEnabled: !!doc.notificationsEnabled,
      preferences: doc.preferences ? Object.fromEntries(Array.from(doc.preferences.entries())) : {},
      security: doc.security ?? {},
      verified: !!doc.verified,
      birthDate: doc.birthDate,
      gender: doc.gender,
      addresses: (doc.addresses ?? []).map((a: any) => ({ city: a.city, country: a.country, street: a.street })),
      auditLog: (doc.auditLog ?? []).map((a: any) => ({ action: a.action, at: a.at, actor: a.actor?.toString() })),
      metadata: doc.metadata ?? {},
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
export type ConversationAudit = { actor?: string; action: string; at: Date };
export type ConversationRole = { userId: string; role: string };
export type ConversationInvite = { userId: string; invitedAt: Date };
export type ConversationArchivedBy = { userId: string; until?: Date };

export class ConversationDm {
  id?: string;
  recipients: string[] = [];
  isGroup = false;
  title?: string;
  admins: string[] = [];
  lastMessageId?: string;
  lastMessageAt?: Date;
  unreadCounts: Record<string, number> = {};
  mutedUsers: string[] = [];
  pinnedMessageId?: string;
  status = 'active';
  expiresAt?: Date;
  tags: string[] = [];
  blockedUsers: string[] = [];
  lastActivityAt?: Date;
  auditLog: ConversationAudit[] = [];
  roles: ConversationRole[] = [];
  invites: ConversationInvite[] = [];
  archivedBy: ConversationArchivedBy[] = [];
  customSettings: Record<string, any> = {};
  attachmentsIndex: string[] = [];
  conversationType = 'direct';
  priority = 0;
  integrationKeys: { key: string; value: string }[] = [];
  encrypted = false;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: Partial<ConversationDm> = {}) {
    Object.assign(this, props);
  }

  static fromDoc(doc: any): ConversationDm {
    return new ConversationDm({
      id: doc._id?.toString(),
      recipients: (doc.recipients ?? []).map((r: any) => r.toString()),
      isGroup: !!doc.isGroup,
      title: doc.title,
      admins: (doc.admins ?? []).map((a: any) => a.toString()),
      lastMessageId: doc.lastMessageId?.toString(),
      lastMessageAt: doc.lastMessageAt,
      unreadCounts: doc.unreadCounts ? Object.fromEntries(Array.from(doc.unreadCounts.entries())) : {},
      mutedUsers: (doc.mutedUsers ?? []).map((m: any) => m.toString()),
      pinnedMessageId: doc.pinnedMessageId?.toString(),
      status: doc.status,
      expiresAt: doc.expiresAt,
      tags: doc.tags ?? [],
      blockedUsers: (doc.blockedUsers ?? []).map((b: any) => b.toString()),
      lastActivityAt: doc.lastActivityAt,
      auditLog: (doc.auditLog ?? []).map((a: any) => ({ actor: a.actor?.toString(), action: a.action, at: a.at })),
      roles: (doc.roles ?? []).map((r: any) => ({ userId: r.userId.toString(), role: r.role })),
      invites: (doc.invites ?? []).map((i: any) => ({ userId: i.userId.toString(), invitedAt: i.invitedAt })),
      archivedBy: (doc.archivedBy ?? []).map((a: any) => ({ userId: a.userId.toString(), until: a.until })),
      customSettings: doc.customSettings ? Object.fromEntries(Array.from(doc.customSettings.entries())) : {},
      attachmentsIndex: (doc.attachmentsIndex ?? []).map((f: any) => f.toString()),
      conversationType: doc.conversationType,
      priority: doc.priority ?? 0,
      integrationKeys: (doc.integrationKeys ?? []).map((k: any) => ({ key: k.key, value: k.value })),
      encrypted: !!doc.encrypted,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}

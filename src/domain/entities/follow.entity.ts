export class FollowDm {
  id?: string;
  userId!: string;              // кто подписывается
  followingId!: string;         // на кого подписываются

  // новые поля
  status: string = 'active';    // active | pending | blocked
  mutual = false;               // взаимная подписка
  notificationsEnabled = true;
  metadata: Record<string, any> = {};
  source?: string;              // web | mobile | api
  ipAddress?: string;
  deviceId?: string;
  expiresAt?: Date;
  priority = 0;

  // системные даты
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: Partial<FollowDm> = {}) {
    Object.assign(this, props);
  }

  static fromDoc(doc: any): FollowDm {
    return new FollowDm({
      id: doc._id?.toString(),
      userId: doc.userId?.toString(),
      followingId: doc.followingId?.toString(),
      status: doc.status ?? 'active',
      mutual: !!doc.mutual,
      notificationsEnabled: !!doc.notificationsEnabled,
      metadata: doc.metadata ?? {},
      source: doc.source,
      ipAddress: doc.ipAddress,
      deviceId: doc.deviceId,
      expiresAt: doc.expiresAt,
      priority: doc.priority ?? 0,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}

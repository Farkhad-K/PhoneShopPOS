import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  SoftRemoveEvent,
  RemoveEvent,
} from 'typeorm';
import { ClsService } from 'nestjs-cls';

// Define an interface for entities that can be audited
interface AuditableEntity {
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

function isAuditable(entity: unknown): entity is AuditableEntity {
  return !!entity && typeof entity === 'object';
}

@Injectable()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly cls: ClsService,
  ) {
    // register globally
    this.dataSource.subscribers.push(this);
  }

  beforeInsert(event: InsertEvent<unknown>) {
    const userId = this.cls.get<string>('userId');
    const e = event.entity;
    if (!userId || !isAuditable(e)) return;

    if ('createdBy' in e && !e.createdBy) {
      e.createdBy = userId;
    }
    if ('updatedBy' in e) {
      e.updatedBy = userId;
    }
  }

  beforeUpdate(event: UpdateEvent<unknown>) {
    const userId = this.cls.get<string>('userId');
    if (!userId) return;

    const target = event.entity ?? event.databaseEntity;
    if (isAuditable(target) && 'updatedBy' in target) {
      target.updatedBy = userId;
    }
  }

  beforeSoftRemove(event: SoftRemoveEvent<unknown>) {
    const userId = this.cls.get<string>('userId');
    const target = event.entity ?? event.databaseEntity;
    if (!userId || !isAuditable(target)) return;

    if ('deletedBy' in target && !target.deletedBy) {
      target.deletedBy = userId;
    }
  }

  beforeRemove(event: RemoveEvent<unknown>) {
    const userId = this.cls.get<string>('userId');
    const target = event.entity ?? event.databaseEntity;
    if (!userId || !isAuditable(target)) return;

    if ('deletedBy' in target && !target.deletedBy) {
      target.deletedBy = userId;
    }
  }
}

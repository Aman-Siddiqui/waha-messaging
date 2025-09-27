import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { Tenant } from './tenant.entity';
import { WahaSession } from './waha-session.entity';

export enum MessageDirection {
  IN = 'in',
  OUT = 'out',
}

@Entity({ name: 'messages' })
@Index(['external_message_id'], { unique: true })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.messages, { onDelete: 'CASCADE' })
  tenant: Tenant;

  @Column()
  tenantId: string;

  @ManyToOne(() => WahaSession, { onDelete: 'CASCADE' })
  session: WahaSession;

  @Column()
  sessionId: string;

  @Column({ type: 'enum', enum: MessageDirection })
  direction: MessageDirection;

  @Column({ nullable: true })
  to_msisdn: string;

  @Column({ nullable: true })
  from_msisdn: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ default: 'pending' })
  status: string; // pending, sent, delivered, failed, received

  @Column({ nullable: true })
  external_message_id: string; // WAHA’s idempotency / msg id

  @Column({ type: 'jsonb', nullable: true })
  raw: any; // full WAHA payload

  @CreateDateColumn()
  created_at: Date;
}

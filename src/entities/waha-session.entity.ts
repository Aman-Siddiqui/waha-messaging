import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity({ name: 'waha_sessions' })
@Index(['external_session_id'], { unique: true })
export class WahaSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.sessions, { onDelete: 'CASCADE' })
  tenant: Tenant;

  @Column()
  tenantId: string;

  @Column()
  external_session_id: string;

  @Column({ default: 'inactive' })
  status: string; // active, inactive, error

  @Column({ nullable: true })
  engine: string; // e.g., "whatsapp-web.js"

  @Column({ type: 'text', nullable: true })
  last_qr: string; // latest QR code for session start

  @Column({ type: 'jsonb', nullable: true })
  meta: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    Index,
  } from 'typeorm';
  import { User } from './user.entity';
  
  @Entity({ name: 'refresh_tokens' })
  export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => User, (user) => (user.refreshTokens || []), { onDelete: 'CASCADE' })
    user: User;
  
    @Column()
    userId: string;
  
    // store hashed refresh token
    @Column()
    tokenHash: string;
  
    @Index()
    @Column({ type: 'timestamp' })
    expiresAt: Date;
  
    @Column({ default: false })
    revoked: boolean;
  
    @CreateDateColumn()
    created_at: Date;
  }
  
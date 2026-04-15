// order.entity.ts
import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { User } from '../users/user.entity';

// order.entity.ts
@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => User)
  user!: User;

  @Column()
  packageName!: string;

  @Column()
  packageType!: string;

  @Column('decimal')
  amount!: number;

  @Column()
  uniqueCode!: number;

  @Column('decimal')
  totalAmount!: number;

  @Column()
  paymentMethod!: string;

  @Column()
  status!: string;

  @Column({ nullable: true })
  activatedAt?: Date;

  @Column({ nullable: true })
  activatedBy?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
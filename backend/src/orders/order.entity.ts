// order.entity.ts
import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  packageName: string;

  @Column()
  packageType: string;

  @Column()
  amount: number; // harga paket

  @Column()
  uniqueCode: number; // 3 digit dari user ID

  @Column()
  totalAmount: number; // amount + uniqueCode

  @Column({ default: 'transfer' })
  paymentMethod: string; // 'transfer' | 'ewallet'

  @Column({ default: 'pending' })
  status: string; // 'pending' | 'active' | 'rejected'

  @Column({ nullable: true })
  activatedAt: Date;

  @Column({ nullable: true })
  activatedBy: string; // ID admin yang aktifkan

  @CreateDateColumn()
  createdAt: Date;
}
// exam-draft.entity.ts
import {
  Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, Unique
} from 'typeorm';

@Entity('exam_drafts')
@Unique(['userId', 'tryoutId'])
export class ExamDraft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  tryoutId: string;

  @Column({ type: 'jsonb', default: '{}' })
  answers: Record<string, string>;

  @Column({ default: 0 })
  currentSubtest: number;

  @UpdateDateColumn()
  savedAt: Date;
}
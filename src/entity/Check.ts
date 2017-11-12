import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Check {

  @PrimaryGeneratedColumn({ type: "integer" })
  id: string;

  @Column({ type: "datetime", nullable: false })
  timestamp: Date;

  constructor(timestamp: Date) {
    this.timestamp = timestamp;
  }
}
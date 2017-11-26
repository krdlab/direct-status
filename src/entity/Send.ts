import { Entity, PrimaryColumn, Column, OneToOne } from "typeorm";
import { Check } from "./Check";

@Entity()
export class Send {

  // FIXME: @OneToOne(type => Check, check => check.id)
  @PrimaryColumn({ type: "integer" })
  id: string;

  @Column({ type: "datetime", nullable: false })
  timestamp: Date;

  constructor(check :Check, timestamp: Date) {
    this.id = check.id;
    this.timestamp = timestamp;
  }
}
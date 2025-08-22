import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

export enum LinkPrecedence {
  PRIMARY = 'primary',
  SECONDARY = 'secondary'
}

@Table({
  tableName: 'contacts',
  timestamps: true
})
export class Contact extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING)
  phoneNumber?: string;

  @Column(DataType.STRING)
  email?: string;

  @Column(DataType.INTEGER)
  linkedId?: number;

  @Column(DataType.ENUM(...Object.values(LinkPrecedence)))
  linkPrecedence!: LinkPrecedence;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @Column(DataType.DATE)
  deletedAt?: Date;
}

import { Sequelize } from 'sequelize-typescript';
import { Contact } from '../models/Contact';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: 'postgres',
  logging: false,
  models: [Contact]
});

export default sequelize;

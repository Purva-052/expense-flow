import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables manually because this file might be executed 
// directly by the TypeORM CLI, without starting the NestJS application context.
dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'expense_flow',
  // In a real production application, synchronize MUST be false. 
  // We use migrations instead.
  synchronize: false,
  dropSchema: false,
  logging: process.env.NODE_ENV !== 'production',
  // Path to our entities. We will create these shortly.
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  // Path to our migrations
  migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;

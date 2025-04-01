import { Sequelize, DataTypes } from 'sequelize';
import { retry } from 'ts-retry-promise';
import type { PerformanceMetrics } from './types';
import fs from 'fs/promises';

const dialect = process.env.DB_DIALECT || 'postgres';
const sequelize = new Sequelize({
  dialect,
  storage: dialect === 'sqlite' ? 'performance.db' : undefined,
  host: dialect === 'postgres' ? process.env.PM_DB_HOST || 'localhost' : undefined,
  port: dialect === 'postgres' ? Number(process.env.PM_DB_PORT) || 5432 : undefined,
  username: dialect === 'postgres' ? process.env.PM_DB_USER || 'performance_user' : undefined,
  password: dialect === 'postgres' ? process.env.PM_DB_PASSWORD || 'password123' : undefined,
  database: dialect === 'postgres' ? process.env.PM_DB_NAME || 'performance_db' : undefined,
});

const Metric = sequelize.define('Metric', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  someMetric: { type: DataTypes.INTEGER, allowNull: false },
  anotherMetric: { type: DataTypes.STRING, allowNull: false },
  backupSize: { type: DataTypes.INTEGER },
  uploadTime: { type: DataTypes.INTEGER },
  retrievalLatency: { type: DataTypes.INTEGER },
  cid: { type: DataTypes.STRING },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'performance_metrics',
  timestamps: false,
});

export async function logPerformanceMetrics(metrics: PerformanceMetrics): Promise<void> {
  try {
    await retry(async () => {
      await sequelize.authenticate();
      await Metric.sync({ alter: true });
      await Metric.create(metrics);
    }, { retries: 3, delay: 1000 });
    console.log('Logged metrics:', metrics);
  } catch (error) {
    console.error('Failed to log metrics after retries:', error);
    await fs.promises.appendFile('metrics.log', JSON.stringify(metrics) + '\n');
  }
}

// Initialize the table on module load (optional)
(async () => {
  await Metric.sync({ alter: true });
})();
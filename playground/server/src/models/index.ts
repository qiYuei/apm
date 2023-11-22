import fs from 'node:fs';
import path, { posix } from 'path';
import { Sequelize, Model, type ModelStatic } from 'sequelize';
import process from 'process';
import mysql2 from 'mysql2';
import { fileURLToPath, URL } from 'node:url';
import os from 'node:os';

export const isWindows = os.platform() === 'win32';
export function normalizePath(path: string) {
  return posix.normalize(isWindows ? path.replace(/\\/g, '/') : path);
}

const config = {
  username: 'root',
  password: '123456',
  database: 'apm',
  host: 'localhost',
  port: '3308',
  dialect: 'mysql',
};
const db = {} as Record<string, ModelStatic<Model>>;

async function initModels() {
  let sequelize = new Sequelize(config.database, config.username, config.password, {
    dialect: 'mysql',
    dialectModule: mysql2,
    host: 'localhost',
    port: 3308,
  });

  const modelsPath = path.dirname(fileURLToPath(new URL(import.meta.url)));
  console.log(fs.readdirSync(modelsPath));

  const models = fs.readdirSync(modelsPath).filter((file) => {
    return file.indexOf('.') !== 0 && file !== 'index.ts';
  });

  for (let file of models) {
    const modules = await import(`./${file}`);
    debugger;
    const model = await modules.default(sequelize);
    db[model.name] = model;
  }

  // console.log(Object.keys(db), '-------------------------');

  // Object.keys(db).forEach((modelName) => {
  //   if (db[modelName]?.associate) {
  //     db[modelName]?.associate(db);
  //   }
  // });

  // sync table
  await sequelize.sync();

  return { models: db, sequelize, Sequelize };
}

export default initModels;

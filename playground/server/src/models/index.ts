import fs from 'node:fs';
import path, { posix } from 'path';
import { Sequelize, Model, type ModelStatic } from 'sequelize';
import mysql2 from 'mysql2';
import { fileURLToPath, URL } from 'node:url';
import os from 'node:os';
import { IModelsMapping } from './model.type';
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

type ConnectDB = Record<IModelsMapping, ModelStatic<Model>>;

const db = {} as ConnectDB;

interface IConnect {
  models: ConnectDB;
  Sequelize: typeof Sequelize;
  sequelize: Sequelize;
}

let connect: IConnect | null = null;

async function initModels() {
  let sequelize = new Sequelize(config.database, config.username, config.password, {
    dialect: 'mysql',
    dialectModule: mysql2,
    host: 'localhost',
    port: 3308,
    timezone: '+08:00', // 设置正确的时区，比如 '+08:00' 表示东八区
  });

  const modelsPath = path.dirname(fileURLToPath(new URL(import.meta.url)));

  const models = fs.readdirSync(modelsPath).filter((file) => {
    return file.indexOf('.') !== 0 && file !== 'index.ts' && file !== 'model.type.ts';
  });

  function writeDts(mapping: string[]) {
    const dts = mapping.reduce((pre, model, index) => {
      pre += `${index > 0 ? '|' : ''}"${model}"`;
      return pre;
    }, `export type IModelsMapping = `);
    fs.writeFileSync(path.join(modelsPath, 'model.type.ts'), dts);
  }

  for (let file of models) {
    const modules = await import(`./${file}`);
    const model = await modules.default(sequelize);
    // @ts-ignore
    db[model.name] = model;
  }

  writeDts(Object.keys(db));

  // sync table
  await sequelize.sync();

  connect = { models: db, sequelize, Sequelize };
  return connect;
}

export default initModels;

import { Model, Sequelize, DataTypes } from 'sequelize';

class requestBreadcrumb extends Model {}

export default (sequelize: Sequelize) => {
  requestBreadcrumb.init(
    {
      auto_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      sub_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      input: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING,
      },
      body: {
        type: DataTypes.TEXT,
      },
      elapsed_time: {
        type: DataTypes.INTEGER,
      },
      network: {
        type: DataTypes.STRING,
      },
      state: {
        type: DataTypes.INTEGER,
      },
      request_status: {
        type: DataTypes.INTEGER,
      },
      message: {
        type: DataTypes.TEXT,
      },
      timing: {
        type: DataTypes.TEXT,
      },

      user_point: {
        type: DataTypes.STRING,
      },
      notify_level: {
        type: DataTypes.STRING,
      },
      trigger_time: {
        type: DataTypes.DATE,
      },
      report_time: {
        type: DataTypes.DATE,
      },
    },
    { tableName: 'request', sequelize, timestamps: false },
  );

  return requestBreadcrumb;
};

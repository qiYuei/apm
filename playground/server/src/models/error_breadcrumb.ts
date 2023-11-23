import { Model, Sequelize, DataTypes } from 'sequelize';

class errorBreadcrumb extends Model {}

export default (sequelize: Sequelize) => {
  errorBreadcrumb.init(
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
      error_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      brief_message: {
        type: DataTypes.STRING,
      },
      stack: {
        type: DataTypes.TEXT,
      },
      user_point: {
        type: DataTypes.STRING,
      },
      line: {
        type: DataTypes.STRING,
      },
      column: {
        type: DataTypes.STRING,
      },
      page_href: {
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
    { tableName: 'error_breadcrumb', sequelize, timestamps: false },
  );

  return errorBreadcrumb;
};

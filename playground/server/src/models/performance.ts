import { Model, Sequelize, DataTypes } from 'sequelize';

class performanceBreadcrumb extends Model {}

export default (sequelize: Sequelize) => {
  performanceBreadcrumb.init(
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
      indicator: {
        type: DataTypes.INTEGER,
      },
      timing: {
        type: DataTypes.TEXT,
      },
      user_point: {
        type: DataTypes.STRING,
      },
    },
    { tableName: 'performance', sequelize, timestamps: true },
  );

  return performanceBreadcrumb;
};

import { Model, Sequelize, DataTypes } from 'sequelize';

class resourceBreadcrumb extends Model {}

export default (sequelize: Sequelize) => {
  resourceBreadcrumb.init(
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
      tag_name: {
        type: DataTypes.STRING,
      },
      src: {
        type: DataTypes.TEXT,
      },
      page_url: {
        type: DataTypes.STRING,
      },
      out_html: {
        type: DataTypes.STRING,
      },
      user_point: {
        type: DataTypes.STRING,
      },
      start_time: {
        type: DataTypes.DATE,
      },
    },
    { tableName: 'resource', sequelize, timestamps: true },
  );

  return resourceBreadcrumb;
};

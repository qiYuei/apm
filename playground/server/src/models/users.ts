import {
  Model,
  Sequelize,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';

export default (sequelize: Sequelize) => {
  class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static associate(models) {
    //    define association here
    // }
  }
  User.init(
    {
      uid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_agent: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      device: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      last_record: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'users',
    },
  );

  return User;
};

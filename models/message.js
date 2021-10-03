module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'messages'
  });

  return Message;
};

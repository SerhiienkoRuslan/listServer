module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING
    },
    video: {
      type: DataTypes.STRING
    },
    audio: {
      type: DataTypes.STRING
    },
    system: {
      type: DataTypes.BOOLEAN
    },
    sent: {
      type: DataTypes.BOOLEAN
    },
    received: {
      type: DataTypes.BOOLEAN
    },
    pending: {
      type: DataTypes.BOOLEAN
    }
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'messages'
  });

  Message.associate = models => {
    Message.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Message;
};

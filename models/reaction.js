module.exports = (sequelize, DataTypes) => {
  const Reaction = sequelize.define('Reaction', {
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Reaction',
    tableName: 'reactions',
  });

  // Reaction.associate = (models) => {
  //   Reaction.hasMany(models.post, {
  //     // ...
  //   });
  //   Reaction.hasMany(models.comment, {
  //     // ...
  //   });
  //   // OR
  //   models.user.hasMany(models.post, {
  //     // ...
  //   });
  // };

  return Reaction;
};

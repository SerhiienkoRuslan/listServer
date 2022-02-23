module.exports = (sequelize, DataTypes) => {
  const Reaction = sequelize.define('Reaction', {
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
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

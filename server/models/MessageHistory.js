const { Model, DataTypes } = require('sequelize');

const MessageHistory = (sequelize) => {
  class MessageHistoryModel extends Model {}

  MessageHistoryModel.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Tipul mesajului (ex: RESERVATION, ROOM, POS)'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Acțiunea efectuată (ex: CREATE, UPDATE, DELETE)'
    },
    content: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Conținutul mesajului în format JSON'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Metadate adiționale (ex: user, timestamp, etc.)'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data la care mesajul va fi șters automat'
    }
  }, {
    sequelize,
    modelName: 'MessageHistory',
    tableName: 'message_history',
    indexes: [
      {
        name: 'idx_message_type',
        fields: ['type']
      },
      {
        name: 'idx_message_created_at',
        fields: ['createdAt']
      },
      {
        name: 'idx_message_expires_at',
        fields: ['expiresAt']
      }
    ]
  });

  return MessageHistoryModel;
};

module.exports = MessageHistory; 
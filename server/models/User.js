const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

const User = (sequelize) => {
  const UserModel = sequelize.define("User", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Null pentru OAuth și Passkey
    },
    role: {
      type: DataTypes.ENUM("admin", "manager", "staff"),
      defaultValue: "staff",
    },
    authProvider: {
      type: DataTypes.ENUM("local", "gmail", "passkey"),
      defaultValue: "local",
    },
    gmailId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passkeyId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passkeyPublicKey: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  // Hook pentru hash-ul parolei înainte de salvare
  UserModel.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  // Metodă pentru verificarea parolei
  UserModel.prototype.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  };

  return UserModel;
};

module.exports = User;
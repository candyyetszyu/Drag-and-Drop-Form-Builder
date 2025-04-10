const BaseModel = require('./BaseModel');
const bcrypt = require('bcrypt');

class User extends BaseModel {
  static table = 'users';

  static async findByEmail(email) {
    try {
      const [user] = await this.findAll({ email });
      return user || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Failed to find user');
    }
  }

  static async create(userData) {
    try {
      if (!userData.email || !userData.password) {
        throw new Error('Email and password are required');
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      return super.create({ ...userData, password: hashedPassword });
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  static async verifyPassword(email, password) {
    try {
      const user = await this.findByEmail(email);
      if (!user) return false;
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw new Error('Failed to verify password');
    }
  }
}

module.exports = User;
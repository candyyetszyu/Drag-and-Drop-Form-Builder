const { executeQuery } = require('../config/database');

class BaseModel {
  static table = '';

  static async findById(id) {
    try {
      const [result] = await executeQuery(`SELECT * FROM ${this.table} WHERE id = ?`, [id]);
      return result || null;
    } catch (error) {
      console.error('Error finding record by ID:', error);
      throw new Error('Failed to find record');
    }
  }

  static async create(data) {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);
      const sql = `INSERT INTO ${this.table} (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`;
      const { insertId } = await executeQuery(sql, values);
      return { id: insertId, ...data };
    } catch (error) {
      console.error('Error creating record:', error);
      throw new Error('Failed to create record');
    }
  }

  static async update(id, data) {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);
      const setClause = fields.map(field => `${field} = ?`).join(',');
      await executeQuery(`UPDATE ${this.table} SET ${setClause} WHERE id = ?`, [...values, id]);
      return this.findById(id);
    } catch (error) {
      console.error('Error updating record:', error);
      throw new Error('Failed to update record');
    }
  }

  static async delete(id) {
    try {
      await executeQuery(`DELETE FROM ${this.table} WHERE id = ?`, [id]);
    } catch (error) {
      console.error('Error deleting record:', error);
      throw new Error('Failed to delete record');
    }
  }

  static async findAll(conditions = {}) {
    try {
      const whereClause = Object.keys(conditions).length
        ? `WHERE ${Object.keys(conditions).map(field => `${field} = ?`).join(' AND ')}`
        : '';
      return await executeQuery(`SELECT * FROM ${this.table} ${whereClause}`, Object.values(conditions));
    } catch (error) {
      console.error('Error finding records:', error);
      throw new Error('Failed to find records');
    }
  }
}

module.exports = BaseModel;
import l from '../../common/logger';
import User from '../models/User';

class UsersService {
  /**
   * Fetch all users from the database
   */
  async all() {
    l.info(`${this.constructor.name}.all()`);
    try {
      const users = await User.find().select('-password');
      return users;
    } catch (error) {
      return error;
    }
  }

  /**
   * Fetch an existing user by id from the database
   * @param {string} id
   */
  async byId(id) {
    l.info(`${this.constructor.name}.byId(${id})`);
    try {
      const user = await User.findOne({ _id: id }).select('-password');
      return user;
    } catch (error) {
      return error;
    }
  }

  /**
   * Create a new user in the database
   * @param {Object} body
   */
  async create(body) {
    l.info(`${this.constructor.name}.create()`);
    try {
      const user = new User(body);
      const result = await user.save();
      return result;
    } catch (error) {
      return error;
    }
  }

  /**
   * Update an existing user record in the database
   * @param {string} id
   * @param {Object} body
   */
  async update(id, body) {
    l.info(`${this.constructor.name}.update(${id})`);
    try {
      const user = await User.findOneAndUpdate({ _id: id }, body, {
        new: true,
      });
      if (user) {
        return user;
      } else {
        return { error: 'User not found.' };
      }
    } catch (error) {
      return error;
    }
  }

  /**
   * Delete an existing user record in the database
   * @param {string} id
   */
  async delete(id) {
    l.info(`${this.constructor.name}.delete(${id})`);
    try {
      const result = await User.deleteOne({ _id: id });
      return { result: !!result.n };
    } catch (error) {
      return error;
    }
  }
}

export default new UsersService();

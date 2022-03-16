// a model file with methods
// the model file is defining what a book is for our application.
// The model is represented as a class, each book row in the database will be an instance of the book model.
/* 
“Maintains the relationship between Object and Database and handles validation, association, transactions” */
import Client from '../databases/database';
/*  Did you notice or wonder why its the books (plural) table in the database, but the book (singular) file for the model? That's because the database table will hold many books, but the model file is defining what a book is for our application. */
import { User } from '../types/user.type';
// models are a class in our code that can be used as a template to create items that are stored as rows in the table.
/* 
The model is represented as a class, each book row in the database will be an instance of the book model.
 */
import bcrypt from 'bcrypt';
import env from '../middlewares/config';

import hash from '../utilities/hashPassword';
import queries from '../queries/users.queries';

export default class UserStore {
  async index(): Promise<User[]> {
    try {
      const conn = await Client.connect();
      const sql = queries.getUsers;
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get users. Error: ${err}`);
    }
  }

  async show(id: string): Promise<User> {
    try {
      const conn = await Client.connect();
      const sql = queries.getUser;
      const result = await conn.query(sql, [id]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not find user ${id}. Error: ${err}`);
    }
  }

  async create(u: User): Promise<User> {
    try {
      const conn = await Client.connect();
      const sql = queries.addUser;
      const result = await conn.query(sql, [
        u.firstName,
        u.lastName,
        hash(u.password),
      ]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not add new user ${u.firstName}. Error: ${err}`);
    }
  }

  async update(id: string, u: User): Promise<User> {
    try {
      const conn = await Client.connect();
      const sql = queries.updateUser;
      const result = await conn.query(sql, [
        u.firstName,
        u.lastName,
        hash(u.password),
        id,
      ]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not update user ${id}. Error: ${err}`);
    }
  }

  async delete(id: string): Promise<User> {
    try {
      const conn = await Client.connect();
      const sql = queries.removeUser;
      const result = await conn.query(sql, [id]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not delete user ${id}. Error: ${err}`);
    }
  }

  // authenticate a user
  async authenticate(id: string, password: string): Promise<User | null> {
    try {
      const conn = await Client.connect();
      const sql = queries.authenticate;
      const result = await conn.query(sql, [id]);
      console.log(result.rows[0].password);
      console.log(password);
      console.log(password + env.pepper);
      console.log(result.rows[0].password === password);
      console.log(`===================`);
      console.log(
        bcrypt.compareSync(password + env.pepper, result.rows[0].password)
      );
      console.log(`===================`);
      if (result.rows.length) {
        const user = result.rows[0];
        if (bcrypt.compareSync(`${password}${env.pepper}`, user.password)) {
          console.log(user);
          return user;
        }
      }

      conn.release();
      return null;
    } catch (err) {
      throw new Error(`Could not authenticate user ${id}. Error: ${err}`);
    }
  }
}

import {
  enablePromise,
  openDatabase,
  SQLiteDatabase,
} from 'react-native-sqlite-storage';
import IContact from '../interfaces/contact';

enablePromise(true);

export const getDBConnection = async () => {
  return openDatabase({name: 'todo-data.db', location: 'default'});
};

export const createTables = async (db: SQLiteDatabase) => {
  // Contacts
  db.executeSql(`
  CREATE TABLE IF NOT EXISTS Contact (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  `);
};

export const insertContact = async (db: SQLiteDatabase, contact: IContact) => {
  const {name, username} = contact;
  const t = await db.executeSql(
    `INSERT INTO Contact (name, username) VALUES (?, ?)`,
    [name, username],
  );
  return t[0].insertId;
};

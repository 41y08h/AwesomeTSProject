import {
  enablePromise,
  openDatabase,
  SQLiteDatabase,
} from 'react-native-sqlite-storage';
import IContact from '../interfaces/contact';
import {IMessage} from '../interfaces/message';

enablePromise(true);

export const getDBConnection = async () => {
  return openDatabase({name: 'todo-data4.db', location: 'default'});
};

export const createTables = async (db: SQLiteDatabase) => {
  // Contacts
  await db.executeSql(`
  CREATE TABLE IF NOT EXISTS Contact (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  `);
  // Messages
  await db.executeSql(`
  CREATE TABLE IF NOT EXISTS Message (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    text TEXT not null, 
    sender TEXT not null, 
    receiver TEXT not null,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivered_at TEXT,
    read_at TEXT
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

export const getContacts = async (db: SQLiteDatabase): Promise<IContact[]> => {
  const result = await db.executeSql('SELECT * FROM Contact');
  return result[0].rows.raw();
};

export const insertMessage = async (db: SQLiteDatabase, message: IMessage) => {
  const {text, sender, receiver} = message;
  const t = await db.executeSql(
    `INSERT INTO Message (text, sender, receiver) VALUES (?, ?, ?)`,
    [text, sender, receiver],
  );
  return t[0].insertId;
};

export const getMessages = async (
  db: SQLiteDatabase,
  currentUsername: string,
  recipient: string,
): Promise<IMessage[]> => {
  const result = await db.executeSql(
    `SELECT * FROM Message WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)`,
    [currentUsername, recipient, recipient, currentUsername],
  );
  return result[0].rows.raw();
};

export const getRecipients = async (
  db: SQLiteDatabase,
  currentUsername: string,
) => {
  const result = await db.executeSql(
    `
    SELECT coalesce(name, second_person) as name, second_person as username
    from (
      select Contact.name,
      case Message.sender
        when ? then receiver
        ELSE Message.sender
      END second_person
      FROM Message
      LEFT join Contact on Contact.username = second_person
    )
    GROUP by name
    `,
    [currentUsername],
  );
  return result[0].rows.raw();
};

export const updateMessageDeliveryTime = async (
  id: number,
  recipient: string,
) => {
  const db = await getDBConnection();
  await db.executeSql(
    `UPDATE Message SET delivered_at = CURRENT_TIMESTAMP WHERE id = ? AND receiver = ? AND delivered_at IS NULL`,
    [id, recipient],
  );
};

export const updateMessageReadTime = async (recipient: string) => {
  // Set the read_at timestamp of all the messages from the recipient
  const db = await getDBConnection();
  await db.executeSql(
    `UPDATE Message SET read_at = CURRENT_TIMESTAMP WHERE receiver = ? AND read_at IS NULL`,
    [recipient],
  );
};

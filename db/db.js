const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const collectionName = process.env.DB_COLLECTION;

let isConnected = false;
let client = null;
let db = null;
let collection = null;

async function connect(uri, dbName) {
    if (isConnected) {
      console.log('Using existing database connection');
      return;
    }

    try {
      client = await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, dbName });
      db = client.connection.db;
      collection = db.collection(collectionName);
      isConnected = true;
      console.log('Connected successfully to the database');
      return { client, db, collection };
    } catch (err) {
      console.error('Error connecting to the database:', err);
      throw err;
    }
  }

  function close() {
    if (isConnected) {
      mongoose.disconnect();
      isConnected = false;
      console.log('Connection to the database closed');
    }
  }

module.exports = { connect, close };


// const { MongoClient } = require('mongodb');
// const mongoose = require('mongoose');
// const uri = process.env.MONGODB_URI;
// const dbName = process.env.DB_NAME;
// const coll = process.env.DB_COLLECTION;

// async function connect(uri, dbName) {
//   console.log('connect() function called');
//   console.log("uri:", uri)
//   const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//   try {
//     await client.connect();
//     console.log('Connected successfully to database');
//     const db = client.db(dbName);
//     return db;
//   } catch (err) {
//     console.error('Error connecting to database:', err);
//     throw err;
//   }
// }

// async function close() {
//     try {
//       await client.close();
//       console.log('Connection to database closed');
//     } catch (err) {
//       console.error('Error closing database connection:', err);
//       throw err;
//     }
//   }

// module.exports = { connect, close};




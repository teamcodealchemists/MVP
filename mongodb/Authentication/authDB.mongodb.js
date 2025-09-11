/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const database = 'authentication';
const collection = 'user';

// Create a new database.
use(database);

// Create a new collection.
db.createCollection(collection, {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["email", "password", "name", "surname", "phone", "isGlobal"],
            properties: {
                email: {
                    bsonType: "string",
                    description: "must be a string and is required",
                },
                password: {
                    bsonType: "string",
                    description: "must be a string and is required",
                },
                name: {
                    bsonType: "string",
                    description: "must be a string and is required",
                },
                surname: {
                    bsonType: "string",
                    description: "must be a string and is required",
                },
                phone: {
                    bsonType: "string",
                    description: "must be a string and is required",
                },
                isGlobal: {
                    bsonType: "bool",
                    description: "must be a boolean and is required",
                },
                warehouseAssigned: {
                    bsonType: ["array"],
                    items: {
                        bsonType: "int",
                        description: "must be an integer",
                    },
                    description: "optional array of integers",
                },
            },
        },
    },
    validationLevel: "strict",
    validationAction: "error",
});

// The prototype form to create a collection:
/* db.createCollection( <name>,
  {
    capped: <boolean>,
    autoIndexId: <boolean>,
    size: <number>,
    max: <number>,
    storageEngine: <document>,
    validator: <document>,
    validationLevel: <string>,
    validationAction: <string>,
    indexOptionDefaults: <document>,
    viewOn: <string>,
    pipeline: <pipeline>,
    collation: <document>,
    writeConcern: <document>,
    timeseries: { // Added in MongoDB 5.0
      timeField: <string>, // required for time series collections
      metaField: <string>,
      granularity: <string>,
      bucketMaxSpanSeconds: <number>, // Added in MongoDB 6.3
      bucketRoundingSeconds: <number>, // Added in MongoDB 6.3
    },
    expireAfterSeconds: <number>,
    clusteredIndex: <document>, // Added in MongoDB 5.3
  }
)*/

// More information on the `createCollection` command can be found at:
// https://www.mongodb.com/docs/manual/reference/method/db.createCollection/

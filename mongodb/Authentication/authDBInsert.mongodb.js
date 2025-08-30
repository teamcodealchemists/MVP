/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Select the database to use.
use('authentication');

// Insert a few documents into the sales collection.
db.getCollection('user').insertMany([
    {
        email: 'john.doe@example.com',
        password: 'Banana123!',
        name: 'John',
        surname: 'Doe',
        phone: '+1234567890',
        isGlobal: true
    },
    {
        email: 'jane.smith@example.com',
        password: 'Carota123!',
        name: 'Jane',
        surname: 'Smith',
        phone: '+1987654321',
        isGlobal: false,
        warehouseAssigned: [2]
    },
    {
        email: 'alice.wonderland@example.com',
        password: 'Melanzana123!',
        name: 'Alice',
        surname: 'Wonderland',
        phone: '+1122334455',
        isGlobal: false,
        warehouseAssigned: [1,3]
    }
]);

import trips from './seeds/trips.json' with { type: 'json' };
import schedules from './seeds/schedules.json' with { type: 'json' };
import stations from './seeds/stations.json' with { type: 'json' };
import ticketClasses from './seeds/ticket-classes.json' with { type: 'json' };
import trains from './seeds/trains.json' with { type: 'json' };

const starterCollections = [
  ['trips', trips],
  ['schedules', schedules],
  ['stations', stations],
  ['ticketClasses', ticketClasses],
  ['trains', trains]
];

const standardRoles = [
  { name: 'customer', description: 'Standard customer account' },
  { name: 'admin', description: 'Administrator account' }
];

const initializeDatabase = async (db) => {
  if (!db) {
    throw new Error('A database connection is required to initialize data.');
  }

  for (const [collectionName, documents] of starterCollections) {
    const collection = db.collection(collectionName);
    await collection.deleteMany({});
    await collection.insertMany(documents);
  }

  const confirmations = db.collection('confirmations');
  await confirmations.deleteMany({});
  await confirmations.createIndex({ id: 1 }, { unique: true });

  const roles = db.collection('roles');

  for (const role of standardRoles) {
    await roles.updateOne(
      { name: role.name },
      { $setOnInsert: role },
      { upsert: true }
    );
  }

  await roles.createIndex({ name: 1 }, { unique: true });
  await db.collection('users').createIndex({ username: 1 }, { unique: true });
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
};

export { initializeDatabase, starterCollections, standardRoles };
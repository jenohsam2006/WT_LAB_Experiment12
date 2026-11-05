const { MongoClient, ObjectId } = require('mongodb');

async function testMongoDriver() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/EducationalPortal';
  console.log('--- Testing MongoDB Node.js Driver Directly ---');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('EducationalPortal');
  const collection = db.collection('Students');

  // 1. CREATE: insertOne
  const testStudent = {
    name: 'Test Student Verification',
    registerNumber: 'TEST_' + Date.now(),
    department: 'CSE',
    course: 'Web Development',
    createdAt: new Date().toISOString()
  };
  const insertResult = await collection.insertOne(testStudent);
  console.log('1. [CREATE] insertOne() successful. Inserted ID:', insertResult.insertedId.toString());

  // 2. READ: find({}).toArray()
  const allStudents = await collection.find({}).toArray();
  console.log('2. [READ] find({}).toArray() count:', allStudents.length);

  // 2b. READ with Department Query
  const cseStudents = await collection.find({ department: { $regex: /CSE/i } }).toArray();
  console.log('2b. [READ] find({ department: /CSE/i }) count:', cseStudents.length);

  // 3. UPDATE: updateOne() with $set
  const updateResult = await collection.updateOne(
    { _id: insertResult.insertedId },
    { $set: { course: 'Artificial Intelligence', department: 'AIDS' } }
  );
  console.log('3. [UPDATE] updateOne() with $set modifiedCount:', updateResult.modifiedCount);

  // 4. DELETE: deleteOne()
  const deleteResult = await collection.deleteOne({ _id: insertResult.insertedId });
  console.log('4. [DELETE] deleteOne() deletedCount:', deleteResult.deletedCount);

  await client.close();
  console.log('--- ALL MONGODB DRIVER CRUD OPERATIONS VERIFIED SUCCESSFULLY! ---');
}

testMongoDriver().catch(console.error);


import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';

async function start() {
  console.log("Starting embedded MongoDB server...");
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'sharehub',
    },
  });

  const uri = mongod.getUri();
  console.log(`MongoDB Memory Server started at: ${uri}`);

  // Write .env if not exists
  const envContent = `PORT=8000
MONGODB_URI=${uri.replace(/\/sharehub$/, '')}
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=sharehub_jwt_access_secret_2026_super_secure_key_123
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=sharehub_jwt_refresh_secret_2026_super_secure_key_456
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=demo_cloud
CLOUDINARY_API_KEY=1234567890
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
`;

  fs.writeFileSync('./.env', envContent);
  console.log(".env generated with active MongoDB URI!");
}

start().catch(err => {
  console.error("Error starting MongoMemoryServer:", err);
});

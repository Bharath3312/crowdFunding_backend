import mongoose from 'mongoose';

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error('Missing required environment variable: MONGO_URI');
}

const mongoOptions = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverSelectionTimeoutMS: 5000,
};

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, mongoOptions);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => console.log('MongoDB connection established'));
mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));

process.on('SIGINT', async () => {
  await mongoose.connection.close(false);
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

connectDB();

export default mongoose;
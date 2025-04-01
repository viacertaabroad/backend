import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

const connectToDb = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("❌ MONGO_URI is not defined in environment variables.");
    }
    let retries = 5; // Set the retry limit for db conection
    while (retries) {
      try {
        const connection = await mongoose.connect(MONGO_URI, {
          maxPoolSize: 10, // Optimize connection pooling concurrent request to databsae
          // minPoolSize: 2,
          // useNewUrlParser: true,
          // useUnifiedTopology: true,
          // maxIdleTimeMS: 30000,  // Close connections if idle for 30 seconds
          serverSelectionTimeoutMS: 5000,
        });

        console.log("✅ Connected to MongoDB successfully");
        return; // Exit after successful connection
      } catch (error) {
        retries -= 1;
        console.error(
          `⚠️ MongoDB connection failed. Retrying (${retries} left)...`,
          error.message
        );
        if (retries === 0) {
          throw new Error(
            "❌ Could not connect to MongoDB after multiple attempts."
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Waiting for 5 seconds before retry
      }
    }

    // Graceful shutdown handling
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🔌 MongoDB connection closed.");
      process.exit(0);
    });
  } catch (error) {
    console.error("⚠️ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectToDb;

import mongoose from "mongoose";

declare global {
  interface MongooseConnection {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  }

  var mongoose: MongooseConnection;
}

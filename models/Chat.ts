import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    messages: [
      {
        role: { type: String, require: true },
        content: { type: String, require: true },
        timeStamp: { type: Number, require: true },
      },
    ],
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

export default Chat;

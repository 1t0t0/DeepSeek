import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

interface WebhookEvent {
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name: string;
    last_name: string;
    image_url: string;
  };
  type: string;
}

export async function POST(req: Request) {
  const wh = new Webhook(process.env.SIGNING_SECRET as string);
  const headerPayload = await headers();
  const svixHeaders: Record<string, string> = {
    "svix-id": headerPayload.get("svix-id") ?? "",
    "svix-signature": headerPayload.get("svix-signature") ?? "",
  };

  //Get the payload and verify it

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const webhookEvent = wh.verify(body, svixHeaders) as WebhookEvent;
  const { data, type } = webhookEvent;

  //Pepare the user data to be saved in the database`

  const userData = {
    _id: data.id,
    email: data.email_addresses[0].email_address,
    name: `${data.first_name} ${data.last_name}`,
    image: data.image_url,
  };

  await connectDB();

  switch (type) {
    case "user.created":
      await User.create(userData);
      break;

    case "user.updated":
      await User.findByIdAndUpdate(data.id, userData);
      break;

    case "user.deleted":
      await User.findByIdAndDelete(data.id);
      break;

    default:
      break;
  }

  return NextResponse.json({ message: "Event recieved" });
}

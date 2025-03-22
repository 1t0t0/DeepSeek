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
  try {
    // ตรวจสอบว่ามี webhook secret หรือไม่
    const webhookSecret =
      process.env.CLERK_WEBHOOK_SECRET || process.env.SIGNING_SECRET;
    if (!webhookSecret) {
      console.error("Webhook secret is not defined");
      return NextResponse.json(
        { error: "Webhook secret is not defined" },
        { status: 500 }
      );
    }

    // สร้าง Webhook instance
    const wh = new Webhook(webhookSecret);

    // ดึง headers โดยไม่ใช้ await
    const headersList = await headers();
    const svixId = headersList.get("svix-id");
    const svixTimestamp = headersList.get("svix-timestamp");
    const svixSignature = headersList.get("svix-signature");

    // ตรวจสอบว่ามี headers ที่จำเป็นหรือไม่
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing required Svix headers");
      return NextResponse.json(
        { error: "Missing required Svix headers" },
        { status: 400 }
      );
    }

    const svixHeaders = {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    };

    // ดึงและตรวจสอบ payload
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const webhookEvent = wh.verify(body, svixHeaders) as WebhookEvent;
    const { data, type } = webhookEvent;

    // เตรียมข้อมูลผู้ใช้
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

    return NextResponse.json({ message: "Event received" });
  } catch (error: unknown) {
    console.error("Webhook error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: "Unknown error occurred" },
        { status: 400 }
      );
    }
  }
}

import { createSubscription } from "@/db/subscriptions";
import { createUser } from "@/db/user";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    const eventType = evt.type;

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const [dbUser] = await createUser({
        clerkId: id,
        email: email_addresses[0].email_address,
        name: (first_name ?? "") + " " + (last_name ?? ""),
      });
      await createSubscription({ userId: dbUser.id });
      return Response.json({ dbUser, status: 200 });
    }

    return new Response("Event not handled", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}

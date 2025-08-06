import { UTApi } from "uploadthing/server";
import 'dotenv/config';

export const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN,
});
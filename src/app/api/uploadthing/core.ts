import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { auth } from '@clerk/nextjs/server';
import 'dotenv/config';

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  fileUploader: f({
    "application/pdf": {
      maxFileSize: "8MB",
      maxFileCount: 5,
    },
  })
    .middleware(async () => {
      const { userId } = await auth();

      if (!userId) throw new UploadThingError("Unauthorized");

      return { userId };
    })
    .onUploadError(({ error }) => {
      console.error("Upload error", error);
      // Handle the error as needed
    })
    .onUploadComplete(({ metadata, file }) => {
      console.log("Upload complete");

      console.log("file url", file.ufsUrl);

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN,
});

export type OurFileRouter = typeof ourFileRouter;
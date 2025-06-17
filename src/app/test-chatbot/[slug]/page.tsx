import React, { Suspense } from "react";
import PageContainer from "./_components/page-container";
import PageLoader from "./_components/page-loader";

export default async function TestChatbot({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<PageLoader />}>
      <PageContainer params={params} />
    </Suspense>
  );
}

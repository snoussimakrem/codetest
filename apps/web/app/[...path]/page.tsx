import { Suspense } from "react";
import FrontendRouter from "../../components/frontend-router";
export default async function Page({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  return (
    <Suspense fallback={<div className="loading">Preparing your view…</div>}>
      <FrontendRouter path={path.join("/")} />
    </Suspense>
  );
}

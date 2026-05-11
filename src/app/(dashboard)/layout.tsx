import React from 'react';
import { auth } from '@/auth';
import { getSidebarLayout } from '@/app/actions/sidebarActions';
import DashboardContainer from '@/components/DashboardContainer';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const layout = await getSidebarLayout();

  return (
    <DashboardContainer initialLayout={layout} user={session?.user || null}>
      {children}
    </DashboardContainer>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function SidebarLink({ href, label, icon }: SidebarLinkProps) {
  const pathname = usePathname();
  
  // Logic: Active if exact match or if subpage (and not just root)
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link 
      href={href} 
      className={`sidebar-link ${isActive ? 'active' : ''}`}
      style={{ position: 'relative' }}
    >
      <span className="sidebar-icon">{icon}</span>
      <span className="sidebar-label">{label}</span>
    </Link>
  );
}

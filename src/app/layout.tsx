import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Axion',
  description: 'Your aesthetic, dynamic, and modular life management system.',
  icons: {
    icon: '/LogoBlanco.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body className="animate-fade-in" suppressHydrationWarning>
        <Script
          id="restore-theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('axion-theme-bg');
                if (saved) {
                  const { 
                    color1, color2, color3, color4, intensity, 
                    textColor, textColorMuted, glassBg, glassBorder, glassBgHover, glassBorderHover,
                    sidebarBg, sidebarLinkColor, sidebarActiveBg, sidebarActiveColor, sidebarActiveBorder, logoFilter,
                    specialSidebarBg, specialSidebarBorder, specialSidebarText
                  } = JSON.parse(saved);
                  const root = document.documentElement;
                  if (color1) root.style.setProperty('--bg-gradient-1', color1);
                  if (color2) root.style.setProperty('--bg-gradient-2', color2);
                  if (color3) root.style.setProperty('--bg-gradient-3', color3);
                  if (color4) root.style.setProperty('--bg-gradient-4', color4);
                  if (intensity !== undefined) {
                    root.style.setProperty('--bg-gradient-size', intensity + '%');
                  }
                  if (textColor) root.style.setProperty('--color-text', textColor);
                  if (textColorMuted) root.style.setProperty('--color-text-muted', textColorMuted);
                  if (glassBg) root.style.setProperty('--glass-bg', glassBg);
                  if (glassBorder) root.style.setProperty('--glass-border', glassBorder);
                  if (glassBgHover) root.style.setProperty('--glass-bg-hover', glassBgHover);
                  if (glassBorderHover) root.style.setProperty('--glass-border-hover', glassBorderHover);
                  
                  if (sidebarBg) root.style.setProperty('--sidebar-bg', sidebarBg);
                  if (sidebarLinkColor) root.style.setProperty('--sidebar-link-color', sidebarLinkColor);
                  if (sidebarActiveBg) root.style.setProperty('--sidebar-active-bg', sidebarActiveBg);
                  if (sidebarActiveColor) root.style.setProperty('--sidebar-active-color', sidebarActiveColor);
                  if (sidebarActiveBorder) root.style.setProperty('--sidebar-active-border', sidebarActiveBorder);
                  if (logoFilter) root.style.setProperty('--logo-filter', logoFilter);

                  if (specialSidebarBg) root.style.setProperty('--special-sidebar-bg', specialSidebarBg);
                  if (specialSidebarBorder) root.style.setProperty('--special-sidebar-border', specialSidebarBorder);
                  if (specialSidebarText) root.style.setProperty('--special-sidebar-text', specialSidebarText);
                }
              } catch (_) {}
            `
          }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

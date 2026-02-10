import React from 'react';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex justify-center">
      <main className="w-full max-w-md p-4 flex flex-col min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

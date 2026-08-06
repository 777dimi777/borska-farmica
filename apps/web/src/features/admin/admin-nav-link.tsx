'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminAuthApi } from './api';
import { refreshAdminSingleFlight } from './session';

export function AdminNavLink({ onNavigate }: { onNavigate?: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    refreshAdminSingleFlight()
      .then((auth) => adminAuthApi.me(auth.accessToken))
      .then(() => {
        if (active) setVisible(true);
      })
      .catch(() => {
        if (active) setVisible(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!visible) return null;

  return (
    <Link
      className="admin-dashboard-link"
      href="/admin/dashboard"
      onClick={onNavigate}
    >
      Admin dashboard
    </Link>
  );
}

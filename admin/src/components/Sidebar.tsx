'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useLogoutMutation } from '@/store/api/adminApi';
import { useAppSelector } from '@/store/hooks';

const nav = [
  { label: 'Dashboard', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Orders', href: '/orders' },
  { label: 'Customers', href: '/customers' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const admin = useAppSelector((state) => state.adminAuth.admin);
  const [logout, { isLoading }] = useLogoutMutation();

  return (
    <aside className="flex w-full flex-row items-center justify-between gap-6 bg-ink px-5 py-4 lg:h-screen lg:w-60 lg:flex-col lg:items-stretch lg:justify-start lg:px-0 lg:py-0">
      <div className="lg:border-b lg:border-line-dark lg:px-6 lg:py-6">
        <span className="font-serif text-2xl lowercase tracking-[0.06em] text-ivory">attume</span>
        <p className="eyebrow mt-1 hidden text-bronze lg:block">Admin</p>
      </div>

      <nav className="flex-1 lg:px-3 lg:py-6">
        <ul className="flex flex-row gap-1 lg:flex-col">
          {nav.map((item) => {
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'eyebrow block px-3 py-2.5 transition-colors lg:px-4',
                    isActive ? 'bg-ink-soft text-ivory' : 'text-ivory/55 hover:text-ivory',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="lg:border-t lg:border-line-dark lg:px-6 lg:py-5">
        <p className="hidden text-xs text-ivory/45 lg:block">{admin?.email}</p>
        <button
          type="button"
          disabled={isLoading}
          onClick={async () => {
            await logout().unwrap().catch(() => undefined);
            router.replace('/login');
          }}
          className="eyebrow mt-0 text-espresso lg:mt-3 lg:text-ivory/55 lg:hover:text-ivory"
        >
          {isLoading ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </aside>
  );
}

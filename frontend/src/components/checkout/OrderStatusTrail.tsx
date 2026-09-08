import type { OrderStatus } from '@/types';

const flow: OrderStatus[] = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

const labels: Record<OrderStatus, string> = {
  pending: 'Order placed',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

/** Progress rail for the happy path; closed orders show their end state instead. */
export function OrderStatusTrail({
  status,
  timeline,
}: {
  status: OrderStatus;
  timeline: { status: string; at: string }[];
}) {
  if (status === 'cancelled' || status === 'returned') {
    const event = [...timeline].reverse().find((entry) => entry.status === status);
    return (
      <section className="border border-espresso/40 bg-espresso/5 p-6">
        <h3 className="eyebrow text-espresso">{labels[status]}</h3>
        <p className="mt-2 text-sm text-ink-muted">
          {event
            ? `On ${new Date(event.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}.`
            : ''}{' '}
          Any amount already paid is refunded to the original method.
        </p>
      </section>
    );
  }

  const currentIndex = flow.indexOf(status);

  return (
    <section>
      <h3 className="eyebrow mb-5 text-bronze">Progress</h3>
      <ol className="flex flex-col gap-0 sm:flex-row sm:items-start">
        {flow.map((step, index) => {
          const isDone = index <= currentIndex;
          const event = timeline.find((entry) => entry.status === step);
          return (
            <li key={step} className="flex flex-1 gap-4 sm:flex-col sm:gap-3">
              <div className="flex flex-col items-center sm:w-full sm:flex-row">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${isDone ? 'bg-olive' : 'bg-line'}`}
                />
                {index < flow.length - 1 && (
                  <span
                    className={`h-10 w-px sm:h-px sm:w-full ${index < currentIndex ? 'bg-olive' : 'bg-line'}`}
                  />
                )}
              </div>
              <div className="pb-6 sm:pb-0">
                <p className={`text-sm ${isDone ? 'text-ink' : 'text-ink-muted'}`}>{labels[step]}</p>
                {event && (
                  <p className="mt-1 text-xs text-ink-muted">
                    {new Date(event.at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

import { Container } from '@/components/ui/Container';
import {
  FlaskIcon,
  HandIcon,
  LeafIcon,
  PinIcon,
  RabbitIcon,
  ShieldIcon,
} from '@/components/ui/icons';

const commitments = [
  { label: 'Made in India', detail: 'Composed and filled in New Delhi', Icon: PinIcon },
  { label: 'IFRA compliant', detail: 'Within international safety limits', Icon: ShieldIcon },
  { label: 'Paraben free', detail: 'No parabens, ever', Icon: LeafIcon },
  { label: 'Phthalate free', detail: 'No phthalate fixatives', Icon: FlaskIcon },
  { label: 'Cruelty free', detail: 'Never tested on animals', Icon: RabbitIcon },
  { label: 'Small batch', detail: 'Bottled by hand in limited runs', Icon: HandIcon },
] as const;

/** The claims printed on the carton, laid out as a quiet badge strip. */
export function Commitments() {
  return (
    <section className="bg-ivory-soft py-16 lg:py-20">
      <Container>
        <h2 className="text-center font-serif text-3xl font-light text-ink lg:text-4xl">
          Thoughtful commitments
        </h2>

        <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {commitments.map(({ label, detail, Icon }) => (
            <li key={label} className="flex flex-col items-center text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full border border-olive/30 bg-ivory text-olive">
                <Icon className="h-8 w-8" />
              </span>
              <span className="mt-4 text-sm text-ink">{label}</span>
              <span className="mt-1 text-xs leading-relaxed text-ink-muted">{detail}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

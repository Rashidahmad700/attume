import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-6 py-28 text-center lg:py-36">
      <span className="eyebrow text-bronze">404</span>
      <h1 className="font-serif text-4xl font-light text-ink lg:text-5xl">
        This page has evaporated
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-ink-muted">
        The link you followed does not lead anywhere. The collection is small enough that you will
        find what you were after in a click.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-4">
        <ButtonLink href="/shop" size="lg">
          Shop the collection
        </ButtonLink>
        <ButtonLink href="/" variant="outline" size="lg">
          Back home
        </ButtonLink>
      </div>
      <Link href="/contact" className="link-underline eyebrow mt-2 text-olive">
        Tell us what you were looking for
      </Link>
    </Container>
  );
}

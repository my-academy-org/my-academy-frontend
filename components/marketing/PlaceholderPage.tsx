import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/** Simple page shell for routes whose content isn't published yet (e.g. legal pages). */
export function PlaceholderPage({ title, body }: { title: string; body: string }) {
  return (
    <Container className="max-w-3xl pt-36 pb-24 sm:pt-44">
      <h1 className="text-3xl font-extrabold text-ink-950 sm:text-4xl">{title}</h1>
      <p className="mt-5 text-lg leading-8 text-ink-600">{body}</p>
      <Button href="/" variant="secondary" className="mt-10">
        العودة إلى الرئيسية
      </Button>
    </Container>
  );
}

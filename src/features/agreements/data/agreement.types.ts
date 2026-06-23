/**
 * Content model for the "Sözleşmeler" legal texts. Each agreement is a list of
 * blocks rendered generically, so the long static content lives as data instead
 * of bespoke components.
 */
export type AgreementBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  /** Bold label with its description below (definitions, contact rows, tables). */
  | { type: 'term'; term: string; text: string }
  /** Bullet item, optionally led by a bold phrase. */
  | { type: 'bullet'; text: string; lead?: string };

export type Agreement = {
  id: string;
  title: string;
  blocks: AgreementBlock[];
};

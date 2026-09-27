type PluralForms = { one: string; two: string; few: string; many: string };

/**
 * Arabic counted noun: 1 and 2 use their own words ("بند واحد", "بندان"),
 * 3–10 take the plural ("4 بنود"), and 11+ the singular accusative ("12 بندًا").
 */
export function pluralize(count: number, forms: PluralForms) {
  if (count === 1) return forms.one;
  if (count === 2) return forms.two;
  return count <= 10 ? `${count} ${forms.few}` : `${count} ${forms.many}`;
}

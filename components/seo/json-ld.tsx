// One <script type="application/ld+json"> per block; the JSON is escaped so a "</script>" in a note cannot break out
export function JsonLd({ data }: { data: object | object[] }) {
  return (Array.isArray(data) ? data : [data]).map((d, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, "\\u003c") }} />);
}

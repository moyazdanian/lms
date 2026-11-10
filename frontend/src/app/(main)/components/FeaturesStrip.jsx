import { getHeroiconComponent } from "@/utilities/getIcons/getIcons";

/**
 * A quiet three-item service strip with hairline dividers — replaces the old
 * identical rounded cards. Icons stay the admin-chosen heroicons. Data comes
 * from the site-content payload (features_strip row) — the old standalone
 * /features endpoint was removed.
 */
export default function FeaturesStrip({ features = [] }) {
  const items = (features.length === 3
    ? features
    : [
        { icon: null, title: "Expert-led courses", subtitle: "Learn from working professionals, not talking heads." },
        { icon: null, title: "Own it forever", subtitle: "Pay once and keep every course — with lifetime updates." },
        { icon: null, title: "Certificates & quizzes", subtitle: "Prove your new skills with verifiable certificates." },
      ]
  );

  return (
    <section className="border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
        {items.map((feature, i) => {
          const IconComponent = feature.icon
            ? getHeroiconComponent(feature.icon)
            : null;

          return (
            <div key={i} className="flex items-start gap-4 py-7 sm:py-10 sm:px-8 sm:first:pl-0">
              {IconComponent && (
                <IconComponent className="mt-0.5 h-6 w-6 shrink-0 text-neutral-300" strokeWidth={1.5} />
              )}
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                  {feature.subtitle}
                </p>
              </div>
            </div>
            );
        })}
      </div>
    </section>
  );
}

import { getHeroiconComponent } from "@/utilities/getIcons/getIcons";

// A quiet service strip, not a row of cards. Data comes from the
// site-content payload (the features_strip row the admin edits in the
// panel). Icons stay the admin-chosen heroicons. Visible on mobile too
// (the old version hid this section entirely below sm).
export default function Features({ data = [] }) {
  const features = data.map((item) => ({
    icon: item.icon,
    title: item.title,
    subtitle: item.subtitle,
  }));

  if (features.length === 0) return null;

  return (
    <section className="border-y border-white/10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
        {features.map((feature, i) => {
          const IconComponent = getHeroiconComponent(feature.icon);

          return (
            <div key={i} className="flex items-start gap-4 py-6 sm:py-10 sm:px-8 sm:first:pl-0">
              {IconComponent && (
                <IconComponent className="w-6 h-6 mt-0.5 shrink-0 text-neutral-300" strokeWidth={1.5} />
              )}
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-400 leading-relaxed">
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

import Button from "@/components/ui/Button";

interface ExpeditionCardProps {
  title: string;
  description: string;
  duration: string;
}

export default function ExpeditionCard({
  title,
  description,
  duration,
}: ExpeditionCardProps) {
  return (
    <article className="group rounded-3xl border border-[#e8d9cd] bg-white p-4 shadow-sm transition duration-700 ease-out hover:-translate-y-1 hover:shadow-xl sm:p-5">
      <div className="mb-4 rounded-3xl border border-dashed border-[#d8c8bc] bg-gradient-to-br from-[#f0d5bf] via-[#f5e4d4] to-[#eec8b0] p-5">
        <div className="h-40 rounded-3xl bg-gradient-to-br from-[#BE6853]/40 to-[#9D5950]/30" />
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-serif text-2xl text-[#4A2B32]">{title}</h3>
        <span className="rounded-full bg-[#F5E1A6] px-3 py-1 text-xs font-semibold text-[#4A2B32]">
          {duration}
        </span>
      </div>

      <p className="mb-5 text-sm leading-6 text-[#6a5560]">{description}</p>

      <Button href="/templates" variant="secondary" className="w-full py-2.5 text-sm">
        Use Template
      </Button>
    </article>
  );
}

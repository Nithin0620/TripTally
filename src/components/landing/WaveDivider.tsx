interface WaveDividerProps {
  colorClass?: string;
  flipped?: boolean;
}

export default function WaveDivider({
  colorClass = "text-[#FFF2E6]",
  flipped = false,
}: WaveDividerProps) {
  return (
    <div className="w-full overflow-hidden leading-none">
      <svg
        className={`h-16 w-full md:h-20 ${colorClass} ${flipped ? "rotate-180" : ""}`}
        viewBox="0 0 1440 180"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          className="fill-current"
          d="M0,64 C120,110 240,130 360,120 C480,110 600,70 720,72 C840,74 960,118 1080,120 C1200,122 1320,90 1440,64 L1440,180 L0,180 Z"
        />
      </svg>
    </div>
  );
}

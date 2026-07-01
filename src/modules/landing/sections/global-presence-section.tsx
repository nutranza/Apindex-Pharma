import Image from "next/image"

const GLOBAL_STATS = [
  { value: "86+", label: "Countries Served" },
  { value: "1250+", label: "Global Clients" },
  { value: "600+", label: "Sterile Products" },
  { value: "900+", label: "Non-Sterile Products" },
]

export default function GlobalPresenceSection() {
  return (
    <section
      id="global-presence"
      className="relative overflow-hidden bg-[#0d1117] py-24 lg:py-36 text-white"
    >
      {/* World map — subtle background */}
      <div className="absolute inset-0">
        <Image
          fill
          sizes="100vw"
          src="/world-map.svg"
          alt=""
          aria-hidden="true"
          className="object-cover opacity-[0.18]"
        />
        {/* top & bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117]/70 via-transparent to-[#0d1117]/80" />
        {/* left & right fade */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117]/60 via-transparent to-[#0d1117]/60" />
      </div>

      {/* Ambient centre glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(232,150,29,0.06)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 content-container">
        {/* Heading */}
        <div className="mb-16 text-center">
          <h2 className="section-heading mb-4 text-white">
            A Global Network{" "}
            <span className="text-primary-container">
              of Trust
            </span>
          </h2>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg">
            Delivering trusted pharmaceutical products across global markets
            with consistent quality, compliance, and supply reliability.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {GLOBAL_STATS.map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] px-6 py-10 text-center backdrop-blur-sm"
            >
              <div className="relative">
                <div
                  className="mb-2 lg:text-5xl text-3xl font-extrabold tracking-tight text-primary-container"
                >
                  {stat.value}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

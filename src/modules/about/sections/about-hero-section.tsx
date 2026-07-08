import Image from "next/image"

export default function AboutHeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0d1117] pt-20">
      <div className="absolute inset-0 z-0">
        <Image
          fill
          priority
          sizes="100vw"
          src="/about-hero.avif"
          alt="Apindex pharmaceutical laboratory environment"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,17,23,0.72)_0%,rgba(13,17,23,0.44)_42%,rgba(13,17,23,0.08)_100%)]" />
      </div>

      <div className="relative z-10 h-[550px] lg:h-[650px]">
        <div className="content-container flex h-full items-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold leading-[1.08] text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.32)] sm:text-5xl md:text-6xl">
              About{" "}
              <span className="text-primary-container">Apindex</span>
              <br />
              Pharmaceuticals
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.32)] sm:text-lg">
              A trusted pharmaceutical partner for finished formulations,
              contract manufacturing coordination, export-ready packaging, and
              dependable supply support for global healthcare markets.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

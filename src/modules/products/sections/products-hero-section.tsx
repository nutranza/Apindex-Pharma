import Image from "next/image"

export default function ProductsHeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0d1117] pt-20">
      <div className="absolute inset-0 z-0">
        <Image
          fill
          priority
          sizes="100vw"
          src="/products-hero-pharmaceutical-supply.png"
          alt="Apindex pharmaceutical product portfolio"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,17,23,0.76)_0%,rgba(13,17,23,0.48)_42%,rgba(13,17,23,0.12)_100%)]" />
      </div>

      <div className="relative z-10 h-[380px] sm:h-[430px] lg:h-[480px]">
        <div className="content-container flex h-full items-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold leading-[1.08] text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.32)] sm:text-5xl md:text-6xl">
              Our{" "}
              <span className="text-primary-container">Product</span>
              <br />
              Portfolio
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.32)] sm:text-lg">
              Browse finished pharmaceutical formulations across therapeutic
              categories and dosage forms for dependable institutional and
              global supply support.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

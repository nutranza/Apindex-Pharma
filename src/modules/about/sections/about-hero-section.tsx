import Image from "next/image"

const HERO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB9OeoJelP19gJ61a_CZc1AphOtugOZk73qmzACyIZcGDDHK5HgS-rxwuWfZ-NO6NYL0T19uOgtnbKrkK2Z9ycu116q7Rt9PjpiKZGVoZeL-KGt-7qsTKYy5p34dpUEtwHkU-RMF3mDfX0J97K_NA8OrH_EXsncoXpkCfn7KS0QFI2vMYbdEVT78X2sONELE1qFEMXtdaf_hp_ILmfTauyBYiqKlRY9bvz-fRZQaFyAiUj7jk38ipwTrxQ5pelo6SIEA4lGmmrgFYU"

export default function AboutHeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0d1117] pt-20">
      <div className="absolute inset-0 z-0">
        <Image
          fill
          priority
          sizes="100vw"
          src={HERO_IMAGE_URL}
          alt="Apindex pharmaceutical manufacturing environment with stainless steel process equipment"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0d1117]/50" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,17,23,0.88)_0%,rgba(13,17,23,0.62)_44%,rgba(13,17,23,0.18)_100%)]" />
      </div>

      <div className="relative z-10 h-[550px] lg:h-[650px]">
        <div className="content-container flex h-full items-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              About{" "}
              <span className="text-primary-container">Apindex</span>
              <br />
              Pharmaceuticals
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white sm:text-lg sm:leading-8">
              A global pharmaceutical manufacturing partner focused on trusted
              quality, export readiness, and better healthcare outcomes through
              precision-driven processes.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

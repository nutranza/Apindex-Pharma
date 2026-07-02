import Image from "next/image"

export default function ContactHeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0d1117] pt-20">
      <div className="absolute inset-0 z-0">
        <Image
          fill
          priority
          sizes="100vw"
          src="/contect-hero.jpg"
          alt="Apindex pharmaceutical support team coordinating product and partnership inquiries"
          className="object-cover object-[60%_0%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,17,23,0.72)_0%,rgba(13,17,23,0.44)_42%,rgba(13,17,23,0.08)_100%)]" />
      </div>

      <div className="relative z-10 h-[550px] lg:h-[650px]">
        <div className="content-container flex h-full items-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold leading-[1.08] text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.32)] sm:text-5xl md:text-6xl">
              Contact{" "}
              <span className="text-primary-container">Apindex</span>
              <br />
              Pharmaceuticals
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-6 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.32)] sm:text-lg">
              Connect with our team for pharmaceutical manufacturing
              partnerships, product inquiries, export support, and
              quality-focused supply discussions across global markets.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

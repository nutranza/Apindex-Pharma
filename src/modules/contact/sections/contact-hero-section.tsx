import Image from "next/image"

const HERO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBEFXE-WHcJL7z7BgfL-3RfLHqFl-JG2B6fKe3rTD9UiXFAOseO5RcXhU0HeJno2ds8auPwHEo0qCg0ooRAIH-saN30A7QGywplPIehskhjyVenWcYGcEswGDBp7aZXRPCImufUAnOTHtzYne2NnVCuzaxzQPwEytfjWju9CHv5-ptKMKdBi0Vlny2rPHUX8ovrkWzayGpC826JzZUcJoreMfKQOOSxEVpcwZvRvMPKcLOdSjl-Du4FbB7oOK4nksBbiq5JH1QCmwY"

export default function ContactHeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0d1117] pt-20">
      <div className="absolute inset-0 z-0">
        <Image
          fill
          priority
          sizes="100vw"
          src={HERO_IMAGE_URL}
          alt="Modern high-tech pharmaceutical laboratory with glass partitions, stainless steel equipment and soft clean white lighting"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0d1117]/50" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,17,23,0.88)_0%,rgba(13,17,23,0.62)_44%,rgba(13,17,23,0.18)_100%)]" />
      </div>

      <div className="relative z-10 h-[550px] lg:h-[650px]">
        <div className="content-container flex h-full items-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Contact{" "}
              <span className="text-primary-container">Apindex</span>
              <br />
              Pharmaceuticals
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white sm:text-lg sm:leading-8">
              Connect with our team for pharmaceutical manufacturing
              partnerships, product enquiries, export support, and quality-led
              supply discussions across global markets.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

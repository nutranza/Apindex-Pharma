import Image from "next/image"

type PageHeroSectionProps = {
  title: string
  accent: string
  suffix?: string
  description: string
  imageSrc: string
  imageAlt: string
  imageClassName?: string
}

export default function PageHeroSection({
  title,
  accent,
  suffix,
  description,
  imageSrc,
  imageAlt,
  imageClassName = "object-center",
}: PageHeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[#0d1117] pt-20">
      <div className="absolute inset-0 z-0">
        <Image
          fill
          priority
          sizes="100vw"
          src={imageSrc}
          alt={imageAlt}
          className={`object-cover ${imageClassName}`}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,17,23,0.76)_0%,rgba(13,17,23,0.48)_42%,rgba(13,17,23,0.12)_100%)]" />
      </div>

      <div className="relative z-10 h-[380px] sm:h-[430px] lg:h-[480px]">
        <div className="content-container flex h-full items-center">
          <div className="max-w-3xl">
            <h1 className="apx-hero-heading">
              {title} <span className="text-primary-container">{accent}</span>
              {suffix ? (
                <>
                  <br />
                  {suffix}
                </>
              ) : null}
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.32)] sm:text-lg">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

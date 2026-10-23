import Image from "next/image"

type Certification = {
  name: string
  description: string
  image: { src: string; width: number; height: number }
}

const CERTIFICATIONS: Certification[] = [
  {
    name: "WHO",
    description: "World Health Organization",
    image: { src: "/assets/certifications/who.svg", width: 581, height: 178 },
  },
  {
    name: "GMP",
    description: "Good Manufacturing Practices",
    image: { src: "/assets/certifications/gmp.png", width: 300, height: 242 },
  },
  {
    name: "ISO",
    description: "International quality standards",
    image: { src: "/assets/certifications/iso.svg", width: 2500, height: 2500 },
  },
  {
    name: "FDCA",
    description: "Food & Drugs Control Administration",
    image: { src: "/assets/certifications/fdca.png", width: 456, height: 548 },
  },
  {
    name: "PHARMEXCIL",
    description: "Pharmaceuticals Export Promotion Council of India",
    image: {
      src: "/assets/certifications/pharmexcil.png",
      width: 247,
      height: 83,
    },
  },
  {
    name: "MSME",
    description: "Micro, Small & Medium Enterprises",
    image: {
      src: "/assets/certifications/msme.svg",
      width: 3000,
      height: 3000,
    },
  },
]

export default function AboutCertificationsSection() {
  return (
    <section
      id="credentials"
      aria-labelledby="certifications-heading"
      className="scroll-mt-28 bg-surface-low apx-section"
    >
      <div className="content-container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 id="certifications-heading" className="section-heading">
            Certifications &amp;{" "}
            <span className="text-primary">Registrations</span>
          </h2>
          <p className="section-description mt-4">
            Quality standards, regulatory frameworks, and business credentials
            for pharmaceutical supply.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {CERTIFICATIONS.map((certification) => (
            <li
              key={certification.name}
              className="group flex flex-col items-center rounded-2xl border border-outline-variant/30 bg-white px-6 py-8 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-6 flex h-32 w-full items-center justify-center">
                <Image
                  src={certification.image.src}
                  width={certification.image.width}
                  height={certification.image.height}
                  sizes="(min-width: 640px) 220px, 70vw"
                  alt={`${certification.name} logo`}
                  className="h-full w-full max-w-[220px] object-contain"
                />
              </div>
              <h3 className="apx-font-headline text-lg font-semibold text-on-surface">
                {certification.name}
              </h3>
              <p className="mt-2 max-w-[260px] text-sm leading-6 text-on-surface-variant">
                {certification.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* eslint-disable react-hooks/refs */
import { PageContainer } from '../components/layout';
import { Button, TestimonialCarousel } from '../components/ui';
import { Link } from 'react-router-dom';
import { useScrollReveal, useStaggerReveal, useTestimonials } from '../hooks';

/* ------------------------------------------------------------------ */
/* Feature data for the "Why Choose" section                          */
/* ------------------------------------------------------------------ */
const features = [
  {
    title: 'Expert Knowledge',
    description: 'Fly fishing guides with years of experience fishing on the Bow river and other Alberta rivers.',
    icon: (
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    ),
  },
  {
    title: 'Premium Equipment',
    description: 'Quality rods, reels, flies and gear provided for your best chance at success (if you have your own feel free to bring it)',
    icon: (
      <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    ),
  },
  {
    title: 'Personalized Service',
    description: 'Trips can be tailored to your specific needs. Inquire about groups and rates. Rates are generally per boat/guide.',
    icon: (
      <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    ),
  },
];

/* ------------------------------------------------------------------ */
/* Signature trip data for topical authority                           */
/* ------------------------------------------------------------------ */
const signatureTrips = [
  {
    title: 'Bow River Drift Boat Trips',
    area: 'Bow River - Calgary & Southern Alberta',
    description:
      "Full-day guided float trips on Alberta's legendary Bow River targeting trophy brown and rainbow trout with hoppers, streamers, and nymph rigs.",
    highlights: [
      'Prime season April-October',
      'Covers 15-25 km of blue-ribbon water',
      'Ideal for anglers seeking consistent action near Calgary',
    ],
    cta: 'Plan a Bow River Drift',
  },
  {
    title: 'Foothills Walk-n-Wade Adventures',
    area: 'Highwood / Oldman / Livingstone Rivers',
    description:
      'Immersive Alberta Rockies experiences exploring clear freestone streams with patient instruction for dry-fly, Euro-nymph, and tight-line tactics.',
    highlights: [
      'Access to remote runs and pocket water',
      'Perfect for anglers who love to hike and explore',
      'Custom itineraries for single or multi-day packages',
    ],
    cta: 'Plan a Foothills Trip',
  },
];

/* ------------------------------------------------------------------ */
/* Stat counters shown below the hero                                 */
/* ------------------------------------------------------------------ */
const stats = [
  { value: '10+', label: 'Years fly fishing experience on southern Albertas waters' },
  { value: '200', label: 'Average wild trout per kilometer in Alberta’s top rivers'},
  { value: '18-19"', label: 'Average wild trout size in Alberta rivers (inches)' },
];

/* ------------------------------------------------------------------ */
/* Home Page Component                                                */
/* ------------------------------------------------------------------ */
export function Home() {
  const { testimonials, loading: testimonialsLoading } = useTestimonials({ limitCount: 20 });
  const featuresReveal = useStaggerReveal<HTMLDivElement>();
  const testimonialsReveal = useScrollReveal<HTMLElement>();
  // testimonialsCardsReveal removed -- carousel handles card presentation
  const ctaReveal = useScrollReveal<HTMLElement>();

  return (
    <PageContainer fullWidth>
      {/* ============================================================
          HERO SECTION
          Dramatic gradient background with premium typography
          ============================================================ */}
      <section
        className="hero-critical relative bg-gradient-to-br from-forest-700 via-forest-600 to-forest-800 text-white overflow-hidden"
        style={{
          backgroundImage: `url('/hero.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-forest-700/80 via-forest-600/70 to-forest-800/80" aria-hidden="true" />

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-trout-gold/5 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-forest-400/10 blur-3xl" aria-hidden="true" />

        <div className="container-custom relative py-24 md:py-36 lg:py-40">
          <div className="max-w-3xl">
            {/* Eyebrow tag */}
            <div className="hero-critical__eyebrow inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm text-forest-100 mb-6 animate-fade-in">
              <span className="hero-critical__eyebrow-dot w-1.5 h-1.5 rounded-full bg-trout-gold animate-pulse-soft" aria-hidden="true" />
              Premier Fly Fishing Guides in Alberta
            </div>


            <h1 className="hero-critical__title text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] animate-slide-up text-forest-50" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.35), 0 6px 18px rgba(0,0,0,0.35)' }}>
              <span className="inline-block p-3 m-1 px-2 rounded-[2.25rem] bg-gradient-to-r from-forest-950/60 via-forest-900/25 to-transparent text-forest-50/95 shadow-[0_20px_45px_rgba(0,0,0,0.35)] backdrop-blur-sm">
                Alberta Guided Fly Fishing Adventures
              </span>
              <span className="block text-trout-gold/90 mt-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.35), 0 4px 8px rgba(0,0,0,0.25)' }}>Drift Boat and Walk&#8209;and&#8209;Wade packages on the Bow river and southern Alberta mountain streams</span>
            </h1>

            <p className="hero-critical__subtitle text-lg md:text-xl text-forest-100/90 mb-10 max-w-2xl leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Backcountry Drifters is based in the Foothills of Alberta, near Calgary. We focus on providing top notch Bow River Drift boat trips, with trips tailored to your wants and needs. We also provide Walk&#8209;and&#8209;Wade trips for anglers who have basic casting skills under their belts. Book a full Guided trip to some of the most scenic waters western Canada has to offer.
            </p>

            <div className="hero-critical__actions flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Link to="/bookings">
                <Button variant="primary" size="lg" className="hero-critical__primary-cta">
                  Book a Trip
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="hero-critical__secondary-cta border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#fafaf8] to-transparent" aria-hidden="true" />
      </section>

      {/* ============================================================
          STATS BAR
          Trust-building numbers in a clean horizontal layout
          ============================================================ */}
      <section className="relative -mt-8 z-10" aria-label="Key statistics">
        <div className="container-custom">
          <div className="bg-white rounded-2xl shadow-large px-6 py-8 md:px-12 md:py-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-8 md:gap-4 justify-between items-stretch">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center text-center h-full">
                  {stat.value && (
                    <div className="text-2xl md:text-3xl font-bold text-forest-700 mb-2">
                      {stat.value}
                    </div>
                  )}
                  <div className={`text-sm text-gray-500 font-medium flex items-center justify-center ${stat.value ? '' : 'mt-2'}`}
                  >
                    <span>{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURES SECTION
          Three-column layout with staggered reveal animations
          ============================================================ */}
      <section className="section bg-transparent">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-forest-800 mb-4">
              Why Choose Backcountry Drifters
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Expert Alberta fly fishing guides, premium equipment, and unforgettable drift boat and walk&#8209;and&#8209;wade experiences.
            </p>
            <div className="mt-5 mx-auto w-12 h-0.5 bg-trout-gold rounded-full" aria-hidden="true" />
          </div>

          <div
            ref={featuresReveal.observe}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
          >
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`
                  text-center group
                  scroll-reveal
                  ${featuresReveal.isVisible ? 'is-visible' : ''}
                `}
                style={featuresReveal.getStaggerStyle(index, 150)}
              >
                {/* Icon circle with hover lift */}
                <div className="w-16 h-16 bg-gradient-to-br from-trout-gold to-trout-gold-dark rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-gold transition-transform duration-300 group-hover:-translate-y-1">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-forest-700 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SIGNATURE TRIPS SECTION
          Detailed service cards to bolster topical authority
          ============================================================ */}
      <section className="section bg-[#fafaf8]" aria-labelledby="signature-trips-heading">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 id="signature-trips-heading" className="text-3xl md:text-4xl font-bold text-forest-800 mb-4">
              Signature Alberta Guided Trips
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto ">
             Choose from the Bow river drift boat adventures, to treks through mountain streams walk&#8209;and&#8209;wading through some crystal clear waters.
            </p>
            <div className="mt-5 mx-auto w-12 h-0.5 bg-trout-gold rounded-full" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {signatureTrips.map((trip) => (
              <article
                key={trip.title}
                className="bg-white rounded-2xl shadow-soft p-6 border border-forest-50 flex flex-col h-full"
                itemScope
                itemType="https://schema.org/TouristTrip"
              >
                <meta itemProp="touristType" content="Fly anglers" />
                <meta itemProp="areaServed" content="Alberta, Canada" />
                <p className="text-xs font-semibold tracking-[0.2em] text-trout-gold uppercase mb-3">
                  {trip.area}
                </p>
                <h3 className="text-2xl font-semibold text-forest-800 mb-3" itemProp="name">
                  {trip.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4 flex-1" itemProp="description">
                  {trip.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {trip.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-2 text-sm text-forest-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-trout-gold flex-shrink-0" aria-hidden="true" />
                      {highlight}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/bookings"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-forest-200 text-white text-sm font-semibold hover:bg-trout-gold transition-colors"
                  itemProp="url"
                >
                  {trip.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          TESTIMONIALS SECTION
          Customer testimonials with staggered reveal cards
          ============================================================ */}
      <section
        ref={testimonialsReveal.observe}
        className="section bg-forest-50/50 bg-topo-pattern"
        aria-labelledby="testimonials-heading"
      >
        <div className="container-custom">
          {/* Section header */}
          <div
            className={`
              text-center mb-8 sm:mb-14
              scroll-reveal
              ${testimonialsReveal.isVisible ? 'is-visible' : ''}
            `}
          >
            <h2
              id="testimonials-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-forest-800 mb-3 sm:mb-4"
            >
              What Our Clients Say
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              Read testimonials from anglers who have experienced Backcountry Drifters.
            </p>
            <div className="mt-4 sm:mt-5 mx-auto w-12 h-0.5 bg-trout-gold rounded-full" aria-hidden="true" />
          </div>

          {/* Loading skeleton state */}
          {testimonialsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" aria-label="Loading testimonials">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white/80 rounded-2xl shadow-soft p-8 border border-gray-100">
                  <div className="flex items-center gap-1 mb-4">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <div key={s} className="w-5 h-5 rounded skeleton" />
                    ))}
                  </div>
                  <div className="h-4 w-full rounded skeleton mb-3" />
                  <div className="h-4 w-5/6 rounded skeleton mb-3" />
                  <div className="h-4 w-4/6 rounded skeleton mb-6" />
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                    <div className="w-10 h-10 rounded-full skeleton" />
                    <div>
                      <div className="h-4 w-24 rounded skeleton mb-2" />
                      <div className="h-3 w-20 rounded skeleton" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state - no testimonials available */}
          {!testimonialsLoading && testimonials.length === 0 && (
            <div className="bg-white/80 rounded-2xl shadow-soft p-8 md:p-12 max-w-2xl mx-auto border border-gray-100 text-center">
              <svg className="w-8 h-8 text-trout-gold/30 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
              </svg>
              <p className="text-gray-400 italic text-lg">
                Testimonials will appear here once added by admin.
              </p>
            </div>
          )}

          {/* Testimonial carousel */}
          {!testimonialsLoading && testimonials.length > 0 && (
            <TestimonialCarousel testimonials={testimonials} />
          )}
        </div>
      </section>

      {/* ============================================================
          CTA SECTION
          Final call to action with premium gradient
          ============================================================ */}
      <section
        ref={ctaReveal.observe}
        className="section cta-section bg-gradient-to-br from-forest-700 via-forest-600 to-forest-700 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-trout-gold/30 to-transparent" aria-hidden="true" />

        <div
          className={`
            container-custom text-center relative
            scroll-reveal
            ${ctaReveal.isVisible ? 'is-visible' : ''}
          `}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-shadow-soft">
            Ready to Book an Alberta Fly Fishing Guide?
          </h2>
          <p className="text-lg text-white/90 text-shadow-soft mb-10 max-w-2xl mx-auto leading-relaxed">
            Lock in your preferred dates for Bow River drift trips, Red Deer River walk&#8209;and&#8209;wade outings,
            or fully customized foothills itineraries with Backcountry Drifters.
          </p>
          <Link to="/bookings">
            <Button variant="primary" size="lg">
              View Available Trips
            </Button>
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}

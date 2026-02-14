/* eslint-disable react-hooks/refs */
import { Link } from 'react-router-dom';
import { PageContainer, PageHeader } from '../components/layout';
import { Card, CardContent, Button } from '../components/ui';
import { useScrollReveal, useStaggerReveal } from '../hooks';

/* ------------------------------------------------------------------ */
/* Values data                                                         */
/* ------------------------------------------------------------------ */
const values = [
  {
    title: 'Conservation First',
    description:
      'We practice and promote catch-and-release fishing to preserve Alberta\'s pristine trout populations for future generations.',
    icon: (
      <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    ),
  },
  {
    title: 'Education & Safety',
    description:
      'Every trip is a learning opportunity. We prioritize safe practices, proper technique, and respect for the river environment.',
    icon: (
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    ),
  },
  {
    title: 'Personalized Experience',
    description:
      'Small groups and individual attention ensure that your trip is tailored to your skill level, interests, and goals.',
    icon: (
      <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
];

/* ------------------------------------------------------------------ */
/* Waters data                                                         */
/* ------------------------------------------------------------------ */
const waters = [
  {
    name: 'Bow River',
    description:
      'World-renowned for its blue-ribbon trout fishing, the Bow offers exceptional year-round opportunities for brown and rainbow trout.',
  },
  {
    name: 'Highwood River',
    description:
      'A pristine foothill stream known for its scenic beauty and excellent dry fly fishing.',
  },
  {
    name: 'Oldman River',
    description:
      'Remote sections offering solitude and challenging conditions for experienced anglers.',
  },
  {
    name: 'Private Waters',
    description:
      'Access to exclusive spring creeks and private ranch waters for the ultimate fly fishing experience.',
  },
];

/* ------------------------------------------------------------------ */
/* Certifications                                                      */
/* ------------------------------------------------------------------ */
const certifications = [
  'Licensed Alberta Fishing Guide',
  'Wilderness First Aid Certified',
  'Member, Bow River Trout Foundation',
  'Certified Fly Casting Instructor',
  'Commercial Liability Insurance',
  'Alberta Trout Unlimited Member',
];

/* ------------------------------------------------------------------ */
/* Trip specialties for topical depth                                 */
/* ------------------------------------------------------------------ */
const tripSpecialties = [
  {
    title: 'Bow River Drift Boat Trips',
    summary:
      'Iconic full-day floats covering 15-25 kilometers of blue-ribbon water minutes from downtown Calgary with steady brown and rainbow trout action.',
    location: 'Bow River, Calgary and Southern Alberta',
    season: 'Prime season April-October',
  },
  {
    title: 'Red Deer River Walk-and-Wade',
    summary:
      'Sight-fishing missions through the Red Deer badlands targeting aggressive browns with terrestrials, streamers, and technical dry flies.',
    location: 'Red Deer River corridor',
    season: 'Best mid-June through September',
  },
  {
    title: 'Foothills Freestone Adventures',
    summary:
      'Custom itineraries on the Highwood, Oldman, and Livingstone Rivers that blend alpine hikes with patient instruction for dry fly and Euro nymph tactics.',
    location: 'Southern Alberta foothills',
    season: 'Late May through early October',
  },
  {
    title: 'Multi-Day Rockies Expeditions',
    summary:
      'Fully planned Alberta fly fishing packages combining drift boat days, walk-and-wade exploration, camp catering, and conservation-focused education.',
    location: 'Central and Southern Alberta service area',
    season: 'Available May-October',
  },
];

/* ------------------------------------------------------------------ */
/* About Page Component                                                */
/* ------------------------------------------------------------------ */
export function About() {
  const guideReveal = useScrollReveal<HTMLElement>();
  const valuesReveal = useStaggerReveal<HTMLDivElement>();
  const watersReveal = useScrollReveal<HTMLElement>();
  const certsReveal = useScrollReveal<HTMLElement>();

  return (
    <PageContainer>
      <PageHeader
        title="About Backcountry Drifters Fly Fishing"
        subtitle="Licensed Alberta fly fishing guides delivering Bow River drift trips, Red Deer River walk-and-wade days, and immersive instruction."
      />

      {/* ============================================================
          GUIDE BIO SECTION
          Two-column layout: photo placeholder + bio text
          ============================================================ */}
      <section ref={guideReveal.observe} className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Photo placeholder */}
          <div
            className={`
              scroll-reveal-left
              ${guideReveal.isVisible ? 'is-visible' : ''}
            `}
          >
            <div className="relative">
              <div className="bg-gradient-to-br from-forest-100 to-forest-200 rounded-2xl h-96 md:h-[28rem] flex items-center justify-center overflow-hidden">
                <img src="/bjorn_guidepic.jpg" alt="Backcountry Drifters Guide" className="w-full h-full object-cover" />
              </div>
              {/* Decorative corner accent */}
              <div className="absolute -bottom-3 -right-3 w-24 h-24 border-2 border-trout-gold/20 rounded-2xl" aria-hidden="true" />
            </div>
          </div>

          {/* Bio text */}
          <div
            className={`
              scroll-reveal-right
              ${guideReveal.isVisible ? 'is-visible' : ''}
            `}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-50 text-sm text-forest-600 font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-trout-gold" aria-hidden="true" />
              Licensed Alberta Guide Team
            </div>
            <h2 className="text-3xl font-bold text-forest-800 mb-5">
              Meet Our Alberta Fly Fishing Guides
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                With over 15 years of professional guiding across the Bow River, Red Deer River,
                and southern Alberta foothills, Backcountry Drifters delivers the region's most
                intentional guided fly fishing experiences. Our small team is fully licensed,
                insured, and singularly focused on creating safe, conservation-forward adventures.
              </p>
              <p>
                Born and raised in Calgary, our guides refined their craft rowing the Bow River,
                stalking the Red Deer badlands, and hiking into the Highwood and Oldman systems.
                That on-the-water time translates into precise reads on hatches, flows, and trout
                behavior so every outing doubles as an immersive classroom.
              </p>
              <p>
                Whether you are casting for the first time or refining advanced streamer
                presentations, our coaches pair patient instruction with premium gear,
                seamless logistics, and an unwavering commitment to Alberta fisheries.
                We are here to design the guided trip that matches your goals.
              </p>
            </div>
            {/* Gold divider */}
            <div className="mt-6 w-12 h-0.5 bg-trout-gold rounded-full" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ============================================================
          TRIP SPECIALTIES SECTION
          Service-focused cards with schema cues
          ============================================================ */}
      <section
        className="mb-20"
        aria-labelledby="trip-specialties-heading"
        itemScope
        itemType="https://schema.org/LocalBusiness"
      >
        <meta itemProp="name" content="Backcountry Drifters - Alberta Fly Fishing Guides" />
        <meta itemProp="url" content="https://backcountry-drifters.com" />
        <meta itemProp="areaServed" content="Alberta, Canada" />
        <div className="text-center mb-10">
          <h2 id="trip-specialties-heading" className="text-3xl font-bold text-forest-800 mb-3">
            Guided Trip Specialties
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Explore the Alberta fly fishing packages we run most often. Each service below can be
            customized for solo anglers, small groups, or corporate retreats, and includes premium
            rods, reels, flies, river lunch, transportation on the water, and conservation education.
          </p>
          <div className="mx-auto mt-5 w-12 h-0.5 bg-trout-gold rounded-full" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {tripSpecialties.map((specialty) => (
            <Card key={specialty.title} hover className="h-full">
              <CardContent>
                <article itemScope itemType="https://schema.org/Service" className="flex flex-col h-full">
                  <meta itemProp="serviceType" content={specialty.title} />
                  <h3 className="text-xl font-semibold text-forest-800 mb-2" itemProp="name">
                    {specialty.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed mb-4" itemProp="description">
                    {specialty.summary}
                  </p>
                  <dl className="text-sm text-gray-600 space-y-1 mb-4">
                    <div className="flex gap-2">
                      <dt className="font-semibold text-forest-700">Location:</dt>
                      <dd itemProp="areaServed">{specialty.location}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="font-semibold text-forest-700">Season:</dt>
                      <dd>{specialty.season}</dd>
                    </div>
                  </dl>
                  <Link
                    to="/bookings"
                    itemProp="url"
                    className="inline-flex items-center gap-2 text-forest-700 font-semibold hover:text-forest-900 transition-colors mt-auto"
                  >
                    Check availability
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-4-4l4 4-4 4" />
                    </svg>
                  </Link>
                </article>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/bookings">
            <Button variant="primary" size="lg">
              Book an Alberta Fly Fishing Guide
            </Button>
          </Link>
        </div>
      </section>

      {/* ============================================================
          VALUES SECTION
          Three premium cards with staggered entrance
          ============================================================ */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-forest-800 mb-3">
            Our Values
          </h2>
          <div className="mx-auto w-12 h-0.5 bg-trout-gold rounded-full" aria-hidden="true" />
        </div>

        <div
          ref={valuesReveal.observe}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {values.map((value, index) => (
            <Card
              key={value.title}
              hover
              className={`
                text-center group
                scroll-reveal
                ${valuesReveal.isVisible ? 'is-visible' : ''}
              `}
            >
              <div style={valuesReveal.getStaggerStyle(index, 150)}>
                <CardContent>
                  <div className="w-14 h-14 bg-gradient-to-br from-trout-gold to-trout-gold-dark rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-gold transition-transform duration-300 group-hover:-translate-y-1">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      {value.icon}
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-forest-800 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ============================================================
          OUR WATERS SECTION
          ============================================================ */}
      <section ref={watersReveal.observe} className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-forest-800 mb-3">
            Our Waters
          </h2>
          <div className="mx-auto w-12 h-0.5 bg-trout-gold rounded-full" aria-hidden="true" />
        </div>

        <div
          className={`
            scroll-reveal
            ${watersReveal.isVisible ? 'is-visible' : ''}
          `}
        >
          <Card>
            <CardContent>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Backcountry Drifters Fly Fishing specializes in the premier fly fishing waters
                of the Alberta foothills and Calgary area. Our primary fishing grounds include:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {waters.map((water) => (
                  <div
                    key={water.name}
                    className="p-4 rounded-xl bg-forest-50/50 border border-forest-100 hover:border-forest-200 transition-colors duration-200"
                  >
                    <h4 className="font-semibold text-forest-800 mb-1.5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-trout-gold flex-shrink-0" aria-hidden="true" />
                      {water.name}
                    </h4>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {water.description}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 mt-6 leading-relaxed">
                Each location is carefully chosen based on seasonal conditions, water levels,
                and hatches to ensure the best possible fishing experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ============================================================
          CERTIFICATIONS SECTION
          Clean grid with checkmark icons
          ============================================================ */}
      <section ref={certsReveal.observe} className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-forest-800 mb-3">
            Certifications & Affiliations
          </h2>
          <div className="mx-auto w-12 h-0.5 bg-trout-gold rounded-full" aria-hidden="true" />
        </div>

        <div
          className={`
            bg-forest-50/50 rounded-2xl p-8 md:p-10 border border-forest-100
            scroll-reveal
            ${certsReveal.isVisible ? 'is-visible' : ''}
          `}
        >
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map((cert) => (
              <li key={cert} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-trout-gold mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">{cert}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageContainer>
  );
}

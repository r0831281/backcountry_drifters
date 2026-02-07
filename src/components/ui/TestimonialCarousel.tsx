import { useState, useEffect, useCallback, useRef } from 'react';
import type { Testimonial } from '../../types';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */
const AUTO_ADVANCE_MS = 5500;
const TRANSITION_MS = 600;
const SWIPE_THRESHOLD_PX = 50;
const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

/* ------------------------------------------------------------------ */
/* Responsive helper: how many cards to show at each breakpoint        */
/* ------------------------------------------------------------------ */
function useVisibleCount() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1024) setCount(3);      // lg+
      else if (w >= 768) setCount(2);   // md
      else setCount(1);                 // mobile
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return count;
}

/* ------------------------------------------------------------------ */
/* TestimonialCarousel                                                 */
/* ------------------------------------------------------------------ */
interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const visibleCount = useVisibleCount();
  const totalSlides = testimonials.length;
  const maxIndex = Math.max(0, totalSlides - visibleCount);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  /* Touch / swipe tracking */
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  /* Live region ref for screen reader announcements */
  const liveRegionRef = useRef<HTMLDivElement>(null);

  /* ---- Navigation helpers ---- */
  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, maxIndex));
      if (clamped === currentIndex) return;
      setIsTransitioning(true);
      setCurrentIndex(clamped);
      setTimeout(() => setIsTransitioning(false), TRANSITION_MS);
    },
    [currentIndex, maxIndex]
  );

  const goNext = useCallback(() => {
    /* Wrap around to beginning when reaching the end */
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), TRANSITION_MS);
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    setTimeout(() => setIsTransitioning(false), TRANSITION_MS);
  }, [maxIndex]);

  /* ---- Auto-advance timer ---- */
  useEffect(() => {
    if (isPaused || totalSlides <= visibleCount) return;
    const timer = setInterval(goNext, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [isPaused, goNext, totalSlides, visibleCount]);

  /* ---- Announce slide changes for screen readers ---- */
  useEffect(() => {
    if (liveRegionRef.current) {
      const from = currentIndex + 1;
      const to = Math.min(currentIndex + visibleCount, totalSlides);
      liveRegionRef.current.textContent = `Showing testimonials ${from} through ${to} of ${totalSlides}`;
    }
  }, [currentIndex, visibleCount, totalSlides]);

  /* ---- Keyboard navigation ---- */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    },
    [goNext, goPrev]
  );

  /* ---- Touch handlers for mobile swipe ---- */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (Math.abs(touchDeltaX.current) > SWIPE_THRESHOLD_PX) {
      if (touchDeltaX.current < 0) goNext();
      else goPrev();
    }
    touchDeltaX.current = 0;
  }, [goNext, goPrev]);

  /* ---- If fewer testimonials than visible slots, no carousel needed ---- */
  if (totalSlides <= visibleCount) {
    return (
      <div
        className="grid gap-8"
        style={{ gridTemplateColumns: `repeat(${totalSlides}, minmax(0, 1fr))` }}
        role="list"
        aria-label="Customer testimonials"
      >
        {testimonials.map((t) => (
          <TestimonialCard key={t.id} testimonial={t} />
        ))}
      </div>
    );
  }

  /* ---- Dot navigation ---- */
  const dotCount = maxIndex + 1;

  return (
    <div
      className="testimonial-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer testimonials"
    >
      {/* Screen reader live region */}
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Carousel viewport */}
      <div className="testimonial-carousel__viewport">
        {/* Prev button */}
        <button
          type="button"
          onClick={goPrev}
          className="testimonial-carousel__arrow testimonial-carousel__arrow--prev"
          aria-label="Previous testimonials"
          disabled={isTransitioning}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12.5 15L7.5 10L12.5 5" />
          </svg>
        </button>

        {/* Slide track */}
        <div
          className="testimonial-carousel__overflow"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={trackRef}
            className="testimonial-carousel__track"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
              transition: `transform ${TRANSITION_MS}ms ${EASING}`,
            }}
            aria-live="off"
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="testimonial-carousel__slide"
                style={{ flex: `0 0 ${100 / visibleCount}%` }}
                role="group"
                aria-roledescription="slide"
                aria-label={`Testimonial ${index + 1} of ${totalSlides}`}
                aria-hidden={
                  index < currentIndex || index >= currentIndex + visibleCount
                    ? 'true'
                    : undefined
                }
                tabIndex={
                  index >= currentIndex && index < currentIndex + visibleCount
                    ? 0
                    : -1
                }
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        </div>

        {/* Next button */}
        <button
          type="button"
          onClick={goNext}
          className="testimonial-carousel__arrow testimonial-carousel__arrow--next"
          aria-label="Next testimonials"
          disabled={isTransitioning}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7.5 5L12.5 10L7.5 15" />
          </svg>
        </button>
      </div>

      {/* Dot navigation */}
      <div
        className="testimonial-carousel__dots"
        role="tablist"
        aria-label="Testimonial navigation"
      >
        {Array.from({ length: dotCount }, (_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === currentIndex}
            aria-label={`Go to testimonial group ${i + 1}`}
            className={`testimonial-carousel__dot ${
              i === currentIndex ? 'testimonial-carousel__dot--active' : ''
            }`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Single Testimonial Card                                             */
/* Extracted for reuse; matches the existing premium card design        */
/* ------------------------------------------------------------------ */
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article
      className="
        relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-8
        border border-gray-100 flex flex-col h-full mx-3
        transition-shadow duration-300 hover:shadow-card-hover
      "
    >
      {/* Decorative quote icon */}
      <svg
        className="absolute top-6 right-6 w-10 h-10 text-trout-gold/10"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
      </svg>

      {/* Star rating */}
      <div
        className="flex items-center gap-0.5 mb-5"
        role="img"
        aria-label={`Rated ${testimonial.rating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= testimonial.rating ? 'text-trout-gold' : 'text-gray-200'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Testimonial text */}
      <blockquote className="flex-1 mb-6">
        <p className="text-gray-600 leading-relaxed text-[0.95rem]">
          &ldquo;{testimonial.testimonialText}&rdquo;
        </p>
      </blockquote>

      {/* Customer info footer */}
      <footer className="flex items-center gap-3 pt-5 border-t border-gray-100">
        {testimonial.photoUrl ? (
          <img
            src={testimonial.photoUrl}
            alt=""
            className="w-10 h-10 rounded-full object-cover ring-2 ring-forest-100"
            loading="lazy"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center ring-2 ring-forest-100"
            aria-hidden="true"
          >
            <span className="text-sm font-semibold text-white">
              {testimonial.customerName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <cite className="not-italic text-sm font-semibold text-forest-700 block">
            {testimonial.customerName}
          </cite>
          <span className="text-xs font-medium text-trout-gold">
            {testimonial.tripType}
          </span>
        </div>
      </footer>
    </article>
  );
}

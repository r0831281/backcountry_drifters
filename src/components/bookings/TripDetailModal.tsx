import { Modal, Button } from '../ui';
import { type Trip, formatPrice } from '../../types';

interface TripDetailModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: () => void;
}

export function TripDetailModal({ trip, isOpen, onClose, onBookNow }: TripDetailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={trip.title} maxWidth="2xl">
      <div className="space-y-6">
        {/* Trip image */}
        {trip.photoUrls && trip.photoUrls.length > 0 ? (
          <div className="-mx-6 -mt-6 mb-6 overflow-hidden">
            <img
              src={trip.photoUrls[0]}
              alt={trip.title}
              className="w-full h-64 object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="-mx-6 -mt-6 mb-6 h-64 bg-gradient-to-br from-forest-100 to-forest-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-forest-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}

        {/* Difficulty badge */}
        <div className="mb-4">
          <span className={`
            inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
            ${trip.difficulty === 'Beginner'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : trip.difficulty === 'Intermediate'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }
          `}>
            {trip.difficulty}
          </span>
        </div>

        {/* Full description */}
        <div>
          <h3 className="text-lg font-semibold text-forest-700 mb-3">About This Trip</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {trip.description}
          </p>
        </div>

        {/* Trip details */}
        <div>
          <h3 className="text-lg font-semibold text-forest-700 mb-3">Trip Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-forest-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Duration</div>
                <div className="text-gray-900">{trip.duration}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-forest-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Location</div>
                <div className="text-gray-900">{trip.location}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-forest-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Group Size</div>
                <div className="text-gray-900">Up to {trip.maxGuests} guests</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-forest-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Price</div>
                <div className="text-gray-900">
                  <span className="text-xl font-bold text-forest-800">{formatPrice(trip.price)}</span>
                  <span className="text-sm text-gray-500 ml-1">/person</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Included equipment */}
        {trip.includedEquipment && trip.includedEquipment.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-forest-700 mb-3">Included Equipment</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {trip.includedEquipment.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onBookNow}
            className="flex-1"
          >
            Book Now
          </Button>
        </div>
      </div>
    </Modal>
  );
}

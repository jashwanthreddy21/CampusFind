import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Image as ImageIcon, 
  Sparkles, 
  Camera, 
  MapPin, 
  Building2,
  Layers,
  ZoomIn,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { College } from '../../types';

export interface CampusPhoto {
  url: string;
  caption: string;
  category: 'Campus & Entrance' | 'Academic Block' | 'Library & Labs' | 'Auditorium & Sports' | 'Hostel & Life';
  credit?: string;
}

// Curated high-resolution Unsplash architectural and educational campus photographs
const CAMPUS_PHOTO_PRESETS = {
  iit: [
    {
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      caption: 'Main Academic Quadrangle & Administrative Tower',
      category: 'Campus & Entrance' as const,
      credit: 'Premier Institute Campus Architecture'
    },
    {
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      caption: 'Advanced Computational & AI Research Center',
      category: 'Library & Labs' as const,
      credit: 'Department of Computer Science & Engineering'
    },
    {
      url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80',
      caption: 'Central Digital Library & Innovation Commons',
      category: 'Library & Labs' as const,
      credit: '24x7 Air-Conditioned Reference Section'
    },
    {
      url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
      caption: 'State-of-the-Art Student Convocation Complex',
      category: 'Auditorium & Sports' as const,
      credit: '3000-seater Central Auditorium'
    },
    {
      url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      caption: 'Lush Green Residential Campus & Student Hostels',
      category: 'Hostel & Life' as const,
      credit: 'Tree-lined Walkways & Student Activity Center'
    }
  ],
  nit: [
    {
      url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
      caption: 'Institute Main Heritage Entrance & Lawn',
      category: 'Campus & Entrance' as const,
      credit: 'Institute of National Importance'
    },
    {
      url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
      caption: 'Modern Engineering Workshops & Robotics Wing',
      category: 'Academic Block' as const,
      credit: 'Smart Classrooms & Innovation Hub'
    },
    {
      url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
      caption: 'Central Technical Library & Digital Repository',
      category: 'Library & Labs' as const,
      credit: 'Over 150,000 Technical Volumes & IEEE Access'
    },
    {
      url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
      caption: 'Olympic-Standard Sports Arena & Athletic Complex',
      category: 'Auditorium & Sports' as const,
      credit: 'Floodlit Grounds & Multi-Gymnasium'
    },
    {
      url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
      caption: 'Student Hostels & Open-Air Amphitheatre',
      category: 'Hostel & Life' as const,
      credit: 'Vibrant Campus Life & Cultural Fests'
    }
  ],
  eamcetPremier: [
    {
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      caption: 'Grand Campus Entrance & Administration Block',
      category: 'Campus & Entrance' as const,
      credit: 'Autonomous Engineering Campus'
    },
    {
      url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
      caption: 'High-Tech Computer Science & IoT Research Labs',
      category: 'Library & Labs' as const,
      credit: 'High-Speed Gigabit LAN & GPU Workstations'
    },
    {
      url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
      caption: 'Central Air-Conditioned Knowledge Resource Center',
      category: 'Library & Labs' as const,
      credit: 'Digital Library & Reading Halls'
    },
    {
      url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
      caption: 'Indoor Auditorium & Placement Interview Suites',
      category: 'Auditorium & Sports' as const,
      credit: 'TPO Placement Drives & Industry Talks'
    },
    {
      url: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=1200&q=80',
      caption: 'Green Campus Gardens & Student Cafeteria Courtyard',
      category: 'Hostel & Life' as const,
      credit: 'Sprawling Campus Infrastructure'
    }
  ],
  standard: [
    {
      url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
      caption: 'Main Academic Building & Administrative Wing',
      category: 'Campus & Entrance' as const,
      credit: 'NAAC Accredited Engineering College'
    },
    {
      url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
      caption: 'Interactive Multimedia Lecture Halls & Seminar Rooms',
      category: 'Academic Block' as const,
      credit: 'Modern Teaching Classrooms'
    },
    {
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      caption: 'Specialized Hardware, VLSI & Software Programming Labs',
      category: 'Library & Labs' as const,
      credit: 'Department Laboratories'
    },
    {
      url: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=1200&q=80',
      caption: 'Campus Sports Grounds & Student Cafeteria',
      category: 'Auditorium & Sports' as const,
      credit: 'Extracurricular & Sports Facilities'
    }
  ]
};

// Generates high quality representative photos adapted to the college profile
export function getCollegeCampusPhotos(college: College): CampusPhoto[] {
  if (college.images && college.images.length > 0) {
    return college.images.map(img => ({
      url: img.url,
      caption: img.caption,
      category: img.category || 'Campus & Entrance',
      credit: college.shortName
    }));
  }

  const nameUpper = college.name.toUpperCase();
  const type = college.type;

  let baseList: CampusPhoto[];
  if (nameUpper.includes('INDIAN INSTITUTE OF TECHNOLOGY') || nameUpper.includes('IIT')) {
    baseList = CAMPUS_PHOTO_PRESETS.iit;
  } else if (nameUpper.includes('NATIONAL INSTITUTE OF TECHNOLOGY') || nameUpper.includes('NIT') || nameUpper.includes('IIIT')) {
    baseList = CAMPUS_PHOTO_PRESETS.nit;
  } else if (college.rating >= 4.4 || college.annualFee > 115000 || nameUpper.includes('CBIT') || nameUpper.includes('VNR') || nameUpper.includes('VASAVI') || nameUpper.includes('GRIET')) {
    baseList = CAMPUS_PHOTO_PRESETS.eamcetPremier;
  } else {
    baseList = CAMPUS_PHOTO_PRESETS.standard;
  }

  // Customize captions with college specifics
  return baseList.map((photo, index) => {
    let customCaption = photo.caption;
    if (index === 0) {
      customCaption = `${college.shortName} • ${photo.caption}`;
    }
    return {
      ...photo,
      caption: customCaption,
      credit: `${college.code} • ${college.city}, ${college.state}`
    };
  });
}

interface CollegeImageCarouselProps {
  college: College;
}

export const CollegeImageCarousel: React.FC<CollegeImageCarouselProps> = ({ college }) => {
  const photos = React.useMemo(() => getCollegeCampusPhotos(college), [college]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [imageLoaded, setImageLoaded] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Filter photos by category if requested
  const filteredPhotos = React.useMemo(() => {
    if (selectedCategory === 'all') return photos;
    return photos.filter(p => p.category === selectedCategory);
  }, [photos, selectedCategory]);

  const activePhotoList = filteredPhotos.length > 0 ? filteredPhotos : photos;
  const currentPhoto = activePhotoList[Math.min(currentIndex, activePhotoList.length - 1)] || photos[0];

  // Auto-play slideshow every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || activePhotoList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activePhotoList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, activePhotoList.length]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev - 1 + activePhotoList.length) % activePhotoList.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev + 1) % activePhotoList.length);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  // Unique categories for filter badges
  const categories = React.useMemo(() => {
    const set = new Set(photos.map(p => p.category));
    return ['all', ...Array.from(set)];
  }, [photos]);

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-md transition-all">
      {/* Carousel Top Navigation / Category Pill Bar */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-white/10 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
            <span>Campus Visual Tour</span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({activePhotoList.length} photos)
            </span>
          </span>
        </div>

        {/* Categories selector */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentIndex(0);
                setIsAutoPlaying(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white/10 hover:bg-white/15 text-slate-300'
              }`}
            >
              {cat === 'all' ? 'All Views' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Image Stage */}
      <div 
        className="relative aspect-16/9 sm:aspect-21/9 w-full bg-slate-950 overflow-hidden group select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Current Image */}
        <img
          key={currentPhoto.url}
          src={currentPhoto.url}
          alt={currentPhoto.caption}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-80 blur-xs'
          }`}
        />

        {/* Ambient Dark Gradient for Caption Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

        {/* Previous Button */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous photo"
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-xs transition-all shadow-lg hover:scale-105 border border-white/20 cursor-pointer z-10 opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next photo"
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-xs transition-all shadow-lg hover:scale-105 border border-white/20 cursor-pointer z-10 opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Top Badges: Category & Counter */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-10">
          <span className="px-2.5 py-1 rounded-md bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider uppercase border border-white/10 shadow-xs flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{currentPhoto.category}</span>
          </span>

          <span className="px-2.5 py-1 rounded-md bg-slate-900/85 backdrop-blur-xs text-slate-200 text-[11px] font-mono font-bold border border-white/10 shadow-xs">
            {currentIndex + 1} / {activePhotoList.length}
          </span>
        </div>

        {/* Bottom Caption Overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-1 text-white">
          <div className="max-w-xl">
            <h4 className="text-sm sm:text-base font-extrabold tracking-tight drop-shadow-md text-white">
              {currentPhoto.caption}
            </h4>
            {currentPhoto.credit && (
              <p className="text-[11px] text-slate-300 font-medium flex items-center gap-1 mt-0.5 drop-shadow-xs">
                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                <span>{currentPhoto.credit}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 mt-1 sm:mt-0">
            {college.campusSizeAcres && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs text-white border border-white/20">
                {college.campusSizeAcres} Acres Campus
              </span>
            )}
          </div>
        </div>

        {/* Slide Progress Indicator Dots */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {activePhotoList.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setIsAutoPlaying(false);
              }}
              aria-label={`Jump to photo ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 bg-white shadow-xs'
                  : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail Strip for Fast Navigation */}
      <div className="p-2 sm:p-2.5 bg-slate-950 border-t border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {activePhotoList.map((photo, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setCurrentIndex(idx);
              setIsAutoPlaying(false);
            }}
            className={`relative rounded-lg overflow-hidden shrink-0 aspect-16/9 w-16 sm:w-20 transition-all border-2 cursor-pointer ${
              idx === currentIndex
                ? 'border-indigo-500 scale-105 shadow-md ring-2 ring-indigo-500/40'
                : 'border-transparent opacity-60 hover:opacity-90'
            }`}
          >
            <img
              src={photo.url}
              alt={photo.caption}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-950/20" />
          </button>
        ))}

        <div className="ml-auto pl-2 shrink-0 hidden md:flex items-center gap-1 text-[11px] text-slate-400">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Interactive Campus Gallery</span>
        </div>
      </div>
    </div>
  );
};

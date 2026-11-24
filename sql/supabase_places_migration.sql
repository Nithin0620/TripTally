-- ============================================
-- TRIPTALLY EXPLORE SYSTEM - PLACES TABLE
-- ============================================
-- Run this in Supabase SQL Editor to create the places table
-- and seed with premium content

-- Drop if exists (optional)
-- DROP TABLE IF EXISTS places CASCADE;

-- ============================================
-- CREATE PLACES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Beaches', 'Mountains', 'Cities', 'Spiritual', 'Luxury')),
  state TEXT NOT NULL,
  description TEXT NOT NULL,
  best_time_to_visit TEXT NOT NULL,
  avg_budget TEXT NOT NULL,
  travel_duration TEXT NOT NULL,
  hero_image TEXT NOT NULL,
  gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  hotels JSONB NOT NULL DEFAULT '[]'::jsonb,
  restaurants JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
CREATE INDEX IF NOT EXISTS idx_places_state ON places(state);
CREATE INDEX IF NOT EXISTS idx_places_created ON places(created_at DESC);

-- ============================================
-- SEED DATA - GOA (Beaches & Luxury)
-- ============================================

INSERT INTO places (name, category, state, description, best_time_to_visit, avg_budget, travel_duration, hero_image, gallery_images, hotels, restaurants) VALUES
(
  'Goa',
  'Beaches',
  'Goa',
  'Goa is India''s premier coastal paradise, renowned for its pristine beaches, vibrant nightlife, and rich cultural heritage. This Portuguese-influenced state offers an intoxicating blend of Arabian Sea beauty, swaying palm trees, and golden sands that stretch for miles. Beyond the beaches, Goa mesmerizes visitors with its eclectic mix of ancient temples, colonial architecture, and cosmopolitan beach shacks. Baga Beach pulses with energy and water sports, while Palolem Beach offers a serene, bohemian atmosphere perfect for yoga and meditation. The historic Old Goa quarter showcases magnificent baroque cathedrals and spice markets that transport you centuries back in time. Goa''s legendary seafood restaurants serve fresh catches daily—think king prawns tandoori and pomfret curry. The nightlife is world-class, with beach clubs and lounges offering sunset parties that last until dawn. Whether you''re seeking adventure on Jet Skis, cultural immersion at local festivals, or pure relaxation with your toes in sand, Goa delivers an unforgettable Indian beach experience that rivals any tropical destination globally. The state''s cosmopolitan vibe, warm hospitality, and year-round warm weather make it the perfect escape.',
  'November to February',
  '₹2,000 - ₹5,000 per day',
  '3-5 days',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  '[
    "https://images.unsplash.com/photo-1522441903885-6cb0d2b4a616?w=600&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80"
  ]'::jsonb,
  '[
    {
      "name": "Taj Exotica Resort & Spa",
      "image": "https://images.unsplash.com/photo-1571508601155-1e6dff1e5744?w=400&q=80",
      "description": "Luxury 5-star resort with private beach access, world-class spa, and Michelin-trained chefs.",
      "price_range": "₹15,000 - ₹35,000 per night"
    },
    {
      "name": "The Leela Goa",
      "image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
      "description": "Palatial beachfront palace with championship golf course, multiple dining venues, and exclusive clubs.",
      "price_range": "₹12,000 - ₹30,000 per night"
    },
    {
      "name": "Vivanta by Taj - Colva",
      "image": "https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=400&q=80",
      "description": "Contemporary luxury overlooking Colva Beach with rooftop bar, infinity pool, and gourmet restaurants.",
      "price_range": "₹8,000 - ₹18,000 per night"
    },
    {
      "name": "Fort Tiracol Heritage Hotel",
      "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
      "description": "Heritage hotel in 300-year-old Portuguese fort with just 7 rooms offering authentic historical experience.",
      "price_range": "₹4,000 - ₹8,000 per night"
    }
  ]'::jsonb,
  '[
    {
      "name": "Viva Panjim",
      "image": "https://images.unsplash.com/photo-1498855926480-d98e83099315?w=400&q=80",
      "description": "Charming Goan bistro serving traditional Portuguese and Konkani cuisine in a colorful heritage setting.",
      "cuisine": "Goan-Portuguese Fusion"
    },
    {
      "name": "Pousada by the Beach",
      "image": "https://images.unsplash.com/photo-1504674900150-2b5e1c6b0c0e?w=400&q=80",
      "description": "Beachfront restaurant with remarkable sunset views and fresh seafood prepared with Kerala spices.",
      "cuisine": "Seafood & Kerala Fusion"
    },
    {
      "name": "Cafe Bodega",
      "image": "https://images.unsplash.com/photo-1550632066-e89685900b29?w=400&q=80",
      "description": "Bohemian beach shack iconic for its beach parties, cocktails, and Mediterranean-inspired seafood.",
      "cuisine": "Mediterranean & Cocktails"
    },
    {
      "name": "Indigo House",
      "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
      "description": "Upscale rooftop dining with 360-degree views of Arabian Sea serving modern Indian cuisine.",
      "cuisine": "Modern Indian"
    }
  ]'::jsonb
);

-- ============================================
-- SEED DATA - MANALI (Mountains)
-- ============================================

INSERT INTO places (name, category, state, description, best_time_to_visit, avg_budget, travel_duration, hero_image, gallery_images, hotels, restaurants) VALUES
(
  'Manali',
  'Mountains',
  'Himachal Pradesh',
  'Nestled in the snow-capped Himalayas, Manali is an iconic hill station that epitomizes mountain romance and adventure. This enchanting destination sits at 2,050 meters elevation, surrounded by towering peaks, dense pine forests, and pristine rivers that flow with glacial meltwater. Manali offers an intoxicating blend of adventure sports—paragliding, rock climbing, rappelling—alongside peaceful temples and yoga retreats. The Hadimba Temple, hidden in a cedar forest, exudes spiritual mystique with architecture that blends Hindu and Buddhist elements. Old Manali village preserves the charm of traditional Himalayan culture with cobblestone streets, local cafes, and guest houses that feel like home away from home. The nearby Solang Valley transforms into a winter wonderland with snow sports in December-January. Trekkers find dreams come true on the Inca Malana trek or the dreamy Beas Kund trek with breathtaking vistas. Adventure junkies paraglide over the valley while artists find inspiration in every mountain sunrise. The Manali bazaar bustles with local handicrafts, woolens, and the famous Himachali apples. Whether you seek adrenaline rushes, spiritual awakening, or simple mountain solitude, Manali delivers transformative experiences that stay with you forever.',
  'March to June, September to November',
  '₹1,500 - ₹4,000 per day',
  '3-4 days',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  '[
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    "https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=600&q=80"
  ]'::jsonb,
  '[
    {
      "name": "The Himalayan Resort",
      "image": "https://images.unsplash.com/photo-1571508601155-1e6dff1e5744?w=400&q=80",
      "description": "Luxury alpine resort with meadow views, infinity pool overlooking valleys, and world-class spa.",
      "price_range": "₹8,000 - ₹15,000 per night"
    },
    {
      "name": "Cedar Boutique Hotel",
      "image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
      "description": "Contemporary boutique hotel aged in high mountains with stunning views and locally-sourced dining.",
      "price_range": "₹5,000 - ₹10,000 per night"
    },
    {
      "name": "Banon Resort Manali",
      "image": "https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=400&q=80",
      "description": "Serene riverside resort with adventure center and yoga retreat facilities in pristine setting.",
      "price_range": "₹4,000 - ₹8,000 per night"
    },
    {
      "name": "Span Resort & Spa",
      "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
      "description": "Eco-friendly resort with mountain views, organic farm, and holistic wellness programs.",
      "price_range": "₹3,500 - ₹7,000 per night"
    }
  ]'::jsonb,
  '[
    {
      "name": "Lazy Dog Cafe",
      "image": "https://images.unsplash.com/photo-1498855926480-d98e83099315?w=400&q=80",
      "description": "Iconic bohemian cafe in Old Manali with wood-fired pizza, live music, and mountain views.",
      "cuisine": "Italian & Cafe"
    },
    {
      "name": "Solang Village",
      "image": "https://images.unsplash.com/photo-1504674900150-2b5e1c6b0c0e?w=400&q=80",
      "description": "Authentic Himachali restaurant serving traditional mountain cuisine including dhabha-style meals.",
      "cuisine": "Himachali Traditional"
    },
    {
      "name": "Aaman Khas",
      "image": "https://images.unsplash.com/photo-1550632066-e89685900b29?w=400&q=80",
      "description": "Luxury dining tent camp with white-tablecloth service overlooking Parvati Valley below.",
      "cuisine": "Modern Fusion Fine Dining"
    },
    {
      "name": "Cafe Meraki",
      "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
      "description": "Artisanal cafe featuring organic coffee, freshly-baked pastries, and mountain herb teas.",
      "cuisine": "Cafe & Pastries"
    }
  ]'::jsonb
);

-- ============================================
-- SEED DATA - JAIPUR (Cities)
-- ============================================

INSERT INTO places (name, category, state, description, best_time_to_visit, avg_budget, travel_duration, hero_image, gallery_images, hotels, restaurants) VALUES
(
  'Jaipur',
  'Cities',
  'Rajasthan',
  'The Pink City, Jaipur is a magnificent testament to royal Rajasthani grandeur, blending ancient heritage with vibrant modern energy. Founded in 1727 by Maharaja Sawai Jai Singh II, this walled city is famous for its distinctly pink-colored architecture—a tradition maintained to preserve its heritage. Jaipur''s grid-planned streets reveal a sophisticated understanding of urban design centuries ahead of its time, with wide avenues lined with palaces, temples, and bazaars bursting with textiles, bangles, and gemstones. The City Palace seamlessly merges traditional Rajasthani and Mughal architecture, while residents still live in its royal quarters. The Jantar Mantar, an 18th-century astronomical observation instrument, mystifies visitors with its precision and scale—a UNESCO World Heritage site proving ancient Indians'' scientific brilliance. The iconic Hawa Mahal (Palace of Winds) its 953 intricate pink sandstone latticed windows draws millions seeking that perfect photograph. Beyond monuments, Jaipur pulses with bazaar energy—the Johari Bazaar overflows with precious stones, while food stalls serve Rajasthani delicacies like dal baati churma and gatte ki sabzi. The city''s legendary hospitality, desert safaris, and proximity to majestic forts like Nahargarh make Jaipur essential for any India itinerary.',
  'October to March',
  '₹2,000 - ₹5,000 per day',
  '2-3 days',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  '[
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    "https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=600&q=80"
  ]'::jsonb,
  '[
    {
      "name": "The Oberoi Rajvilas",
      "image": "https://images.unsplash.com/photo-1571508601155-1e6dff1e5744?w=400&q=80",
      "description": "Palace-style luxury resort with royal gardens, spa, and heritage experience with celebrity treatment.",
      "price_range": "₹12,000 - ₹25,000 per night"
    },
    {
      "name": "Rambagh Palace",
      "image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
      "description": "Historic maharaja palace hotel with polo grounds, royal dining, and centuries of heritage.",
      "price_range": "₹10,000 - ₹22,000 per night"
    },
    {
      "name": "Chokhi Dhani",
      "image": "https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=400&q=80",
      "description": "Ethnic Rajasthani village resort with traditional hospitality, folk performances, and camel safaris.",
      "price_range": "₹3,000 - ₹6,000 per night"
    },
    {
      "name": "Hotel Clarks Amer",
      "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
      "description": "City center upscale hotel with rooftop dining overlooking Hawa Mahal with golden hour views.",
      "price_range": "₹5,000 - ₹10,000 per night"
    }
  ]'::jsonb,
  '[
    {
      "name": "Peacock Rooftop Restaurant",
      "image": "https://images.unsplash.com/photo-1498855926480-d98e83099315?w=400&q=80",
      "description": "Heritage rooftop with city skyline views serving authentic Rajasthani royal cuisine.",
      "cuisine": "Rajasthani Royal"
    },
    {
      "name": "Niro''s",
      "image": "https://images.unsplash.com/photo-1504674900150-2b5e1c6b0c0e?w=400&q=80",
      "description": "Institution for 75+ years serving vegetarian Rajasthani specialties and sweets that define tradition.",
      "cuisine": "Vegetarian Rajasthani"
    },
    {
      "name": "Handi Restaurant",
      "image": "https://images.unsplash.com/photo-1550632066-e89685900b29?w=400&q=80",
      "description": "Heritage havelis serving traditional Rajasthani non-veg delicacies with centuries-old recipes.",
      "cuisine": "Rajasthani Heritage"
    },
    {
      "name": "Sardar''s Indian Restaurant",
      "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
      "description": "Grand dining hall with live music and Rajasthani cultural performances during dinner service.",
      "cuisine": "Rajasthani with Entertainment"
    }
  ]'::jsonb
);

-- ============================================
-- SEED DATA - VARANASI (Spiritual)
-- ============================================

INSERT INTO places (name, category, state, description, best_time_to_visit, avg_budget, travel_duration, hero_image, gallery_images, hotels, restaurants) VALUES
(
  'Varanasi',
  'Spiritual',
  'Uttar Pradesh',
  'Varanasi, the City of Light, is Hinduism''s holiest pilgrimage site and one of the world''s oldest continuously inhabited cities. Perched on the banks of the sacred Ganges River, Varanasi radiates an otherworldly spiritual energy that transforms every visitor profoundly. This ancient city of temples, ghats, and narrow alleyways pulsates with devotion, prayer, and the eternal cycle of life and death. Dawn darkens before sunrise as millions descend to the ghats for ritual bathing in the Ganges—believed to cleanse sins accumulated over lifetimes. The famous Aarti ceremony at Dashashwamedh Ghat creates a mystical atmosphere with thousands of oil lamps illuminating the darkness in synchronized prayer. Narrow lanes reveal hidden temples, ashrams where yogis meditate, and markets selling marigold garlands and sacred incense. Kashi Vishwanath Temple, dedicated to Lord Shiva, draws devotees from across the world seeking liberation. Spiritual seekers find profound wisdom in yoga retreats, meditation centers, and interactions with wandering sadhus. The city''s spiritual intensity strips away material concerns, offering clarity and transformation. Sunrise boat rides along the Ganges reveal the city''s soul, while evening walks reveal ancient rituals preserved through millennia. Varanasi awakens something sacred within every person who enters its mystical embrace.',
  'October to March',
  '₹1,000 - ₹3,000 per day',
  '2-3 days',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  '[
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    "https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=600&q=80"
  ]'::jsonb,
  '[
    {
      "name": "Taj Ganges",
      "image": "https://images.unsplash.com/photo-1571508601155-1e6dff1e5744?w=400&q=80",
      "description": "Luxury riverside hotel with spectacular Ganges views, rooftop Aarti ceremony views, and spa.",
      "price_range": "₹5,000 - ₹12,000 per night"
    },
    {
      "name": "The Riverside Retreat",
      "image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
      "description": "Spiritual wellness retreat with yoga, meditation programs overlooking the sacred Ganges.",
      "price_range": "₹2,000 - ₹5,000 per night"
    },
    {
      "name": "Yatri Niwas",
      "image": "https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=400&q=80",
      "description": "Budget temple-guesthouse blend offering spiritual experience with simple comfort and warmth.",
      "price_range": "₹800 - ₹2,000 per night"
    },
    {
      "name": "Shanti Villa",
      "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
      "description": "Peaceful ashram-hotel hybrid with meditation rooms, yoga classes, and vegetarian dining.",
      "price_range": "₹1,500 - ₹3,500 per night"
    }
  ]'::jsonb,
  '[
    {
      "name": "Brown Bread Bakery",
      "image": "https://images.unsplash.com/photo-1498855926480-d98e83099315?w=400&q=80",
      "description": "Beloved cafe of pilgrims and seekers serving organic bread, chai, and wholesome vegetarian fare.",
      "cuisine": "Vegetarian Organic Cafe"
    },
    {
      "name": "Dosa Cafe",
      "image": "https://images.unsplash.com/photo-1504674900150-2b5e1c6b0c0e?w=400&q=80",
      "description": "South Indian specialty with crispy dosas, sambar, and filter coffee amid spiritual travelers.",
      "cuisine": "South Indian"
    },
    {
      "name": "Ganges Garden Vegetarian",
      "image": "https://images.unsplash.com/photo-1550632066-e89685900b29?w=400&q=80",
      "description": "Garden restaurant serving traditional Varanasi vegetarian meals with river views.",
      "cuisine": "Vegetarian Local"
    },
    {
      "name": "Aum Cafe",
      "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
      "description": "Spiritual cafe serving meditation-friendly light meals and healing herbal teas.",
      "cuisine": "Spiritual Light Cuisine"
    }
  ]'::jsonb
);

-- ============================================
-- SEED DATA - KERALA (Beaches)
-- ============================================

INSERT INTO places (name, category, state, description, best_time_to_visit, avg_budget, travel_duration, hero_image, gallery_images, hotels, restaurants) VALUES
(
  'Kerala',
  'Beaches',
  'Kerala',
  'Kerala, God''s Own Country, is a tropical paradise where verdant backwaters meet golden beaches in perfect harmony. This southwestern coastal state weaves together nature''s finest gifts—pristine beaches, emerald lagoons, spice plantations, and lush forests—into an intoxicating tapestry that feels like paradise on earth. The famous Kerala backwaters create a serene network of interconnected lakes, lagoons, and inlets where traditional houseboats drift lazily through coconut groves. These houseboat journeys are meditative experiences, offering glimpses of village life along waterways unchanged for centuries. Kochi, the spice port, preserves colonial charm with Chinese fishing nets that dip and rise rhythmically, Jewish synagogues, and spice markets fragrant with cardamom, pepper, and cinnamon. The beaches—Varkala, Mararikulam, Kovalam—blend with ayurvedic wellness retreats where ancient healing traditions rejuvenate spirit and body. Munnar''s emerald tea plantations drape misty hills while homestays offer authentic experiences in village life. The famous Kerala cuisine—coconut curries, fresh seafood, appam, and dosa—represents culinary heaven on earth. Ayurvedic treatments, yoga retreats, and Kerala Kathakali classical dance performances transport visitors into cultural depth. Whether floating on backwaters at sunrise, sipping chai on beach shacks, or healing in ayurvedic centers, Kerala''s gentle magic transforms every moment into cherished memory.',
  'November to February',
  '₹2,000 - ₹5,000 per day',
  '3-5 days',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  '[
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    "https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=600&q=80"
  ]'::jsonb,
  '[
    {
      "name": "Kumarakom Lake Resort",
      "image": "https://images.unsplash.com/photo-1571508601155-1e6dff1e5744?w=400&q=80",
      "description": "Luxury backwater resort with authentic houseboats, ayurvedic spa, and water sports activities.",
      "price_range": "₹8,000 - ₹18,000 per night"
    },
    {
      "name": "Oberoi Beach Resort Kovalamm",
      "image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
      "description": "Beachfront luxury with cliff-side infinity pools, ayurvedic wellness center, and fine dining.",
      "price_range": "₹10,000 - ₹20,000 per night"
    },
    {
      "name": "Spice Coast Homestay",
      "image": "https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=400&q=80",
      "description": "Authentic Kerala village homestay with organic farming, cooking classes, and family meals.",
      "price_range": "₹2,000 - ₹4,000 per night"
    },
    {
      "name": "Taj Garden Retreat",
      "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
      "description": "Serene plantation retreat with tea garden walks, Ayurvedic treatments, and traditional Kerala cuisine.",
      "price_range": "₹4,000 - ₹9,000 per night"
    }
  ]'::jsonb,
  '[
    {
      "name": "Kayaloram Lake Palace",
      "image": "https://images.unsplash.com/photo-1498855926480-d98e83099315?w=400&q=80",
      "description": "Exclusive houseboat dining with fresh Kerala seafood served while floating on backwaters.",
      "cuisine": "Kerala Seafood"
    },
    {
      "name": "Tejas Restaurant",
      "image": "https://images.unsplash.com/photo-1504674900150-2b5e1c6b0c0e?w=400&q=80",
      "description": "Contemporary Kerala cuisine with sunset beach views, filter coffee, and traditional appam.",
      "cuisine": "Modern Kerala"
    },
    {
      "name": "Cocoanut Grove Backwater Resort",
      "image": "https://images.unsplash.com/photo-1550632066-e89685900b29?w=400&q=80",
      "description": "Romantic backwater dining with fish curry, toddy, and authentic village cook experiences.",
      "cuisine": "Traditional Kerala Village"
    },
    {
      "name": "Fusion and Vibe",
      "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
      "description": "Beach shack fusion serving Kerala meets international with rooftop cocktails and live music.",
      "cuisine": "Fusion Beachside"
    }
  ]'::jsonb
);

-- ============================================
-- SEED DATA - LADAKH (Mountains)
-- ============================================

INSERT INTO places (name, category, state, description, best_time_to_visit, avg_budget, travel_duration, hero_image, gallery_images, hotels, restaurants) VALUES
(
  'Ladakh',
  'Mountains',
  'Ladakh',
  'Ladakh, the Land of High Passes, is a mesmerizing Himalayan wonder where snow-capped peaks touch celestial skies above an otherworldly landscape of stark beauty. Sitting at dizzying altitudes of 11,000-16,000 feet, Ladakh offers landscapes so dramatic and alien they feel like traversing another planet. This mystical region blends Buddhist spirituality, rugged adventure, and pristine solitude in a way few places on Earth can match. Leh, the main city, preserves Tibetan architecture and culture with monasteries like Hemis and Thiksey perched precariously on mountain cliffs, their golden stupas gleaming under brilliant sunshine. Trekking opportunities are legendary—the Markha Valley trek, Chadar trek on frozen rivers, and Kang Yatse trek reveal landscapes of impossible beauty. Lakes like Pangong Tso and Moriri shimmer in etheric blue, reflecting endless mountains in mirror-like waters. The mono-lake Tso Moriri remains one of Earth''s last untouched places, where migratory birds gather and silence speaks louder than words. Adventure activities—mountain biking, rock climbing, river rafting—challenge the body while meditation and observation nourish the soul. The spiritual energy is palpable—stay in homestays with Buddhist families, attend monastery prayers, and experience philosophy through lived example. Ladakh''s extreme beauty, rarefied air, and profound silence transform consciousness, expanding awareness beyond normal human limits. This is not tourism; this is pilgrimage to one of Earth''s most sacred landscapes.',
  'June to September',
  '₹3,000 - ₹6,000 per day',
  '4-5 days',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  '[
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    "https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=600&q=80"
  ]'::jsonb,
  '[
    {
      "name": "The Grand Dragon Ladakh",
      "image": "https://images.unsplash.com/photo-1571508601155-1e6dff1e5744?w=400&q=80",
      "description": "Luxury heritage hotel preserving Ladakhi architecture with monasteries view and wellness center.",
      "price_range": "₹6,000 - ₹12,000 per night"
    },
    {
      "name": "Ladakh Homestay Network",
      "image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
      "description": "Authentic Buddhist family homestays offering wholesome meals, genuine hospitality, and cultural immersion.",
      "price_range": "₹1,500 - ₹3,500 per night"
    },
    {
      "name": "Nubra Sands Camp",
      "image": "https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=400&q=80",
      "description": "Luxury tented camp in Nubra Valley with camel safaris and stunning mountain vistas.",
      "price_range": "₹4,000 - ₹8,000 per night"
    },
    {
      "name": "Pangong Lake Resort",
      "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
      "description": "Lakeside eco-lodge with panoramic views of Pangong Tso''s changing azure waters.",
      "price_range": "₹3,000 - ₹6,000 per night"
    }
  ]'::jsonb,
  '[
    {
      "name": "Lamayuru Monastery Cafe",
      "image": "https://images.unsplash.com/photo-1498855926480-d98e83099315?w=400&q=80",
      "description": "Spiritual cafe serving Ladakhi momos, butter tea, and simple meals with monastery views.",
      "cuisine": "Ladakhi Traditional"
    },
    {
      "name": "Gesmo Restaurant & Guest House",
      "image": "https://images.unsplash.com/photo-1504674900150-2b5e1c6b0c0e?w=400&q=80",
      "description": "Cozy restaurant famous for yak momos, thukpa, and warm Ladakhi hospitality.",
      "cuisine": "Ladakhi Comfort Food"
    },
    {
      "name": "Tibetan Kitchen",
      "image": "https://images.unsplash.com/photo-1550632066-e89685900b29?w=400&q=80",
      "description": "Authentic Tibetan fare—momos, thukpa, tsampa—served in prayer-filled traditional setting.",
      "cuisine": "Tibetan"
    },
    {
      "name": "Leh Kushok Bakery",
      "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
      "description": "Famous for apricot pies, fresh bread, and organic vegetables from local Ladakhi farms.",
      "cuisine": "Organic Bakery"
    }
  ]'::jsonb
);

-- ============================================
-- SEED DATA - MUMBAI (Cities & Luxury)
-- ============================================

INSERT INTO places (name, category, state, description, best_time_to_visit, avg_budget, travel_duration, hero_image, gallery_images, hotels, restaurants) VALUES
(
  'Mumbai',
  'Cities',
  'Maharashtra',
  'Mumbai, the City of Dreams, pulsates with Bollywood glamour, financial ambition, and infectious energy that defines modern India. This metropolis of 20+ million souls transforms nightscape into glittering jewelry, with sea views from Marine Drive creating the famous ''Queen''s Necklace.'' Mumbai seamlessly blends colonial heritage—Gateway of India, Victorian architecture—with gleaming glass towers representing India''s future. Film enthusiasts genuflect at FilmCity where Bollywood dreams materialize, while the industry''s magnetism attracts talent from across the globe. The city''s neighborhoods each possess distinct personalities: bohemian Colaba with art galleries and cafes, upscale Bandra with nightlife and fashion, spiritual Mahim with mosques and temples predating the city itself. Street food culture reaches apotheosis here—vada pavs, pav bhaji, and bhelpuri from humble stalls rival Michelin-star cuisine in passion and authenticity. The iconic Taj Mahal Palace Hotel epitomizes luxury while the Afghan Memorial Church, Jain temples, and Zoroastrian fire temples celebrate religious diversity. Western suburbs pulse with night markets, while South Mumbai preserves history. Beaches—Worli, Bandstand, Juhu—offer respite from urban frenzy. Shopping ranges from Colaba''s vintage bookstalls to Linking Road''s fashion emporiums. Mumbai never sleeps—24-hour culture, late-night restaurants, and constant energy create electric atmosphere where anything seems possible. This is India'' most cosmopolitan city, where tradition and modernity dance together under brilliant stars.',
  'October to March',
  '₹3,000 - ₹8,000 per day',
  '2-3 days',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  '[
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    "https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=600&q=80"
  ]'::jsonb,
  '[
    {
      "name": "Taj Mahal Palace",
      "image": "https://images.unsplash.com/photo-1571508601155-1e6dff1e5744?w=400&q=80",
      "description": "Iconic heritage luxury hotel overlooking Gateway of India with world-class dining and spa.",
      "price_range": "₹20,000 - ₹40,000 per night"
    },
    {
      "name": "Four Seasons Mumbai",
      "image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
      "description": "Ultra-luxury high-rise with panoramic Arabian Sea views, Michelin-starred restaurants, and opulence.",
      "price_range": "₹18,000 - ₹35,000 per night"
    },
    {
      "name": "The Oberoi Mumbai",
      "image": "https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=400&q=80",
      "description": "Art-deco inspired luxury on Nariman Point with fine dining, spa, and city vistas.",
      "price_range": "₹12,000 - ₹25,000 per night"
    },
    {
      "name": "Fariyas Hotel",
      "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
      "description": "Historic colonial hotel in Colaba preserving old-world charm with modern luxury and Central location.",
      "price_range": "₹8,000 - ₹15,000 per night"
    }
  ]'::jsonb,
  '[
    {
      "name": "Trishna",
      "image": "https://images.unsplash.com/photo-1498855926480-d98e83099315?w=400&q=80",
      "description": "Century-old Parsi institution serving legendary Tandoori dishes and Biryani in heritage setting.",
      "cuisine": "Parsi-Mughlai Heritage"
    },
    {
      "name": "Mahesh Lunch Home",
      "image": "https://images.unsplash.com/photo-1504674900150-2b5e1c6b0c0e?w=400&q=80",
      "description": "Michelin-recognized seafood restaurant with coastal curries and fresh fish prepared with art.",
      "cuisine": "Modern Coastal Indian"
    },
    {
      "name": "Table at Soho House",
      "image": "https://images.unsplash.com/photo-1550632066-e89685900b29?w=400&q=80",
      "description": "Exclusive rooftop dining with Mumbai cityscape backdrop and contemporary European cuisine.",
      "cuisine": "Contemporary European"
    },
    {
      "name": "Cote by Lionel Esteve",
      "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
      "description": "Fine dining French restaurant with Indian influences and sommelier-curated wine pairings.",
      "cuisine": "French-Indian Fusion"
    }
  ]'::jsonb
);

-- ============================================
-- SEED DATA - RISHIKESH (Spiritual)
-- ============================================

INSERT INTO places (name, category, state, description, best_time_to_visit, avg_budget, travel_duration, hero_image, gallery_images, hotels, restaurants) VALUES
(
  'Rishikesh',
  'Spiritual',
  'Uttar Pradesh',
  'Rishikesh, the Yoga Capital of the World, is a spiritual sanctuary where the sacred Ganges River flows through a valley of ashrams, temples, and meditation centers. This ancient pilgrim city transforms visitors through yoga, meditation, and direct engagement with divine energy that permeates every cobblestone and prayer. Rishikesh pulses to rhythms of eastern spirituality—sunrise brings synchronized prayers from dozens of ashrams, while mantras echo from riverside ghats where pilgrims gather to honor Mother Ganges. The city is divided by the river: South Rishikesh focuses on commerce and temples, while North Rishikesh (Muni ki Reti) offers serenity and yoga retreats. World-famous ashrams like Ananda Yoga Ashram and Parmarth Niketan offer multi-week immersive programs combining hatha yoga, breathing techniques, philosophy, and sacred teachings. The famous Aarti ceremony at Parmarth Ghat at dusk creates transcendent atmosphere with hundreds of lamps glowing against twilight. Adventure enthusiasts find river rafting, rock climbing, and trekking alongside spiritual practices. Swarg Ashram island offers meditative silence disrupted only by monkey chatter and river sounds. Street food and ashram meals offer simple nourishment reflecting sattvic principles. Beatles connections (their 1968 Transcendental Meditation retreat here) attract cultural pilgrims. Whether seeking yoga teacher training, meditation retreat, or spiritual renewal, Rishikesh''s proven ability to awaken inner light makes it transformative for every sincere seeker.',
  'September to March',
  '₹1,000 - ₹3,500 per day',
  '3-7 days',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  '[
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    "https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=600&q=80"
  ]'::jsonb,
  '[
    {
      "name": "Yoga Capital Retreat",
      "image": "https://images.unsplash.com/photo-1571508601155-1e6dff1e5744?w=400&q=80",
      "description": "Holistic wellness retreat with yoga studio, meditation hall, Ayurvedic treatments, and organic meals.",
      "price_range": "₹3,000 - ₹6,000 per night"
    },
    {
      "name": "Ananda Yoga Ashram",
      "image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
      "description": "Legendary ashram offering yoga certification programs, daily meditation, and spiritual teachings.",
      "price_range": "₹1,500 - ₹3,500 per night"
    },
    {
      "name": "Parmarth Niketan Ashram",
      "image": "https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=400&q=80",
      "description": "Ancient ashram on Ganges offering daily yoga, meditation, evening Aarti, and simple rooms.",
      "price_range": "₹1,000 - ₹2,500 per night"
    },
    {
      "name": "Hosteller Rishikesh",
      "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
      "description": "Social hostel with yoga classes, rooftop Ganges views, and community building for spiritual travelers.",
      "price_range": "₹600 - ₹1,500 per night"
    }
  ]'::jsonb,
  '[
    {
      "name": "Ganga Cafe",
      "image": "https://images.unsplash.com/photo-1498855926480-d98e83099315?w=400&q=80",
      "description": "Spiritual vegetarian cafe with organic ingredients, fresh juices, and sattvic meals for yoga practitioners.",
      "cuisine": "Sattvic Vegetarian"
    },
    {
      "name": "Little Buddha Cafe",
      "image": "https://images.unsplash.com/photo-1504674900150-2b5e1c6b0c0e?w=400&q=80",
      "description": "Boho riverside cafe serving Asian fusion with meditation cushions and healing herbal teas.",
      "cuisine": "Asian Fusion Spiritual"
    },
    {
      "name": "The Terrasse",
      "image": "https://images.unsplash.com/photo-1550632066-e89685900b29?w=400&q=80",
      "description": "Relaxed rooftop restaurant with Ganges views serving vegetarian Indian and Italian fusion.",
      "cuisine": "Vegetarian Fusion"
    },
    {
      "name": "Ashram Dining Hall",
      "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
      "description": "Traditional ashram mess serving simple, nutritious vegetarian meals reflecting ancient yogic principles.",
      "cuisine": "Traditional Ashram Food"
    }
  ]'::jsonb
);

-- Insert 2 more places to strengthen Luxury category (currently only Goa)
-- ============================================
-- ADDITIONAL INSERT: Udaipur (Luxury)
-- ============================================

INSERT INTO places (name, category, state, description, best_time_to_visit, avg_budget, travel_duration, hero_image, gallery_images, hotels, restaurants) VALUES
(
  'Udaipur',
  'Luxury',
  'Rajasthan',
  'Udaipur, the Venice of India, is a romantic fairytale city where marble palaces float on mirror-like lakes surrounded by arid Rajasthani hills. This ancient city, founded in 1559, epitomizes Rajasthani royal grandeur with architecture melding Hindu and Mughal styles into breathtaking harmony. The iconic City Palace seamlessly blends tradition with royalty—parts remain the residence of the royal family while others welcome guests for unforgettable experiences. Lake Pichola, ringed with cenotaphs and temples, creates dreamlike atmosphere particularly at sunset when golden light bathes the city in romantic hues. The island palace Jag Niwas (now Taj Lake Palace hotel) seems to float on water like a jewel—so ethereal it appears unreal. Udaipur''s labyrinthine old city explores narrow lanes hiding temples, stepwells, and bazaars selling tie-dye textiles and silver jewelry. Saheliyon ki Bari (Garden of Maidens) offers respite with fountains, sculptures, and mango groves. The city pulses with cultural events—classical dance performances, traditional puppet shows, and lakeside Aarti ceremonies. Every corner reveals picture-perfect vistas that have inspired filmmakers—major Bollywood and international films shoot here. Cuisine blends Rajasthani traditions with royal cooking styles reflecting centuries of culinary excellence. Whether floating on a sunset boat ride, exploring palace labyrinth, or dining overlooking Lake Pichola, Udaipur weaves romance into every moment, earning its reputation as India''s most romantic city.',
  'October to March',
  '₹3,000 - ₹7,000 per day',
  '2-3 days',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  '[
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    "https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=600&q=80"
  ]'::jsonb,
  '[
    {
      "name": "Taj Lake Palace",
      "image": "https://images.unsplash.com/photo-1571508601155-1e6dff1e5744?w=400&q=80",
      "description": "Legendary floating island palace hotel offering unparalleled luxury with lake views and royal treatment.",
      "price_range": "₹20,000 - ₹40,000 per night"
    },
    {
      "name": "The Oberoi Udaipur",
      "image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
      "description": "Lakefront luxury with infinity pools, spa, and fine dining overlooking Lake Pichola and City Palace.",
      "price_range": "₹12,000 - ₹25,000 per night"
    },
    {
      "name": "Fateh Prakash Palace",
      "image": "https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=400&q=80",
      "description": "Heritage palace hotel part of royal family''s private residence offering authentic royal experience.",
      "price_range": "₹10,000 - ₹20,000 per night"
    },
    {
      "name": "Lakend Hotel",
      "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
      "description": "Boutique lakeside hotel with rooftop views, intimate dining, and romantic ambiance.",
      "price_range": "₹5,000 - ₹10,000 per night"
    }
  ]'::jsonb,
  '[
    {
      "name": "Ambrai Restaurant",
      "image": "https://images.unsplash.com/photo-1498855926480-d98e83099315?w=400&q=80",
      "description": "Iconic waterfront restaurant serving Rajasthani cuisine with City Palace backdrop and sunset views.",
      "cuisine": "Rajasthani with Heritage Ambiance"
    },
    {
      "name": "Jagat Niwas Palace Restaurant",
      "image": "https://images.unsplash.com/photo-1504674900150-2b5e1c6b0c0e?w=400&q=80",
      "description": "Heritage palace dining with lake views, traditional Rajasthani thali, and royal hospitality.",
      "cuisine": "Rajasthani Royal"
    },
    {
      "name": "Sunset Terrace",
      "image": "https://images.unsplash.com/photo-1550632066-e89685900b29?w=400&q=80",
      "description": "Romantic rooftop dining with 360-degree lake views, international and Indian fusion cuisine.",
      "cuisine": "Fusion Fine Dining"
    },
    {
      "name": "Mahendra Prakash Bhojnalaya",
      "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
      "description": "Local institution for authentic Rajasthani vegetarian cuisine and traditional sweets.",
      "cuisine": "Vegetarian Rajasthani"
    }
  ]'::jsonb
);

-- Index creation for optimization
CREATE INDEX IF NOT EXISTS idx_places_name ON places(name);
CREATE INDEX IF NOT EXISTS idx_places_state_category ON places(state, category);

COMMIT;

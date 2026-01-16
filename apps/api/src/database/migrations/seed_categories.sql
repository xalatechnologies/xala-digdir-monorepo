-- Seed rental object categories
INSERT INTO rental_object_categories (code, name, name_en, description, description_en, icon, examples, sort_order, enabled)
VALUES 
  ('LOKALER_OG_BANER', 'Lokaler og baner', 'Locations and Venues', 'Fysiske lokaler, idrettsanlegg, møterom og utendørs baner', 'Physical premises, sports facilities, meeting rooms and outdoor courts', 'building', '["Idrettshall", "Møterom", "Grendehus", "Fotballbane", "Gymsal", "Klasserom"]', 1, true),
  ('UTSTYR_OG_INVENTAR', 'Utstyr og inventar', 'Equipment and Inventory', 'Utlånbart utstyr, verktøy og inventar', 'Loanable equipment, tools and inventory', 'tool', '["Grillhenger", "Lydanlegg", "Bord og stoler", "Sportsutstyr", "Partytelt"]', 2, true),
  ('KJORETOY_OG_TRANSPORT', 'Kjøretøy og transport', 'Vehicles and Transport', 'Kjøretøy, tilhengere og transportmidler', 'Vehicles, trailers and means of transport', 'car', '["Minibuss", "El-bil", "Tilhenger", "Sykkel", "Varebil"]', 3, true),
  ('OPPLEVELSER_OG_ARRANGEMENT', 'Opplevelser og arrangement', 'Experiences and Events', 'Tidsbundne arrangementer, kurs og aktiviteter', 'Time-bound events, courses and activities', 'calendar', '["Konsert", "Workshop", "Guidet tur", "Kurs", "Teater", "Utstilling"]', 4, true)
ON CONFLICT (code) DO NOTHING;

-- Create booking_time_modes table if not exists
CREATE TABLE IF NOT EXISTS booking_time_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  description TEXT,
  description_en TEXT,
  calendar_behavior VARCHAR(100),
  icon VARCHAR(100),
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert time modes
INSERT INTO booking_time_modes (code, name, name_en, description, description_en, calendar_behavior, icon, sort_order, enabled)
VALUES 
  ('PERIOD', 'Tidsperiode', 'Time Period', 'Velg start- og sluttidspunkt for booking', 'Select start and end time for booking', 'drag-select', 'clock', 1, true),
  ('SLOT', 'Tidsluke', 'Time Slot', 'Velg fra forhåndsdefinerte tidsluker', 'Select from predefined time slots', 'slot-grid', 'grid', 2, true),
  ('ALL_DAY', 'Heldags', 'All Day', 'Book hele dager eller flere dager', 'Book full days or multiple days', 'date-picker', 'calendar', 3, true)
ON CONFLICT (code) DO NOTHING;

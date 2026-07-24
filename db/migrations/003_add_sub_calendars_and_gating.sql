-- Migration: 003_add_sub_calendars_and_gating.sql
-- Add service_duration_minutes to bookings table for sub-calendar duration slot calculations

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS service_duration_minutes INTEGER NOT NULL DEFAULT 60;

-- Add index on service_type & duration for fast sub-calendar availability lookups
CREATE INDEX IF NOT EXISTS idx_bookings_service_duration 
ON bookings(service_type, service_duration_minutes);

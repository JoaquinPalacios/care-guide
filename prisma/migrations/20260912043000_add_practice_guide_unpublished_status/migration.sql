-- Additive publication state. Unpublished guides keep the clinic record,
-- working draft, and published revision history, but drop the public pin.
ALTER TYPE "PracticeGuideStatus" ADD VALUE 'UNPUBLISHED';

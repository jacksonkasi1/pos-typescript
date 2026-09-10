-- Add centiliter to inventory unit enum (1 cl = 10 ml)
ALTER TYPE unitofmeasure ADD VALUE IF NOT EXISTS 'centiliter';

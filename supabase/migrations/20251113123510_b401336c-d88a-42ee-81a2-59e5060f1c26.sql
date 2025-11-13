-- Add barcode column to inventory table
ALTER TABLE public.inventory
ADD COLUMN barcode text;

-- Create index for barcode lookups
CREATE INDEX idx_inventory_barcode ON public.inventory(barcode);
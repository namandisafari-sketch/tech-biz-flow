-- Add customer_type to customers table
ALTER TABLE customers 
ADD COLUMN customer_type text NOT NULL DEFAULT 'retail' CHECK (customer_type IN ('retail', 'wholesale'));

-- Add wholesale_price to inventory table
ALTER TABLE inventory 
ADD COLUMN wholesale_price numeric DEFAULT 0;

-- Add customer_type to jobs table for tracking
ALTER TABLE jobs 
ADD COLUMN customer_type text DEFAULT 'retail' CHECK (customer_type IN ('retail', 'wholesale'));
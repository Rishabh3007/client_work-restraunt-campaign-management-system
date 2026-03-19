-- Add optional minimum_order_value and attention_text columns to campaigns
ALTER TABLE campaigns ADD COLUMN minimum_order_value DECIMAL(10,2);
ALTER TABLE campaigns ADD COLUMN attention_text TEXT;

-- Add optional invoice column to campaign_registrations
ALTER TABLE campaign_registrations ADD COLUMN invoice VARCHAR(255);

-- DB Rule: Only one active campaign at a time
-- Function to enforce the rule
CREATE OR REPLACE FUNCTION enforce_single_active_campaign()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE campaigns 
    SET status = 'inactive' 
    WHERE id != NEW.id AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute the function before insert or update
CREATE TRIGGER single_active_campaign_trigger
  BEFORE INSERT OR UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_active_campaign();

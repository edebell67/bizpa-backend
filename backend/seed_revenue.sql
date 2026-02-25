
INSERT INTO message_templates (name, body, category, user_id) VALUES 
('Payment Chase (Soft)', 'Hi {{client_name}}, just a friendly reminder that invoice {{reference}} for £{{amount}} is now overdue. Would you mind checking on this? Thanks!', 'payment_chase', '00000000-0000-0000-0000-000000000000'),
('Re-service (6 Month)', 'Hi {{client_name}}, it has been 6 months since your last {{service}} with us. Would you like to book in a follow-up? Best regards.', 'reservice', '00000000-0000-0000-0000-000000000000');

INSERT INTO trigger_rules (trigger_type, trigger_config, action_template_id, user_id) 
SELECT 'unpaid_invoice', '{"days_overdue": 3}'::jsonb, id, user_id FROM message_templates WHERE category = 'payment_chase';

INSERT INTO trigger_rules (trigger_type, trigger_config, action_template_id, user_id) 
SELECT 'time_since_last_job', '{"months_since": 6}'::jsonb, id, user_id FROM message_templates WHERE category = 'reservice';

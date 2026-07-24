-- Migration: 002_add_workflow_safeguards.sql
-- Add re-entry controls & execution window safeguards to active_workflows table

ALTER TABLE active_workflows
ADD COLUMN IF NOT EXISTS allow_reentry BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS execution_window_json JSONB NOT NULL DEFAULT '{
    "enabled": false,
    "allowed_days": [1, 2, 3, 4, 5],
    "start_time": "08:00",
    "end_time": "18:00",
    "timezone": "America/New_York"
}'::jsonb;

-- Add index for fast workflow lookup by active state & tenant
CREATE INDEX IF NOT EXISTS idx_active_workflows_active_tenant 
ON active_workflows(tenant_id, is_active) 
WHERE is_active = true;

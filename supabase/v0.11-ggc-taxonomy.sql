-- supabase/v0.11-ggc-taxonomy.sql
-- Full GGC taxonomy seed. Safe to run multiple times (ON CONFLICT DO NOTHING).

INSERT INTO node_types (id, label, description, color, sort_order) VALUES
  ('hunch',        'Hunch',         'A directional belief about how governance change happens',           '#7F77DD', 1),
  ('assumption',   'Assumption',    'A testable proposition an experiment depends on',                   '#1D9E75', 2),
  ('signal',       'Signal',        'A raw observation from reality',                                    '#A32D2D', 3),
  ('friction',     'Friction',      'A specific blocker, tension, or resistance',                        '#D85A30', 4),
  ('learning',     'Learning',      'A synthesised insight derived from signals and frictions',          '#378ADD', 5),
  ('experiment',   'Experiment',    'A structured unit of inquiry',                                      '#0F6E56', 6),
  ('outcome',      'Outcome',       'A specific intended outcome of an experiment',                      '#085041', 7),
  ('commitment',   'Commitment',    'Individual or organisational commitment from the social contract',  '#185FA5', 8),
  ('intervention', 'Intervention',  'A concrete change implemented — new ritual, role, or process',     '#BA7517', 9),
  ('decision',     'Decision',      'A choice or direction taken, distinct from its implementation',    '#D4537E', 10),
  ('person',       'Person',        'Anyone in the organisation',                                        '#888780', 11),
  ('meeting_notes','Meeting Notes', 'A call or meeting transcript — extracts multiple nodes',            '#888780', 12)
ON CONFLICT (id) DO NOTHING;

INSERT INTO edge_types (id, label, is_directional) VALUES
  ('supports',      'Supports',      true),
  ('contradicts',   'Contradicts',   true),
  ('requires',      'Requires',      true),
  ('evolved_from',  'Evolved from',  true),
  ('tested_by',     'Tested by',     true),
  ('produced',      'Produced',      true),
  ('connected_to',  'Connected to',  false),
  ('works_at',      'Works at',      true),
  ('authored_by',   'Authored by',   true),
  ('challenges',    'Challenges',    true)
ON CONFLICT (id) DO NOTHING;

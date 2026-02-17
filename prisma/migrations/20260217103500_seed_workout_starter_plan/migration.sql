WITH upsert_plan AS (
  INSERT INTO "WorkoutPlan" (
    "id",
    "slug",
    "title",
    "description",
    "updatedAt"
  )
  VALUES (
    'workout_plan_starter_7_day',
    'starter-7-day',
    '7-day starter plan',
    'Progressive rope plan with intervals, recovery, and a mini challenge finish.',
    CURRENT_TIMESTAMP
  )
  ON CONFLICT ("slug") DO UPDATE
  SET
    "title" = EXCLUDED."title",
    "description" = EXCLUDED."description",
    "updatedAt" = CURRENT_TIMESTAMP
  RETURNING "id"
),
plan_row AS (
  SELECT "id" FROM upsert_plan
  UNION ALL
  SELECT "id" FROM "WorkoutPlan" WHERE "slug" = 'starter-7-day'
  LIMIT 1
),
day_seed AS (
  SELECT *
  FROM (
    VALUES
      (
        1,
        'day-1',
        'Just get comfortable',
        '5 rounds. Jump 20 sec, rest 40 sec.',
        '~8-10 min jumping',
        'Timing + relaxed shoulders',
        'Do not chase speed yet. Keep smooth bouncing.',
        NULL,
        NULL
      ),
      (
        2,
        'day-2',
        'Build rhythm',
        '6 rounds. Jump 25 sec, rest 35 sec.',
        '~10-12 min',
        NULL,
        NULL,
        'Optional finisher: 2 min easy walking.',
        NULL
      ),
      (
        3,
        'day-3',
        'Endurance starter',
        '5 rounds. Jump 40 sec, rest 40 sec.',
        '~12-15 min',
        NULL,
        NULL,
        'Then 3 min brisk walk or light jog.',
        NULL
      ),
      (
        4,
        'day-4',
        'Active recovery',
        'Recovery-focused day. Easy effort only.',
        'No hard jumping',
        NULL,
        'Recovery = faster progress.',
        NULL,
        'Choose one: 10 min easy jumping (slow, relaxed) OR walk + stretch calves + ankles.'
      ),
      (
        5,
        'day-5',
        'Longer intervals',
        '6 rounds. Jump 45 sec, rest 30 sec.',
        '~15 min',
        NULL,
        'If you feel good, add 2 extra rounds.',
        NULL,
        NULL
      ),
      (
        6,
        'day-6',
        'Fun skill day',
        '8 rounds. Jump 30 sec, rest 30 sec.',
        '~15-18 min',
        NULL,
        'Keep it playful.',
        NULL,
        'Mix in high knees (5 sec), side-to-side hops, or one-foot jumps if comfortable.'
      ),
      (
        7,
        'day-7',
        'Mini challenge day',
        '10 rounds. Jump 60 sec, rest 30 sec.',
        '~20 min',
        NULL,
        'That is 10 minutes of jumping total. Huge progress.',
        'Finish with calf stretch + deep breathing.',
        NULL
      )
  ) AS seed (
    day_number,
    slug,
    title,
    summary,
    total_label,
    focus,
    tip,
    finisher,
    options
  )
),
upsert_days AS (
  INSERT INTO "WorkoutDay" (
    "id",
    "planId",
    "dayNumber",
    "slug",
    "title",
    "summary",
    "totalLabel",
    "focus",
    "tip",
    "finisher",
    "options",
    "updatedAt"
  )
  SELECT
    'workout_day_starter_7_day_' || day_seed.day_number::TEXT,
    plan_row."id",
    day_seed.day_number,
    day_seed.slug,
    day_seed.title,
    day_seed.summary,
    day_seed.total_label,
    day_seed.focus,
    day_seed.tip,
    day_seed.finisher,
    day_seed.options,
    CURRENT_TIMESTAMP
  FROM day_seed
  CROSS JOIN plan_row
  ON CONFLICT ("planId", "dayNumber") DO UPDATE
  SET
    "slug" = EXCLUDED."slug",
    "title" = EXCLUDED."title",
    "summary" = EXCLUDED."summary",
    "totalLabel" = EXCLUDED."totalLabel",
    "focus" = EXCLUDED."focus",
    "tip" = EXCLUDED."tip",
    "finisher" = EXCLUDED."finisher",
    "options" = EXCLUDED."options",
    "updatedAt" = CURRENT_TIMESTAMP
  RETURNING "id", "dayNumber"
),
round_count_seed AS (
  SELECT *
  FROM (VALUES (1, 5), (2, 6), (3, 5), (4, 5), (5, 6), (6, 8), (7, 10)) AS seed (
    day_number,
    round_count
  )
),
round_seed AS (
  SELECT
    round_count_seed.day_number,
    round_number,
    'Round ' || round_number::TEXT AS title,
    CASE round_count_seed.day_number
      WHEN 1 THEN 20
      WHEN 2 THEN 25
      WHEN 3 THEN 40
      WHEN 4 THEN 60
      WHEN 5 THEN 45
      WHEN 6 THEN 30
      WHEN 7 THEN 60
      ELSE 30
    END AS target_seconds,
    CASE round_count_seed.day_number
      WHEN 1 THEN 40
      WHEN 2 THEN 35
      WHEN 3 THEN 40
      WHEN 4 THEN 30
      WHEN 5 THEN 30
      WHEN 6 THEN 30
      WHEN 7 THEN 30
      ELSE 30
    END AS rest_seconds,
    CASE WHEN round_count_seed.day_number = 4 THEN 'Easy pace' ELSE NULL END AS notes
  FROM round_count_seed
  CROSS JOIN LATERAL generate_series(1, round_count_seed.round_count) AS series(round_number)
)
INSERT INTO "WorkoutRound" (
  "id",
  "dayId",
  "roundNumber",
  "title",
  "targetSeconds",
  "restSeconds",
  "notes",
  "updatedAt"
)
SELECT
  'workout_round_starter_7_day_' || round_seed.day_number::TEXT || '_' || round_seed.round_number::TEXT,
  upsert_days."id",
  round_seed.round_number,
  round_seed.title,
  round_seed.target_seconds,
  round_seed.rest_seconds,
  round_seed.notes,
  CURRENT_TIMESTAMP
FROM round_seed
JOIN upsert_days
  ON upsert_days."dayNumber" = round_seed.day_number
ON CONFLICT ("dayId", "roundNumber") DO UPDATE
SET
  "title" = EXCLUDED."title",
  "targetSeconds" = EXCLUDED."targetSeconds",
  "restSeconds" = EXCLUDED."restSeconds",
  "notes" = EXCLUDED."notes",
  "updatedAt" = CURRENT_TIMESTAMP;

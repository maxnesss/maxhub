DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'BambooTask'
      AND column_name = 'timelineWeek'
  ) THEN
    UPDATE "BambooTask"
    SET "phase" = CASE
      WHEN "timelineWeek" <= 2 THEN 'PHASE_1_PREPARATION'::"BambooTaskPhase"
      WHEN "timelineWeek" <= 5 THEN 'PHASE_2_SETUP'::"BambooTaskPhase"
      WHEN "timelineWeek" <= 8 THEN 'PHASE_3_HOT_PRE_START'::"BambooTaskPhase"
      ELSE 'PHASE_4_START'::"BambooTaskPhase"
    END;
  ELSE
    UPDATE "BambooTask"
    SET "phase" = CASE
      WHEN "id" IN (
        'bamboo-task-01',
        'bamboo-task-02',
        'bamboo-task-03',
        'bamboo-task-04',
        'bamboo-task-05',
        'bamboo-task-06',
        'bamboo-task-07'
      ) THEN 'PHASE_1_PREPARATION'::"BambooTaskPhase"
      WHEN "id" IN (
        'bamboo-task-08',
        'bamboo-task-09',
        'bamboo-task-10',
        'bamboo-task-11',
        'bamboo-task-12',
        'bamboo-task-13',
        'bamboo-task-14',
        'bamboo-task-15'
      ) THEN 'PHASE_2_SETUP'::"BambooTaskPhase"
      WHEN "id" IN (
        'bamboo-task-16',
        'bamboo-task-17',
        'bamboo-task-18',
        'bamboo-task-19'
      ) THEN 'PHASE_3_HOT_PRE_START'::"BambooTaskPhase"
      WHEN "id" = 'bamboo-task-20' THEN 'PHASE_4_START'::"BambooTaskPhase"
      ELSE "phase"
    END;
  END IF;
END
$$;

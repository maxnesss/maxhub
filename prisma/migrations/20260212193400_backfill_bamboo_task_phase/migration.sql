UPDATE "BambooTask"
SET "phase" = CASE
  WHEN "timelineWeek" <= 2 THEN 'PHASE_1_PREPARATION'::"BambooTaskPhase"
  WHEN "timelineWeek" <= 5 THEN 'PHASE_2_SETUP'::"BambooTaskPhase"
  WHEN "timelineWeek" <= 8 THEN 'PHASE_3_HOT_PRE_START'::"BambooTaskPhase"
  ELSE 'PHASE_4_START'::"BambooTaskPhase"
END;

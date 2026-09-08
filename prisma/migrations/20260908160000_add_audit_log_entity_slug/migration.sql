ALTER TABLE "AuditLog" ADD COLUMN "entitySlug" TEXT;

ALTER TABLE "AuditLog" DISABLE TRIGGER "AuditLog_prevent_mutation";

UPDATE "AuditLog"
SET "entitySlug" = "entityLabel"
WHERE "entityType" IN ('product', 'category', 'import_template');

ALTER TABLE "AuditLog" ENABLE TRIGGER "AuditLog_prevent_mutation";

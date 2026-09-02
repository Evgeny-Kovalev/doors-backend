-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" INTEGER,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityLabel" TEXT,
    "batchId" UUID,
    "metadata" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_id_idx" ON "AuditLog"("createdAt", "id");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_id_idx"
ON "AuditLog"("entityType", "entityId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_id_idx"
ON "AuditLog"("actorId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "AuditLog_batchId_createdAt_id_idx"
ON "AuditLog"("batchId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_id_idx"
ON "AuditLog"("action", "createdAt", "id");

-- CreateIndex
CREATE INDEX "AuditLog_actorEmail_createdAt_id_idx"
ON "AuditLog"("actorEmail", "createdAt", "id");

-- Audit events are append-only. Corrections must be written as new events.
CREATE FUNCTION prevent_audit_log_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'AuditLog is append-only';
END;
$$;

CREATE TRIGGER "AuditLog_prevent_mutation"
BEFORE UPDATE OR DELETE OR TRUNCATE ON "AuditLog"
FOR EACH STATEMENT
EXECUTE FUNCTION prevent_audit_log_mutation();

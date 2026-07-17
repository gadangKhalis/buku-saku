import prisma from "../lib/prisma";

type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export async function createAuditLog(
  userId: string,
  action: AuditAction,
  entity: string,
  entityId: string,
  oldValue: object | null,
  newValue: object | null,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        oldValue: oldValue ?? undefined,
        newValue: newValue ?? undefined,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

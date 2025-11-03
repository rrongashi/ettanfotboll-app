import mongoose, { Model, Schema, Document } from 'mongoose';

export interface AuditLogDocument extends Document {
  action: string;
  userId?: mongoose.Types.ObjectId;
  email?: string;
  meta?: Record<string, unknown>;
  at: Date;
}

const AuditLogSchema = new Schema<AuditLogDocument>(
  {
    action: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    email: { type: String },
    meta: { type: Schema.Types.Mixed },
    at: { type: Date, required: true, default: () => new Date(), index: true }
  },
  { timestamps: false }
);

const AuditLog: Model<AuditLogDocument> =
  mongoose.models.AuditLog || mongoose.model<AuditLogDocument>('AuditLog', AuditLogSchema);

export default AuditLog;




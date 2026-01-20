// Notification Action Logs - Para rastreabilidade de ações

export type NotificationActionType = 
  | 'dismissed' 
  | 'read' 
  | 'resolved' 
  | 'muted_type' 
  | 'unmuted_type'
  | 'marked_all_read'
  | 'deleted';

export interface NotificationActionLog {
  id: string;
  notificationId: string;
  notificationType?: string;
  action: NotificationActionType;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: Date;
  details?: string;
  // For type muting
  mutedType?: string;
}

// Mock storage for action logs
let actionLogs: NotificationActionLog[] = [];

export function logNotificationAction(
  action: NotificationActionType,
  notificationId: string,
  user: { id?: string; name?: string; role?: string },
  details?: string,
  notificationType?: string
): NotificationActionLog {
  const log: NotificationActionLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    notificationId,
    notificationType,
    action,
    userId: user.id || 'unknown',
    userName: user.name || 'Usuário',
    userRole: user.role || 'unknown',
    timestamp: new Date(),
    details,
  };
  
  actionLogs = [log, ...actionLogs];
  console.log('[NotificationLog]', log);
  
  return log;
}

export function getActionLogs(): NotificationActionLog[] {
  return actionLogs;
}

export function getLogsForNotification(notificationId: string): NotificationActionLog[] {
  return actionLogs.filter(log => log.notificationId === notificationId);
}

export function clearActionLogs(): void {
  actionLogs = [];
}

export const actionTypeLabels: Record<NotificationActionType, string> = {
  dismissed: 'Dispensada',
  read: 'Lida',
  resolved: 'Resolvida',
  muted_type: 'Tipo silenciado',
  unmuted_type: 'Tipo reativado',
  marked_all_read: 'Todas marcadas como lidas',
  deleted: 'Excluída',
};

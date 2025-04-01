import { filecoinRsRestoreFunction, backupDataLocal } from './filecoin-rs-bindings';
import { RestoreOptions, FilecoinBackupResult } from './types';

interface NotificationService {
  notify(message: string): void;
}

interface LoggingService {
  logEvent(message: string): void;
}

interface StatusService {
  updateStatus(status: string): void;
}

class BackupManager {
  constructor(
    private notificationService: NotificationService,
    private loggingService: LoggingService,
    private statusService: StatusService
  ) {}

  async restoreBackup(): Promise<boolean> {
    const options: RestoreOptions = {
      backupPath: './backup',
      destinationPath: './dest/path', // Optional, adjust as needed
      decryptionKey: process.env.ENCRYPTION_KEY // From .env
    };

    try {
      const success = await filecoinRsRestoreFunction(options);
      if (success) {
        this.loggingService.logEvent('Backup restored successfully.');
        this.notificationService.notify('Backup restored!');
        this.statusService.updateStatus('BACKUP_RESTORED');
        console.log('Restore successful.');
        return true;
      } else {
        this.loggingService.logEvent('Failed to restore backup.');
        this.notificationService.notify('Restore failed. Please check the logs for more details.');
        this.statusService.updateStatus('BACKUP_RESTORE_FAILED');
        console.error('Restore failed.');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.loggingService.logEvent(`An error occurred while attempting to restore the backup: ${errorMessage}`);
      this.notificationService.notify('Restore failed due to an unexpected error.');
      this.statusService.updateStatus('BACKUP_RESTORE_ERROR');
      console.error('Restore encountered an error:', error);
      return false;
    }
  }

  async backupPlugin(): Promise<boolean> {
    try {
      const result: FilecoinBackupResult = await backupDataLocal({ path: './backup/backup-file' });
      if (result.success) {
        console.log('Backup successful.');
        this.notificationService.notify('Backup successful.');
        this.loggingService.logEvent('Backup created successfully.');
        this.statusService.updateStatus('BACKUP_CREATED');
        return true;
      } else {
        console.error('Backup failed.');
        this.notificationService.notify('Backup failed. Please check the logs for more details.');
        this.loggingService.logEvent('Backup creation failed.');
        this.statusService.updateStatus('BACKUP_CREATION_FAILED');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Backup encountered an error:', error);
      this.notificationService.notify('Backup failed due to an unexpected error.');
      this.loggingService.logEvent(`Backup creation failed: ${errorMessage}`);
      this.statusService.updateStatus('BACKUP_CREATION_ERROR');
      return false;
    }
  }

  helloFilecoin(): string {
    return 'Filecoin Plugin Initialized';
  }
}

export default BackupManager;
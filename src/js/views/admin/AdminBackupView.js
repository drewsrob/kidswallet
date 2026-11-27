// views/admin/AdminBackupView.js – Datensicherung (Backup erstellen / wiederherstellen)

import './Admin.css';
import { isAdminUnlocked } from '../../security.js';
import { Modal } from '../../components/Modal.js';
import { Toast, queueFlashToast } from '../../components/Toast.js';
import { describeError } from '../../errors.js';
import { t, reloadLanguage } from '../../i18n.js';
import { formatDateTime, escapeHtml } from '../../utils.js';
import { parseBlocks, render } from '../../template.js';
import {
  BACKUP_VERSION, BackupError, createBackup, serializeBackup, backupFileName,
  recordBackupCreated, getBackupInfo, parseBackup, restoreBackup,
} from '../../services/BackupService.js';
import { saveTextFile, pickTextFile, FileTransferCancelled } from '../../services/fileTransfer.js';
import backupHtml from './AdminBackupView.html?raw';

const blocks = parseBlocks(backupHtml);

export default class AdminBackupView {
  constructor() {
    this._handlers = [];
    this._busy = false;
  }

  _guardAuth() {
    if (!isAdminUnlocked()) {
      location.hash = '#/admin';
      return false;
    }
    return true;
  }

  _renderStatus() {
    const info = getBackupInfo();
    return render(blocks.status, {
      lastBackup: info?.lastBackupAt ? formatDateTime(info.lastBackupAt) : t('backup.never'),
      version: info?.version ?? BACKUP_VERSION,
    });
  }

  async render() {
    if (!this._guardAuth()) return '<div></div>';
    return render(blocks.main, { status: this._renderStatus() });
  }

  mount() {
    this._on('btn-backup-export', () => this._export());
    this._on('btn-backup-import', () => this._import());
  }

  _on(id, fn) {
    const el = document.getElementById(id);
    if (!el) return;
    const h = async () => {
      if (this._busy) return;
      this._busy = true;
      el.disabled = true;
      try { await fn(); } finally { this._busy = false; el.disabled = false; }
    };
    el.addEventListener('click', h);
    this._handlers.push({ el, type: 'click', fn: h });
  }

  async _export() {
    try {
      const backup = createBackup();
      await saveTextFile(backupFileName(new Date(backup.createdAt)), serializeBackup(backup), { title: t('backup.shareTitle') });
      recordBackupCreated(backup);
      const statusEl = document.getElementById('backup-status');
      if (statusEl) statusEl.innerHTML = this._renderStatus();
      Toast.success(t('backup.exported'));
    } catch (e) {
      if (e instanceof FileTransferCancelled) return;
      console.error(e);
      Toast.error(describeError(e, t('backup.exportFailed')), {
        action: { label: t('common.retry'), onClick: () => document.getElementById('btn-backup-export')?.click() },
      });
    }
  }

  async _import() {
    let file;
    try {
      file = await pickTextFile({ accept: '.json,application/json,text/plain,application/octet-stream' });
    } catch (e) {
      console.error(e);
      Toast.error(t('backup.readFailed'));
      return;
    }
    if (!file) return;

    let backup;
    try {
      backup = parseBackup(file.text);
    } catch (e) {
      console.warn('Backup abgelehnt:', e);
      Toast.error(t(`backup.errors.${e instanceof BackupError ? e.code : 'invalid'}`));
      return;
    }

    const { children, transactions } = backup.data;
    const choice = await new Modal({
      title: t('backup.confirmTitle'),
      icon: 'alert-triangle',
      describeContent: true,
      content: /* html */`
        <p><strong>${t('backup.confirmWarning')}</strong></p>
        <p class="text-sm text-muted">${escapeHtml(t('backup.confirmSummary', {
          date: formatDateTime(backup.createdAt),
          children: t('backup.childrenCount', { count: children.length }),
          transactions: t('backup.transactionsCount', { count: transactions.length }),
        }))}</p>
        <p class="text-sm">${t('backup.confirmPinNote')}</p>
      `,
      actions: [
        { label: t('common.cancel'), value: 'cancel', variant: 'secondary' },
        { label: t('backup.confirmAction'), value: 'confirm', variant: 'danger' },
      ],
    }).open();
    if (choice !== 'confirm') return;

    try {
      restoreBackup(backup);
    } catch (e) {
      console.error(e);
      Toast.error(e instanceof BackupError ? t(`backup.errors.${e.code}`) : describeError(e, t('backup.restoreFailed')));
      return;
    }
    // Sprache aus dem Backup übernehmen, damit auch die Erfolgsmeldung schon in dieser Sprache erscheint
    try { await reloadLanguage(); } catch (e) { console.error(e); }
    // Neu starten, damit Zustand, PIN, Design, Sprache und fällige Taschengeld-Zahlungen frisch geladen werden
    queueFlashToast(t('backup.restored'));
    history.replaceState(null, '', '#/');
    location.reload();
  }

  unmount() {
    this._handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    this._handlers = [];
  }
}

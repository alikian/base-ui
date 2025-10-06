import { Handle, Position } from '@xyflow/react';
import { useEffect, useState, useCallback } from 'react';
import styles from '../node-shared.module.css';

type HistoryItem = { id: string; status: 'ok' | 'err' };
type CallHistoryData = {
  history?: HistoryItem[];
  onRenameId?: (nextId: string) => void;
};

type NodeComponentProps = { id: string; data?: CallHistoryData };

export function CallHistoryNode({ id, data }: NodeComponentProps) {
  const [editId, setEditId] = useState<string>(id);
  useEffect(() => setEditId(id), [id]);

  const commitRename = useCallback(() => {
    if (editId !== id) {
      data?.onRenameId?.(editId);
    }
  }, [data, editId, id]);

  const onIdKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitRename();
        (e.currentTarget as HTMLInputElement).blur();
      }
    },
    [commitRename]
  );

  const history = data?.history ?? [];

  return (
    <div className={styles.messageNode}>
      <Handle type="target" position={Position.Left} />

      <div className={styles.nodeHeader}>
        <span className={styles.nodeTitle}>Call History</span>
      </div>

      <div className={styles.nodeSubBar}>
        <span className={styles.idBadge}>ID:</span>
        <input
          className={styles.idInput}
          value={editId}
          onChange={(e) => setEditId(e.target.value)}
          onBlur={commitRename}
          onKeyDown={onIdKeyDown}
        />
      </div>

      <div className={styles.nodeColumn}>
        {(history?.length ?? 0) > 0 && (
          <ul className={styles.historyList}>
            {history.map((h: HistoryItem) => (
              <li key={h.id} className={styles.historyItem}>
                <div className={styles.historyMeta}>
                  <span>Call {h.id}</span>
                </div>
                <span className={`${styles.statusDot} ${h.status === 'ok' ? styles.statusOk : styles.statusErr}`} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}

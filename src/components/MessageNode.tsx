import { useCallback, useEffect, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import styles from '../node-shared.module.css';

type MessageData = {
  text?: string;
  onChange?: (field: string, value: unknown) => void;
  onRenameId?: (nextId: string) => void;
};

type NodeComponentProps = { id: string; data?: MessageData };

export function MessageNode({ id, data }: NodeComponentProps) {
  const [editId, setEditId] = useState<string>(id);

  useEffect(() => setEditId(id), [id]);

  const onChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      data?.onChange?.(evt.target.name, evt.target.value);
    },
    [data]
  );

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

  return (
    <div className={styles.messageNode}>
      {/* Allow incoming connections */}
      <Handle type="target" position={Position.Left} />

      <div className={styles.nodeHeader}>
        <span className={styles.nodeTitle}>Message</span>
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
        <div className={styles.field}>
          <label htmlFor={`text-${id}`}>Message</label>
          <input id={`text-${id}`} name="text" onChange={onChange} className="nodrag" value={data?.text ?? ''} />
        </div>
      </div>

      {/* Allow outgoing connections */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

import { Handle, Position } from '@xyflow/react';
import { useCallback, useEffect, useState } from 'react';
import styles from '../node-shared.module.css';

type InputData = {
  inputType?: 'text' | 'voice';
  onChange?: (field: string, value: unknown) => void;
  onRenameId?: (nextId: string) => void;
};

type NodeComponentProps = { id: string; data?: InputData };

export function InputNode({ id, data }: NodeComponentProps) {
  const [editId, setEditId] = useState<string>(id);
  useEffect(() => setEditId(id), [id]);

  const onChange = useCallback(
    (evt: React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = evt.target;
      data?.onChange?.(name, value);
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

  const value = data?.inputType ?? 'text';

  return (
    <div className={styles.messageNode}>
      <Handle type="target" position={Position.Left} />

      <div className={styles.nodeHeader}>
        <span className={styles.nodeTitle}>Input</span>
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
          <label htmlFor={`inputType-${id}`}>Type</label>
          <select id={`inputType-${id}`} name="inputType" className="nodrag" value={value} onChange={onChange}>
            <option value="text">Text</option>
            <option value="voice">Voice</option>
          </select>
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}

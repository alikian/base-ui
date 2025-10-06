import { useCallback, useEffect, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import styles from '../node-shared.module.css';

type KBOption = { value: string; label: string };
type KBData = {
  query?: string;
  kb?: string;
  kbOptions?: KBOption[];
  onChange?: (field: string, value: unknown) => void;
  onRenameId?: (nextId: string) => void;
};

type NodeComponentProps = { id: string; data?: KBData };

export function KnowlegeBaseReader({ id, data }: NodeComponentProps) {
  const [editId, setEditId] = useState<string>(id);
  useEffect(() => setEditId(id), [id]);

  const onChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const kbOptions: KBOption[] = data?.kbOptions ?? [
    { value: 'docs', label: 'Docs' },
    { value: 'wiki', label: 'Wiki' },
    { value: 'tickets', label: 'Tickets' },
  ];
  const defaultKb = data?.kb ?? kbOptions[0].value;

  return (
    <div className={styles.messageNode}>
      <Handle type="target" position={Position.Left} />

      <div className={styles.nodeHeader}>
        <span className={styles.nodeTitle}>Knowledge Base Reader</span>
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
          <label htmlFor={`kbQuery-${id}`}>Search Query</label>
          <input id={`kbQuery-${id}`} name="query" className="nodrag" onChange={onChange} value={data?.query ?? ''} />
        </div>
        <div className={styles.field}>
          <label htmlFor={`kbSelect-${id}`}>Knowledge Base</label>
          <select id={`kbSelect-${id}`} name="kb" className="nodrag" value={data?.kb ?? defaultKb} onChange={onChange}>
            {kbOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}

import { useCallback, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import styles from '../node-shared.module.css';

type ModelOption = { value: string; label: string };
type OpenAIData = {
  system?: string;
  prompt?: string;
  model?: string;
  modelOptions?: ModelOption[];
  logoUrl?: string;
  onChange?: (field: string, value: unknown) => void;
  onRenameId?: (nextId: string) => void;
};

type NodeComponentProps = { id: string; data?: OpenAIData };

export function OpenAINode({ id, data }: NodeComponentProps) {
  const [editId, setEditId] = useState<string>(id);

  const onFieldChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const modelOptions: ModelOption[] = data?.modelOptions ?? [
    { value: 'gpt-4o-mini', label: 'gpt-4o-mini' },
    { value: 'gpt-4o', label: 'gpt-4o' },
    { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo' },
  ];

  const defaultModel = data?.model ?? modelOptions[0].value;
  const logoUrl = data?.logoUrl;

  return (
    <div className={styles.messageNode}>
      <Handle type="target" position={Position.Left} />

      <div className={styles.nodeHeader}>
        {logoUrl ? (
          <img src={logoUrl} alt="OpenAI logo" className={styles.nodeLogo} />
        ) : (
          <span className={styles.nodeIcon}>AI</span>
        )}
        <span className={styles.nodeTitle}>OpenAI</span>
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
          <label htmlFor={`system-${id}`}>System</label>
          <textarea id={`system-${id}`} name="system" className="nodrag" rows={3} onChange={onFieldChange} value={data?.system ?? ''} />
        </div>
        <div className={styles.field}>
          <label htmlFor={`prompt-${id}`}>Prompt</label>
          <textarea id={`prompt-${id}`} name="prompt" className="nodrag" rows={4} onChange={onFieldChange} value={data?.prompt ?? ''} />
        </div>
        <div className={styles.field}>
          <label htmlFor={`model-${id}`}>Model</label>
          <select id={`model-${id}`} name="model" className="nodrag" onChange={onFieldChange} value={data?.model ?? defaultModel}>
            {modelOptions.map((opt) => (
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

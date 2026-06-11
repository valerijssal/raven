import styles from "./Steps.module.css";

const REQUEST_TYPES = ["New mapping", "Update mapping", "Remove mapping"];

export default function StepDetails({ data, onChange }) {
  return (
    <div className={styles.step}>
      <div className={styles.field}>
        <label className={styles.label}>Request type</label>
        <div className={styles.pills}>
          {REQUEST_TYPES.map(t => (
            <button
              key={t}
              type="button"
              className={`${styles.pill} ${data.requestType === t ? styles.pillOn : ""}`}
              onClick={() => onChange({ requestType: t })}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Notes <span className={styles.optional}>(optional)</span></label>
        <textarea
          rows={3}
          value={data.notes}
          onChange={e => onChange({ notes: e.target.value })}
          placeholder="Any context or special instructions…"
          style={{ resize: "vertical" }}
        />
      </div>
    </div>
  );
}

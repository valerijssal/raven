import styles from "./Steps.module.css";

export default function StepReview({ data, properties }) {
  const { requestType, notes, people, selected, excludeMode } = data;

  const selectedProps = properties.filter(p => selected.includes(p.uuid));

  return (
    <div className={styles.step}>
      <div className={styles.reviewSection}>
        <div className={styles.reviewLabel}>Request</div>
        <div className={styles.reviewValue}>{requestType}</div>
        {notes && <div className={styles.reviewNote}>{notes}</div>}
      </div>

      <div className={styles.reviewSection}>
        <div className={styles.reviewLabel}>People ({people.length})</div>
        {people.map((p, i) => (
          <div key={i} className={styles.reviewPerson}>
            <span className={styles.reviewName}>{p.employee?.display}</span>
            <span className={styles.reviewRoles}>{p.roles.join(", ")}</span>
          </div>
        ))}
      </div>

      <div className={styles.reviewSection}>
        <div className={styles.reviewLabel}>
          Properties ({selectedProps.length}) — {excludeMode ? "exclude" : "include"}
        </div>
        <div className={styles.reviewPropList}>
          {selectedProps.map(p => (
            <div key={p.uuid} className={styles.reviewProp}>{p.title}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

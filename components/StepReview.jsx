import styles from "./Steps.module.css";

export default function StepReview({ data, properties }) {
  const { requestType, notes, people } = data;
  const propMap = Object.fromEntries(properties.map(p => [p.uuid, p]));

  return (
    <div className={styles.step}>
      <div className={styles.reviewSection}>
        <div className={styles.reviewLabel}>Request</div>
        <div className={styles.reviewValue}>{requestType}</div>
        {notes && <div className={styles.reviewNote}>{notes}</div>}
      </div>

      {people.map((p, i) => {
        const selectedProps = (p.selected || []).map(uuid => propMap[uuid]).filter(Boolean);
        return (
          <div key={i} className={styles.reviewSection}>
            <div className={styles.reviewLabel}>
              {p.employee?.display}
              <span className={styles.reviewRoles}> · {p.roles.join(", ")}</span>
            </div>
            <div className={styles.reviewPropList}>
              {selectedProps.length === 0
                ? <div className={styles.reviewProp} style={{ color: "var(--text2)" }}>No properties selected</div>
                : selectedProps.map(prop => (
                    <div key={prop.uuid} className={styles.reviewProp}>{prop.title}</div>
                  ))
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}

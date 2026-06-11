import { useState, useRef, useEffect } from "react";
import styles from "./Steps.module.css";

const PRESET_ROLES = ["DM", "SMM", "BI", "Creator", "Producer", "Editor"];

function PersonRow({ person, index, total, employees, onChange, onRemove }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const suggestions = search.length > 1
    ? employees.filter(e =>
        e.display.toLowerCase().includes(search.toLowerCase()) ||
        e.division.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function selectEmployee(emp) {
    onChange({ employee: emp });
    setSearch("");
    setOpen(false);
  }

  function clearEmployee() {
    onChange({ employee: null });
    setSearch("");
  }

  function toggleRole(r) {
    const has = person.roles.includes(r);
    onChange({ roles: has ? person.roles.filter(x => x !== r) : [...person.roles, r] });
  }

  function addCustomRole(e) {
    if (e.key === "Enter" && person.customInput.trim()) {
      const r = person.customInput.trim();
      if (!person.roles.includes(r)) onChange({ roles: [...person.roles, r], customInput: "" });
      else onChange({ customInput: "" });
    }
  }

  return (
    <div className={styles.personCard}>
      {total > 1 && (
        <button type="button" className={styles.removeBtn} onClick={onRemove} aria-label="Remove">×</button>
      )}
      <div className={styles.personNum}>Person {index + 1}</div>

      {/* Employee search */}
      <div className={styles.field} ref={ref}>
        <label className={styles.label}>Employee</label>
        {person.employee ? (
          <div className={styles.empSelected}>
            <div>
              <div className={styles.empName}>{person.employee.display}</div>
              <div className={styles.empMeta}>{person.employee.title} · {person.employee.division}</div>
            </div>
            <button type="button" className={styles.clearBtn} onClick={clearEmployee}>×</button>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder="Search by name or team…"
              autoComplete="off"
            />
            {open && suggestions.length > 0 && (
              <div className={styles.dropdown}>
                {suggestions.map((emp, i) => (
                  <div key={i} className={styles.ddItem} onMouseDown={() => selectEmployee(emp)}>
                    <span className={styles.ddName}>{emp.display}</span>
                    <span className={styles.ddMeta}>{emp.division}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Roles */}
      <div className={styles.field}>
        <label className={styles.label}>CASS role(s)</label>
        <div className={styles.pills}>
          {PRESET_ROLES.map(r => (
            <button
              key={r}
              type="button"
              className={`${styles.pill} ${person.roles.includes(r) ? styles.pillOn : ""}`}
              onClick={() => toggleRole(r)}
            >
              {r}
            </button>
          ))}
          {person.roles.filter(r => !PRESET_ROLES.includes(r)).map(r => (
            <button
              key={r}
              type="button"
              className={`${styles.pill} ${styles.pillOn}`}
              onClick={() => toggleRole(r)}
            >
              {r} ×
            </button>
          ))}
        </div>
        <input
          value={person.customInput}
          onChange={e => onChange({ customInput: e.target.value })}
          onKeyDown={addCustomRole}
          placeholder="Type custom role + press Enter…"
          style={{ marginTop: 8 }}
        />
      </div>
    </div>
  );
}

export default function StepPeople({ data, employees, onChange }) {
  function updatePerson(i, patch) {
    const updated = data.people.map((p, idx) => idx === i ? { ...p, ...patch } : p);
    onChange({ people: updated });
  }

  function addPerson() {
    onChange({ people: [...data.people, { employee: null, roles: [], customInput: "" }] });
  }

  function removePerson(i) {
    onChange({ people: data.people.filter((_, idx) => idx !== i) });
  }

  return (
    <div className={styles.step}>
      {data.people.map((p, i) => (
        <PersonRow
          key={i}
          person={p}
          index={i}
          total={data.people.length}
          employees={employees}
          onChange={patch => updatePerson(i, patch)}
          onRemove={() => removePerson(i)}
        />
      ))}
      <button type="button" className={styles.addBtn} onClick={addPerson}>
        + Add another person
      </button>
    </div>
  );
}

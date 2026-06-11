import { useMemo, useState } from "react";
import styles from "./Steps.module.css";

const uniq = arr => [...new Set(arr.filter(Boolean))].sort();

export default function StepProperties({ data, properties, onChange }) {
  const { bgFilter, bfFilter, platFilter, langFilter, selected, excludeMode } = data;
  const [search, setSearch] = useState("");

  const brandGroups = useMemo(() => uniq(properties.map(p => p.brandGroup)), [properties]);
  const brandFamilies = useMemo(() => {
    const base = bgFilter ? properties.filter(p => p.brandGroup === bgFilter) : properties;
    return uniq(base.map(p => p.brandFamily));
  }, [properties, bgFilter]);
  const platforms = useMemo(() => {
    let b = properties;
    if (bgFilter) b = b.filter(p => p.brandGroup === bgFilter);
    if (bfFilter) b = b.filter(p => p.brandFamily === bfFilter);
    return uniq(b.map(p => p.platform));
  }, [properties, bgFilter, bfFilter]);
  const languages = useMemo(() => {
    let b = properties;
    if (bgFilter) b = b.filter(p => p.brandGroup === bgFilter);
    if (bfFilter) b = b.filter(p => p.brandFamily === bfFilter);
    if (platFilter) b = b.filter(p => p.platform === platFilter);
    return uniq(b.map(p => p.language));
  }, [properties, bgFilter, bfFilter, platFilter]);

  const filtered = useMemo(() => {
    let b = properties;
    if (bgFilter) b = b.filter(p => p.brandGroup === bgFilter);
    if (bfFilter) b = b.filter(p => p.brandFamily === bfFilter);
    if (platFilter) b = b.filter(p => p.platform === platFilter);
    if (langFilter) b = b.filter(p => p.language === langFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      b = b.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.brandFamily.toLowerCase().includes(q) ||
        p.brandGroup.toLowerCase().includes(q)
      );
    }
    return b;
  }, [properties, bgFilter, bfFilter, platFilter, langFilter, search]);

  function toggleProp(uuid) {
    const has = selected.includes(uuid);
    onChange({ selected: has ? selected.filter(x => x !== uuid) : [...selected, uuid] });
  }

  function selectAll() { onChange({ selected: filtered.map(p => p.uuid) }); }
  function clearAll() { onChange({ selected: [] }); }

  function setFilter(key, val) {
    const patch = { [key]: val };
    if (key === "bgFilter") { patch.bfFilter = ""; patch.platFilter = ""; patch.langFilter = ""; }
    if (key === "bfFilter") { patch.platFilter = ""; patch.langFilter = ""; }
    if (key === "platFilter") { patch.langFilter = ""; }
    onChange(patch);
  }

  return (
    <div className={styles.step}>
      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Brand group</label>
          <select value={bgFilter} onChange={e => setFilter("bgFilter", e.target.value)}>
            <option value="">All</option>
            {brandGroups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Brand family</label>
          <select value={bfFilter} onChange={e => setFilter("bfFilter", e.target.value)}>
            <option value="">All</option>
            {brandFamilies.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Platform</label>
          <select value={platFilter} onChange={e => setFilter("platFilter", e.target.value)}>
            <option value="">All</option>
            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Language</label>
          <select value={langFilter} onChange={e => setFilter("langFilter", e.target.value)}>
            <option value="">All</option>
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search properties…"
        className={styles.propSearch}
      />

      {/* Controls row */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 12, color: "var(--text2)" }}>{filtered.length} properties · {selected.length} selected</span>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", width: "fit-content" }}>
          <input type="checkbox" checked={excludeMode} onChange={e => onChange({ excludeMode: e.target.checked })} />
          Exclude mode
        </label>
      </div>

      {/* Property list */}
      <div className={styles.propList}>
        {filtered.length === 0 && (
          <div className={styles.empty}>No properties match.</div>
        )}
        {filtered.map(p => {
          const on = selected.includes(p.uuid);
          return (
            <label key={p.uuid} className={`${styles.propRow} ${on ? styles.propRowOn : ""}`}>
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggleProp(p.uuid)}
                className={styles.hiddenCheck}
              />
              <div className={`${styles.checkBox} ${on ? styles.checkBoxOn : ""}`}>
                {on && <span className={styles.checkMark}>✓</span>}
              </div>
              <span className={styles.propTitle}>{p.title}</span>
              <span className={styles.propMeta}>{p.brandGroup}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

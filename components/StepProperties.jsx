import { useMemo, useState } from "react";
import styles from "./Steps.module.css";

const uniq = arr => [...new Set(arr.filter(Boolean))].sort();

function PropertySelector({ personData, properties, onChange }) {
  const { bgFilter = "", bfFilter = "", platFilter = "", langFilter = "", selected = [], selectionMode = "individual" } = personData;
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
    if (selectionMode === "individual" && search.trim()) {
      const q = search.trim().toLowerCase();
      b = b.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.brandFamily.toLowerCase().includes(q) ||
        p.brandGroup.toLowerCase().includes(q)
      );
    }
    return b;
  }, [properties, bgFilter, bfFilter, platFilter, langFilter, search, selectionMode]);

  function toggleProp(uuid) {
    const has = selected.includes(uuid);
    onChange({ selected: has ? selected.filter(x => x !== uuid) : [...selected, uuid] });
  }

  function setFilter(key, val) {
    const patch = { [key]: val };
    if (key === "bgFilter") { patch.bfFilter = ""; patch.platFilter = ""; patch.langFilter = ""; }
    if (key === "bfFilter") { patch.platFilter = ""; patch.langFilter = ""; }
    if (key === "platFilter") { patch.langFilter = ""; }
    onChange(patch);
  }

  function switchMode(mode) {
    if (mode === "filter") {
      // Auto-select all currently filtered properties
      onChange({ selectionMode: mode, selected: filtered.map(p => p.uuid) });
    } else {
      onChange({ selectionMode: mode, selected: [] });
    }
  }

  // In filter mode, keep selected in sync with filtered whenever filters change
  function setFilterAndSync(key, val) {
    const patch = { [key]: val };
    if (key === "bgFilter") { patch.bfFilter = ""; patch.platFilter = ""; patch.langFilter = ""; }
    if (key === "bfFilter") { patch.platFilter = ""; patch.langFilter = ""; }
    if (key === "platFilter") { patch.langFilter = ""; }
    if (selectionMode === "filter") {
      // Recompute filtered with new patch
      let b = properties;
      const bg = patch.bgFilter !== undefined ? patch.bgFilter : bgFilter;
      const bf = patch.bfFilter !== undefined ? patch.bfFilter : bfFilter;
      const pl = patch.platFilter !== undefined ? patch.platFilter : platFilter;
      const la = patch.langFilter !== undefined ? patch.langFilter : langFilter;
      if (bg) b = b.filter(p => p.brandGroup === bg);
      if (bf) b = b.filter(p => p.brandFamily === bf);
      if (pl) b = b.filter(p => p.platform === pl);
      if (la) b = b.filter(p => p.language === la);
      patch.selected = b.map(p => p.uuid);
    }
    onChange(patch);
  }

  const isFilterMode = selectionMode === "filter";

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button
          type="button"
          onClick={() => switchMode("individual")}
          style={{
            padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            border: "1px solid var(--border2)",
            background: !isFilterMode ? "var(--text)" : "transparent",
            color: !isFilterMode ? "var(--bg)" : "var(--text2)",
          }}
        >Select individually</button>
        <button
          type="button"
          onClick={() => switchMode("filter")}
          style={{
            padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            border: "1px solid var(--border2)",
            background: isFilterMode ? "var(--text)" : "transparent",
            color: isFilterMode ? "var(--bg)" : "var(--text2)",
          }}
        >Select by filter</button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Brand group</label>
          <select value={bgFilter} onChange={e => isFilterMode ? setFilterAndSync("bgFilter", e.target.value) : setFilter("bgFilter", e.target.value)}>
            <option value="">All</option>
            {brandGroups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Brand family</label>
          <select value={bfFilter} onChange={e => isFilterMode ? setFilterAndSync("bfFilter", e.target.value) : setFilter("bfFilter", e.target.value)}>
            <option value="">All</option>
            {brandFamilies.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Platform</label>
          <select value={platFilter} onChange={e => isFilterMode ? setFilterAndSync("platFilter", e.target.value) : setFilter("platFilter", e.target.value)}>
            <option value="">All</option>
            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Language</label>
          <select value={langFilter} onChange={e => isFilterMode ? setFilterAndSync("langFilter", e.target.value) : setFilter("langFilter", e.target.value)}>
            <option value="">All</option>
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {isFilterMode ? (
        /* Filter mode — show summary */
        <div style={{ padding: "12px 16px", background: "var(--bg2)", borderRadius: "var(--radius)", fontSize: 13 }}>
          {selected.length === 0
            ? <span style={{ color: "var(--text2)" }}>Set filters above to select properties automatically.</span>
            : <span><strong>{selected.length}</strong> properties selected based on current filters.</span>
          }
        </div>
      ) : (
        /* Individual mode — show list */
        <>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search properties…"
            className={styles.propSearch}
          />
          <span style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 8 }}>
            {filtered.length} properties · {selected.length} selected
          </span>
          <div className={styles.propList}>
            {filtered.length === 0 && <div className={styles.empty}>No properties match.</div>}
            {filtered.map(p => {
              const on = selected.includes(p.uuid);
              return (
                <label key={p.uuid} className={`${styles.propRow} ${on ? styles.propRowOn : ""}`}>
                  <input type="checkbox" checked={on} onChange={() => toggleProp(p.uuid)} className={styles.hiddenCheck} />
                  <div className={`${styles.checkBox} ${on ? styles.checkBoxOn : ""}`}>
                    {on && <span className={styles.checkMark}>✓</span>}
                  </div>
                  <span className={styles.propTitle}>{p.title}</span>
                  <span className={styles.propMeta}>{p.brandGroup}</span>
                </label>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function StepProperties({ data, properties, onChange }) {
  const [activeTab, setActiveTab] = useState(0);
  const people = data.people || [];

  function updatePersonProps(i, patch) {
    const updated = people.map((p, idx) => idx === i ? { ...p, ...patch } : p);
    onChange({ people: updated });
  }

  return (
    <div className={styles.step}>
      {people.length > 1 && (
        <div className={styles.personTabs}>
          {people.map((p, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.personTab} ${i === activeTab ? styles.personTabOn : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {p.employee?.display?.split(" ")[0] || `Person ${i + 1}`}
              {(p.selected || []).length > 0 && (
                <span className={styles.personTabBadge}>{p.selected.length}</span>
              )}
            </button>
          ))}
        </div>
      )}
      <PropertySelector
        key={activeTab}
        personData={people[activeTab] || {}}
        properties={properties}
        onChange={patch => updatePersonProps(activeTab, patch)}
      />
    </div>
  );
}

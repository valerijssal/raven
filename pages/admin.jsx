import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import RavenIcon from "../components/RavenIcon";
import styles from "../styles/Admin.module.css";

const STATUSES = ["pending", "in_progress", "done"];
const STATUS_LABELS = { pending: "Pending", in_progress: "In progress", done: "Done" };

export default function Admin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (status === "authenticated" && session.user.role !== "admin") router.push("/");
  }, [status, session]);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin") return;
    fetch("/api/admin/requests")
      .then(r => r.json())
      .then(data => { setRequests(data); setLoading(false); });
  }, [status, session]);

  async function updateRequest(id, patch) {
    const res = await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    const updated = await res.json();
    setRequests(prev => prev.map(r => r.id === id ? updated : r));
  }

  if (loading) return <div className={styles.loader}><div className={styles.spinner} /></div>;

  return (
    <>
      <Head><title>Raven — Admin</title></Head>
      <div className={styles.page}>
        <div className={styles.topbar}>
          <div className={styles.brand}>
            <RavenIcon size={16} />
            <span>Raven</span>
            <span className={styles.adminBadge}>Admin</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className={styles.textBtn} onClick={() => router.push("/")}>New request</button>
            <button className={styles.textBtn} onClick={() => signOut({ callbackUrl: "/auth/signin" })}>Sign out</button>
          </div>
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>All requests</h2>
          {requests.length === 0 && (
            <div className={styles.empty}>No requests yet.</div>
          )}
          <div className={styles.list}>
            {requests.map(r => (
              <div key={r.id} className={styles.row}>
                <div className={styles.rowMain} onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                  <div className={styles.rowLeft}>
                    <span className={styles.reqType}>{r.request_type}</span>
                    <span className={styles.reqBy}>{r.submitted_by}</span>
                    <span className={styles.reqDate}>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.rowRight}>
                    <select
                      value={r.status}
                      onChange={e => { e.stopPropagation(); updateRequest(r.id, { status: e.target.value }); }}
                      className={`${styles.statusSelect} ${styles[r.status]}`}
                      onClick={e => e.stopPropagation()}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                    <span className={styles.chevron}>{expanded === r.id ? "▲" : "▼"}</span>
                  </div>
                </div>

                {expanded === r.id && (
                  <div className={styles.rowDetail}>
                    {r.notes && <p className={styles.notes}>{r.notes}</p>}
                    <div className={styles.detailGrid}>
                      <div>
                        <div className={styles.detailLabel}>People</div>
                        {(r.people || []).map((p, i) => (
                          <div key={i} className={styles.detailItem}>
                            <span>{p.name}</span>
                            <span className={styles.roles}>{p.roles.join(", ")}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className={styles.detailLabel}>
                          Properties ({(r.property_uuids || []).length}) — {r.exclude_mode ? "exclude" : "include"}
                        </div>
                        <div className={styles.uuidList}>
                          {(r.property_uuids || []).map(u => (
                            <span key={u} className={styles.uuid}>{u}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={styles.assignRow}>
                      <label className={styles.detailLabel}>Assigned to</label>
                      <input
                        defaultValue={r.assigned_to || ""}
                        onBlur={e => updateRequest(r.id, { assigned_to: e.target.value })}
                        placeholder="email@id.thesoul.io"
                        style={{ maxWidth: 280 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

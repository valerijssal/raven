import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import RavenIcon from "../components/RavenIcon";
import StepDetails from "../components/StepDetails";
import StepPeople from "../components/StepPeople";
import StepProperties from "../components/StepProperties";
import StepReview from "../components/StepReview";
import styles from "../styles/Home.module.css";

const STEPS = ["Details", "People", "Properties", "Review"];

function initPerson() {
  return { employee: null, roles: [], customInput: "", selected: [], bgFilter: "", bfFilter: "", platFilter: "", langFilter: "" };
}

function initState() {
  return {
    requestType: "",
    notes: "",
    people: [initPerson()],
  };
}

function canAdvance(step, state) {
  if (step === 0) return state.requestType !== "";
  if (step === 1) return state.people.every(p => p.employee !== null && p.roles.length > 0);
  if (step === 2) return state.people.every(p => (p.selected || []).length > 0);
  return true;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initState());
  const [employees, setEmployees] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetch("/api/employees").then(r => r.json()),
      fetch("/api/properties").then(r => r.json()),
    ]).then(([emps, props]) => {
      setEmployees(emps);
      setProperties(props);
      setLoading(false);
    }).catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, [status]);

  function update(patch) { setForm(prev => ({ ...prev, ...patch })); }
  function next() { if (canAdvance(step, form)) setStep(s => s + 1); }
  function back() { setStep(s => s - 1); }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: form.requestType,
          notes: form.notes,
          people: form.people
            .filter(p => p.employee)
            .map(p => ({
              name: p.employee.display,
              roles: p.roles,
              selectedUuids: p.selected || [],
            })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submit failed");
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  }

  function reset() { setForm(initState()); setStep(0); setSubmitted(false); setError(null); }

  // When moving from People to Properties, ensure new people have initPerson props
  function next2() {
    if (!canAdvance(step, form)) return;
    if (step === 1) {
      setForm(prev => ({
        ...prev,
        people: prev.people.map(p => ({
          ...initPerson(),
          ...p,
        })),
      }));
    }
    setStep(s => s + 1);
  }

  if (status === "loading" || loading) return (
    <div className={styles.loader}><div className={styles.spinner} /></div>
  );

  if (submitted) return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.success}>
          <div className={styles.successIcon}>✓</div>
          <div>
            <div className={styles.successTitle}>Request submitted</div>
            <div className={styles.successSub}>The team will pick it up shortly.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className={styles.btnPrimary} onClick={reset}>New request</button>
          {session?.user?.role === "admin" && (
            <button className={styles.btnSecondary} onClick={() => router.push("/admin")}>
              View all requests
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const ok = canAdvance(step, form);

  return (
    <>
      <Head><title>Raven</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.brand}>
              <RavenIcon size={32} />
              <h1 className={styles.heading}>Raven</h1>
            </div>
            <div className={styles.headerRight}>
              {session?.user?.role === "admin" && (
                <button className={styles.textBtn} onClick={() => router.push("/admin")}>Admin</button>
              )}
              <button className={styles.textBtn} onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
                Sign out
              </button>
            </div>
          </div>

          <div className={styles.tabs}>
            {STEPS.map((s, i) => (
              <button key={s}
                className={`${styles.tab} ${i === step ? styles.tabOn : ""}`}
                onClick={() => { if (i <= step || (i === step + 1 && ok)) setStep(i); }}
              >{s}</button>
            ))}
          </div>

          {error && <div className={styles.errorBanner}>{error}</div>}

          <div className={styles.body}>
            {step === 0 && <StepDetails data={form} onChange={update} />}
            {step === 1 && <StepPeople data={form} employees={employees} onChange={update} initPerson={initPerson} />}
            {step === 2 && <StepProperties data={form} properties={properties} onChange={update} />}
            {step === 3 && <StepReview data={form} properties={properties} />}
          </div>

          <div className={styles.nav}>
            <button className={styles.btnSecondary} onClick={back} disabled={step === 0}>Back</button>
            {step < 3
              ? <button className={styles.btnPrimary} onClick={step === 1 ? next2 : next} disabled={!ok}>Continue</button>
              : <button className={styles.btnPrimary} onClick={submit} disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit request"}
                </button>
            }
          </div>
        </div>
      </div>
    </>
  );
}

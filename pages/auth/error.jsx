import Head from "next/head";
import { useRouter } from "next/router";
import RavenIcon from "../../components/RavenIcon";

export default function AuthError() {
  const { query } = useRouter();
  const isAccessDenied = query.error === "AccessDenied";

  return (
    <>
      <Head><title>Raven — Access denied</title></Head>
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f7f5",
      }}>
        <div style={{
          background: "#fff",
          border: "1px solid #e2e2dc",
          borderRadius: 16,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 360,
          textAlign: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24 }}>
            <RavenIcon size={20} />
            <span style={{ fontSize: 18, fontWeight: 500 }}>Raven</span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
            {isAccessDenied ? "Access denied" : "Something went wrong"}
          </p>
          <p style={{ fontSize: 13, color: "#6b6b65" }}>
            {isAccessDenied
              ? "Only @id.thesoul.io accounts can access Raven."
              : "An error occurred during sign in. Please try again."}
          </p>
          <a href="/auth/signin" style={{
            display: "inline-block",
            marginTop: 20,
            fontSize: 13,
            color: "#111",
            textDecoration: "underline",
          }}>
            Back to sign in
          </a>
        </div>
      </div>
    </>
  );
}

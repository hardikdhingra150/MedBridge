import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

import {
  roleHome,
  useAuth,
} from "../../context/auth";

import "./Login.css";

const demoPassword =
  import.meta.env.VITE_DEMO_ACCOUNT_PASSWORD || "";

const demoAccounts = [
  {
    role: "DOCTOR",
    email: "doctor@medbridge.demo",
  },
  {
    role: "EXPERT",
    email: "expert@medbridge.demo",
  },
  {
    role: "ADMIN",
    email: "admin@medbridge.demo",
  },
];

function Login() {
  const navigate = useNavigate();
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (mode === "register" && password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      const authenticatedUser = mode === "register"
        ? await register(name, email, password)
        : await login(email, password);
      navigate(roleHome(authenticatedUser.role), {
        replace: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function selectDemoAccount(account) {
    setMode("login");
    setEmail(account.email);
    setPassword(demoPassword);
    setError("");
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <main className="login-page">
      <button
        className="login-back"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={16} />
        Back to site
      </button>

      <section className="login-panel">
        <div className="login-brand-mark">
          <span>M</span>
        </div>
        <span className="login-kicker">
          IDENTITY &amp; ACCESS
        </span>
        <h1>
          {mode === "login" ? "Enter the" : "Create your"}
          <em>clinical gateway</em>
        </h1>
        <p>
          {mode === "login"
            ? "Sign in with your MedBridge credentials. Your role determines which workspace and APIs you can access."
            : "Register a personal MedBridge account. New accounts receive Doctor access with protected clinical APIs."}
        </p>

        <div className="login-mode-switch" role="tablist" aria-label="Authentication mode">
          <button type="button" className={mode === "login" ? "mode-active" : ""} onClick={() => changeMode("login")}>Sign in</button>
          <button type="button" className={mode === "register" ? "mode-active" : ""} onClick={() => changeMode("register")}>Create account</button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label htmlFor="register-name">Full name</label>
              <div className="login-password-field">
                <UserRound size={16} />
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  placeholder="Your full name"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>
            </>
          )}

          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            placeholder="name@example.com"
            required
          />

          <label htmlFor="login-password">Password</label>
          <div className="login-password-field">
            <KeyRound size={16} />
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              placeholder="Enter your password"
              minLength={mode === "register" ? 8 : undefined}
              maxLength={72}
              required
            />
          </div>

          {mode === "register" && (
            <>
              <label htmlFor="confirm-password">Confirm password</label>
              <div className="login-password-field">
                <KeyRound size={16} />
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  minLength={8}
                  maxLength={72}
                  required
                />
              </div>
              <small className="registration-note">
                Use 8–72 characters with at least one letter and number. Expert and Admin access require administrator provisioning.
              </small>
            </>
          )}

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button
            className="login-submit"
            type="submit"
            disabled={submitting}
          >
            <ShieldCheck size={17} />
            {submitting
              ? mode === "register" ? "Creating account…" : "Verifying…"
              : mode === "register" ? "Create secure account" : "Secure sign in"}
            {!submitting && <ArrowRight size={17} />}
          </button>
        </form>

        {mode === "login" && <div className="demo-accounts">
          <span>DEMO ACCOUNTS</span>
          <div>
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => selectDemoAccount(account)}
              >
                {account.role}
              </button>
            ))}
          </div>
          {!demoPassword && (
            <small className="demo-password-note">
              Enter the demo password configured by the administrator.
            </small>
          )}
        </div>}
      </section>

      <aside className="login-assurance">
        <ShieldCheck size={19} />
        <span>JWT AUTHENTICATED</span>
        <small>Role enforcement active in React and FastAPI</small>
      </aside>
    </main>
  );
}

export default Login;

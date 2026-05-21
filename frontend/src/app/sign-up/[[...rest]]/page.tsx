"use client";

import { useState, useEffect } from "react";
import { useSignUp, useUser } from "@clerk/nextjs";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import "./sign-up.css";

export default function CustomSignUpPage() {
  const { signUp } = useSignUp();
  const { isSignedIn } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");

  const [step, setStep] = useState<"signup" | "verify">("signup");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) return;

    try {
      setLoading(true);

      const { error } = await signUp.password({
        emailAddress: email,
        password,
      });

      if (error) {
        setError(error.message || "Error creando cuenta");
        return;
      }

      await signUp.verifications.sendEmailCode();

      setStep("verify");
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Error creando cuenta");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const { error } = await signUp.verifications.verifyEmailCode({
        code,
      });

      if (error) {
        setError(error.message || "Código inválido");
        return;
      }

      await signUp.finalize();

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Error verificando código");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      window.location.href = "/dashboard";
    }
  }, [isSignedIn]);

  return (
    <div className="signup-page">
      <main className="signup-main">
        <div className="signup-card">
          <div className="signup-header">
            <div className="logo-container">
              <div className="logo-box">
                <GraduationCap size={28} strokeWidth={2} />
              </div>
              <span className="logo-text">ORBIS</span>
            </div>

            <h1>{step === "signup" ? "Crear Cuenta" : "Verificar Email"}</h1>
          </div>

          {step === "signup" && (
            <form className="signup-form" onSubmit={handleSignUp}>
              <div className="input-group">
                <label>Correo electrónico</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Contraseña</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {error && <p className="error-message">{error}</p>}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Creando..." : "Crear cuenta"}
                <ArrowRight size={18} />
              </button>

              <div className="signup-link">
                <span>¿Ya tienes cuenta?</span>
                <Link href="/sign-in">Iniciar sesión</Link>
              </div>
            </form>
          )}

          {step === "verify" && (
            <form className="signin-form" onSubmit={handleVerify}>
              <div className="input-group">
                <label>Código de verificación</label>

                <p className="verify-hint">
                  Te enviamos un código a tu correo
                </p>

                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />

                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={error ? "input-error" : ""}
                  />
                </div>

                {error && (
                  <p className="field-error">
                    {error}
                  </p>
                )}
              </div>

              <div className="verify-actions">
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Verificando..." : "Verificar"}
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
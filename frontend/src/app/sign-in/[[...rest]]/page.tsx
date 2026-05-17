"use client";

import { useState, useEffect } from "react";
import { useSignIn, useClerk, useUser } from "@clerk/nextjs";
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import './sign-in.css'

export default function CustomSignInPage() {
  const { signIn } = useSignIn();
  const { isSignedIn, isLoaded } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    if (!email || !password) {
      setError("Debes ingresar correo y contraseña");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response: any = await signIn.create({
        identifier: email,
        password,
      });

      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err: any) {
      console.error(err);

      setError(
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        "Credenciales inválidas"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      window.location.href = "/dashboard";
    }
  }, [isSignedIn, isLoaded]);

  return (
    <div className="signin-page">
      <main className="signin-main">
        <div className="signin-card">

          <div className="signin-header">
            <div className="logo-container">
              <div className="logo-box"><GraduationCap size={28} strokeWidth={2} /></div>
              <span className="logo-text">ORBIS</span>
            </div>

            <h1>Iniciar Sesión</h1>
          </div>

          <form className="signin-form" onSubmit={handleLogin}>
            
            <div className="input-group">
              <label>Correo electrónico</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="ejemplo@gmail.com"
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
                  placeholder="••••••••"
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

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Entrar"}
              {!loading && <ArrowRight size={18} />}
            </button>

            <div className="signup-link">
              <span>¿No tienes cuenta?</span>

              <Link href="/sign-up" className="signup-anchor">
                Crear cuenta
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
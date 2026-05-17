"use client";

import { useState, useEffect } from "react";
import { useSignUp, useUser } from "@clerk/nextjs";
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import "../../sign-in/[[...rest]]/sign-in.css";

export default function CustomSignUpPage() {
  const { signUp } = useSignUp();
  const { isSignedIn, isLoaded } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) return;

    if (password.length < 8) {
    setError("La contraseña debe tener al menos 8 caracteres");
    return;
  }

    try {
      const response: any = await signUp.create({
        emailAddress: email,
        password,
      });

      console.log("SIGN UP:", response);

      if (response.status === "complete") {
        window.location.href = "/dashboard";
        return;
      }

      if (response.status === "missing_requirements") {
        window.location.href = "/sign-in";
        return;
      }


    } catch (err: any) {
      setError(
        err.errors?.[0]?.message || "Error creando cuenta"
      );
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

            <h1>Crear Cuenta</h1>
          </div>

          <form className="signin-form" onSubmit={handleSignUp}>

            {/* EMAIL */}
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

            {/* PASSWORD */}
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

                 <div id="clerk-captcha" />
                 {error && <p className="error-message">{error}</p>}

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <p className="error-message">{error}</p>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
              {!loading && <ArrowRight size={18} />}
            </button>

            {/* LINK LOGIN */}
            <div className="signup-link">
              <span>¿Ya tienes cuenta?</span>
              <Link href="/sign-in">
                Iniciar sesión
              </Link>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
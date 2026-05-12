import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import { loginRequest, googleLoginRequest } from "../../api/authApi";

import logoScoreTec from "../../assets/brand/scoretec-logo.png";

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const guardarSesion = (data) => {
    localStorage.setItem("scoretec_token", data.token);
    localStorage.setItem("scoretec_user", JSON.stringify(data.usuario));

    if (data.usuario.rol === "ADMIN") {
      navigate("/admin");
    } else if (data.usuario.rol === "ARBITRO") {
      navigate("/referee");
    } else {
      navigate("/");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    try {
      setCargando(true);
      const data = await loginRequest(form);
      guardarSesion(data);
    } catch (error) {
      setError(error.response?.data?.message || "No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setError("");

    try {
      setCargando(true);
      const data = await googleLoginRequest(credentialResponse.credential);
      guardarSesion(data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudo iniciar sesión con Google.",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F7F8] text-[#2B2D31]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5">
          <Link
            to="/"
            className="inline-flex rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3 text-sm font-semibold !text-[#8C1D2C] shadow-sm transition hover:border-[#8C1D2C] hover:bg-[#8C1D2C] hover:!text-white"
          >
            ← Volver al inicio
          </Link>
        </div>

        <section className="mx-auto w-full max-w-xl rounded-[2rem] border border-[#E6E7EA] bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-7 flex flex-col items-center text-center">
            <img
              src={logoScoreTec}
              alt="ScoreTec"
              className="h-16 w-auto object-contain sm:h-20"
            />

            <p className="mt-3 text-sm text-[#6B6F76] sm:text-base">
              Accede y enterate de los partidos
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="mb-6 flex justify-center overflow-hidden rounded-2xl">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                setError("No se pudo iniciar sesión con Google.");
              }}
            />
          </div>

          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#E6E7EA]" />

            <span className="text-xs font-semibold uppercase tracking-wide text-[#6B6F76]">
              o con correo
            </span>

            <div className="h-px flex-1 bg-[#E6E7EA]" />
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#2B2D31]">
                Correo
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E6E7EA] bg-[#F7F7F8] px-4 py-3.5 text-sm outline-none transition focus:border-[#8C1D2C] focus:bg-white"
                placeholder="admin@scoretec.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#2B2D31]">
                Contraseña
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E6E7EA] bg-[#F7F7F8] px-4 py-3.5 text-sm outline-none transition focus:border-[#8C1D2C] focus:bg-white"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-2xl bg-[#8C1D2C] px-5 py-4 text-sm font-semibold !text-white shadow-sm transition hover:bg-[#741826] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-[#6B6F76] sm:text-sm">
            Solo usuarios registrados por el administrador pueden acceder al
            panel interno.
          </p>
        </section>
      </section>
    </main>
  );
}

export default LoginPage;

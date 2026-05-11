import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import { loginRequest, googleLoginRequest } from "../../api/authApi";

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
      <section className="grid min-h-screen lg:grid-cols-[1fr_0.95fr]">
        <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <Link
                to="/"
                className="inline-flex rounded-xl border border-[#E6E7EA] bg-white px-4 py-2 text-sm font-black text-[#8C1D2C] shadow-sm transition hover:border-[#8C1D2C]"
              >
                ← Volver al inicio
              </Link>
            </div>

            <section className="rounded-[2rem] border border-[#E6E7EA] bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-7 text-center">
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Score<span className="text-[#8C1D2C]">Tec</span>
                </h1>

                <p className="mt-2 text-sm font-medium text-[#6B6F76]">
                  Acceso para administradores y árbitros
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

                <span className="text-xs font-bold uppercase tracking-wide text-[#6B6F76]">
                  o con correo
                </span>

                <div className="h-px flex-1 bg-[#E6E7EA]" />
              </div>

              <form className="space-y-5" onSubmit={handleLogin}>
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                    Correo
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3.5 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
                    placeholder="admin@scoretec.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#2B2D31]">
                    Contraseña
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#E6E7EA] bg-white px-4 py-3.5 text-sm font-medium outline-none transition focus:border-[#8C1D2C]"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full rounded-2xl bg-[#8C1D2C] px-5 py-4 text-sm font-black text-white shadow-sm transition hover:bg-[#741826] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cargando ? "Ingresando..." : "Iniciar sesión"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs leading-5 text-[#6B6F76]">
                Solo usuarios registrados por el administrador pueden acceder al
                panel interno.
              </p>
            </section>
          </div>
        </div>

        <aside className="hidden bg-[#8C1D2C] p-8 lg:flex lg:items-center">
          <div className="mx-auto w-full max-w-xl">
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 text-white shadow-sm backdrop-blur">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-white/70">
                    Panel deportivo
                  </p>

                  <h2 className="mt-2 text-3xl font-black leading-tight">
                    Control rápido para torneos del campus.
                  </h2>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#8C1D2C]">
                  Live
                </span>
              </div>

              <div className="rounded-3xl bg-white p-5 text-[#2B2D31]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-[#8C1D2C]">
                      Partido activo
                    </p>

                    <h3 className="mt-1 text-xl font-black">
                      Halcones vs Linces
                    </h3>
                  </div>

                  <span className="rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                    En curso
                  </span>
                </div>

                <div className="rounded-3xl bg-[#FAFAFA] p-5">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div className="min-w-0 text-right">
                      <p className="truncate text-sm font-black">Halcones</p>
                      <p className="mt-1 text-xs font-bold text-[#6B6F76]">
                        Local
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white px-5 py-3 shadow-sm">
                      <p className="text-4xl font-black leading-none">
                        2<span className="mx-2 text-[#CDAA43]">-</span>1
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">Linces</p>
                      <p className="mt-1 text-xs font-bold text-[#6B6F76]">
                        Visitante
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-[#FAFAFA] p-4">
                    <p className="text-xs font-bold text-[#6B6F76]">Eventos</p>
                    <p className="mt-1 text-2xl font-black">8</p>
                  </div>

                  <div className="rounded-2xl bg-[#FAFAFA] p-4">
                    <p className="text-xs font-bold text-[#6B6F76]">Equipos</p>
                    <p className="mt-1 text-2xl font-black">2</p>
                  </div>

                  <div className="rounded-2xl bg-[#FAFAFA] p-4">
                    <p className="text-xs font-bold text-[#6B6F76]">Estado</p>
                    <p className="mt-1 text-sm font-black">Activo</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-black">01</p>
                  <p className="mt-1 text-sm font-semibold text-white/75">
                    Administra partidos
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-black">02</p>
                  <p className="mt-1 text-sm font-semibold text-white/75">
                    Registra eventos
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-black">03</p>
                  <p className="mt-1 text-sm font-semibold text-white/75">
                    Consulta resultados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default LoginPage;

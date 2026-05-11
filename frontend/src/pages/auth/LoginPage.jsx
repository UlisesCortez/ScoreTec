import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
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
    setCargando(true);

    try {
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
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-6 text-[#2B2D31]">
      <section className="w-full max-w-md rounded-3xl border border-[#E6E7EA] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Score<span className="text-[#8C1D2C]">Tec</span>
          </h1>
          <p className="mt-2 text-sm text-[#6B6F76]">
            Acceso para administradores y árbitros
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              setError("No se pudo iniciar sesión con Google.");
            }}
          />
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E6E7EA]" />
          <span className="text-xs font-medium text-[#6B6F76]">
            o ingresa con correo
          </span>
          <div className="h-px flex-1 bg-[#E6E7EA]" />
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="mb-2 block text-sm font-medium">Correo</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
              placeholder="admin@scoretec.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#E6E7EA] px-4 py-3 outline-none focus:border-[#8C1D2C]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-xl bg-[#8C1D2C] px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;

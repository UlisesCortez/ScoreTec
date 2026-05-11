import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

function PublicNavbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("scoretec_token");
  const user = JSON.parse(localStorage.getItem("scoretec_user"));

  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("scoretec_token");
    localStorage.removeItem("scoretec_user");
    setMenuAbierto(false);
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `block rounded-xl px-4 py-3 text-sm font-semibold transition ${
      isActive ? "bg-[#8C1D2C] text-white" : "text-[#2B2D31] hover:bg-[#F4F4F5]"
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#E6E7EA] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E6E7EA] bg-white text-2xl font-bold text-[#2B2D31] transition hover:border-[#8C1D2C] hover:text-[#8C1D2C]"
              aria-label="Abrir menú"
            >
              ☰
            </button>

            <Link to="/" className="text-2xl font-bold text-[#2B2D31]">
              Score<span className="text-[#8C1D2C]">Tec</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {token ? (
              <>
                <span className="hidden text-sm text-[#6B6F76] sm:block">
                  {user?.nombre}
                </span>

                <button
                  type="button"
                  onClick={cerrarSesion}
                  className="rounded-xl bg-[#8C1D2C] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-xl bg-[#8C1D2C] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      {menuAbierto && (
        <div className="fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-black/40" onClick={cerrarMenu} />

          <aside className="absolute left-0 top-0 flex h-screen w-[280px] max-w-[82vw] flex-col bg-white p-5 shadow-2xl">
            {" "}
            <div className="mb-8 flex items-center justify-between">
              <Link
                to="/"
                onClick={cerrarMenu}
                className="text-3xl font-bold text-[#2B2D31]"
              >
                Score<span className="text-[#8C1D2C]">Tec</span>
              </Link>

              <button
                type="button"
                onClick={cerrarMenu}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6E7EA] text-xl font-bold text-[#2B2D31] transition hover:border-[#8C1D2C] hover:text-[#8C1D2C]"
                aria-label="Cerrar menú"
              >
                ×
              </button>
            </div>
            <nav className="space-y-2">
              <NavLink to="/" end className={linkClass} onClick={cerrarMenu}>
                Inicio
              </NavLink>

              <NavLink to="/matches" className={linkClass} onClick={cerrarMenu}>
                Partidos
              </NavLink>

              <NavLink to="/stats" className={linkClass} onClick={cerrarMenu}>
                Estadísticas
              </NavLink>

              <NavLink to="/teams" className={linkClass} onClick={cerrarMenu}>
                Equipos
              </NavLink>

              {user?.rol === "ADMIN" && (
                <NavLink to="/admin" className={linkClass} onClick={cerrarMenu}>
                  Panel admin
                </NavLink>
              )}

              {user?.rol === "ARBITRO" && (
                <NavLink
                  to="/referee"
                  className={linkClass}
                  onClick={cerrarMenu}
                >
                  Panel árbitro
                </NavLink>
              )}
            </nav>
            <div className="mt-auto">
              {token && (
                <>
                  <div className="rounded-2xl border border-[#E6E7EA] bg-[#FAFAFA] p-5">
                    <p className="text-sm font-bold text-[#2B2D31]">
                      {user?.nombre}
                    </p>

                    <p className="mt-1 break-all text-xs text-[#6B6F76]">
                      {user?.email}
                    </p>

                    <p className="mt-3 inline-block rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-bold text-[#8C1D2C]">
                      {user?.rol}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={cerrarSesion}
                    className="mt-4 w-full rounded-xl border border-[#8C1D2C] px-4 py-3 text-sm font-bold text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white"
                  >
                    Cerrar sesión
                  </button>
                </>
              )}

              {!token && (
                <Link
                  to="/login"
                  onClick={cerrarMenu}
                  className="block w-full rounded-xl bg-[#8C1D2C] px-4 py-3 text-center text-sm font-bold text-white transition hover:opacity-90"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default PublicNavbar;

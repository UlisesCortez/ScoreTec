import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import logoScoreTec from "../../assets/brand/scoretec-logo.png";

function PublicNavbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("scoretec_token");
  const user = JSON.parse(localStorage.getItem("scoretec_user"));

  const [menuAbierto, setMenuAbierto] = useState(false);

  const esAdmin = user?.rol === "ADMIN";
  const esArbitro = user?.rol === "ARBITRO";
  const esPublico = !esAdmin && !esArbitro;

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("scoretec_token");
    localStorage.removeItem("scoretec_user");
    setMenuAbierto(false);
    navigate("/login");
  };

  const linkDesktopClass = ({ isActive }) =>
    `rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
      isActive
        ? "bg-[#8C1D2C] !text-white shadow-sm"
        : "!text-[#4B4F56] hover:bg-[#F4F4F5] hover:!text-[#8C1D2C]"
    }`;

  const linkMobileClass = ({ isActive }) =>
    `block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
      isActive
        ? "bg-[#8C1D2C] !text-white"
        : "!text-[#2B2D31] hover:bg-[#F4F4F5] hover:!text-[#8C1D2C]"
    }`;

  const LogoPublico = ({ grande = false }) => (
    <Link to="/" onClick={cerrarMenu} className="flex items-center">
      <img
        src={logoScoreTec}
        alt="ScoreTec"
        className={
          grande
            ? "h-14 w-auto object-contain sm:h-16"
            : "h-12 w-auto object-contain sm:h-14 md:h-16 lg:h-20"
        }
      />
    </Link>
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#E6E7EA] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[86px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-none">
            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E6E7EA] bg-white text-2xl font-bold text-[#2B2D31] transition hover:border-[#8C1D2C] hover:text-[#8C1D2C] md:hidden"
              aria-label="Abrir menú"
            >
              ☰
            </button>

            <LogoPublico />
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {esArbitro ? (
              <>
                <NavLink to="/referee" end className={linkDesktopClass}>
                  Mis partidos
                </NavLink>

                <NavLink to="/" end className={linkDesktopClass}>
                  Inicio
                </NavLink>

                <NavLink to="/matches" className={linkDesktopClass}>
                  Partidos públicos
                </NavLink>

                <NavLink to="/stats" className={linkDesktopClass}>
                  Estadísticas
                </NavLink>

                <NavLink to="/teams" className={linkDesktopClass}>
                  Equipos
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/" end className={linkDesktopClass}>
                  Inicio
                </NavLink>

                <NavLink to="/matches" className={linkDesktopClass}>
                  Partidos
                </NavLink>

                <NavLink to="/stats" className={linkDesktopClass}>
                  Estadísticas
                </NavLink>

                <NavLink to="/teams" className={linkDesktopClass}>
                  Equipos
                </NavLink>

                {esAdmin && (
                  <NavLink to="/admin" className={linkDesktopClass}>
                    Admin
                  </NavLink>
                )}
              </>
            )}
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-3">
            {token ? (
              <>
                <div className="hidden text-right lg:block">
                  <p className="max-w-[190px] truncate text-sm font-semibold text-[#2B2D31]">
                    {user?.nombre}
                  </p>

                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6F76]">
                    {user?.rol}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cerrarSesion}
                  className="rounded-2xl bg-[#8C1D2C] px-3 py-2.5 text-sm font-semibold !text-white transition hover:bg-[#741826] sm:px-4 sm:py-3"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-2xl bg-[#8C1D2C] px-3 py-2.5 text-sm font-semibold !text-white transition hover:bg-[#741826] sm:px-4 sm:py-3"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      {menuAbierto && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={cerrarMenu} />

          <aside className="absolute left-0 top-0 flex h-screen w-[300px] max-w-[85vw] flex-col bg-white p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-3">
              <LogoPublico grande />

              <button
                type="button"
                onClick={cerrarMenu}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E6E7EA] text-xl font-bold text-[#2B2D31] transition hover:border-[#8C1D2C] hover:text-[#8C1D2C]"
                aria-label="Cerrar menú"
              >
                ×
              </button>
            </div>

            <nav className="space-y-2">
              {esArbitro && (
                <>
                  <NavLink
                    to="/referee"
                    end
                    className={linkMobileClass}
                    onClick={cerrarMenu}
                  >
                    Mis partidos
                  </NavLink>

                  <NavLink
                    to="/"
                    end
                    className={linkMobileClass}
                    onClick={cerrarMenu}
                  >
                    Inicio
                  </NavLink>

                  <NavLink
                    to="/matches"
                    className={linkMobileClass}
                    onClick={cerrarMenu}
                  >
                    Partidos públicos
                  </NavLink>

                  <NavLink
                    to="/stats"
                    className={linkMobileClass}
                    onClick={cerrarMenu}
                  >
                    Estadísticas
                  </NavLink>

                  <NavLink
                    to="/teams"
                    className={linkMobileClass}
                    onClick={cerrarMenu}
                  >
                    Equipos
                  </NavLink>
                </>
              )}

              {esAdmin && (
                <>
                  <NavLink
                    to="/admin"
                    end
                    className={linkMobileClass}
                    onClick={cerrarMenu}
                  >
                    Dashboard
                  </NavLink>

                  <NavLink
                    to="/admin/matches"
                    className={linkMobileClass}
                    onClick={cerrarMenu}
                  >
                    Partidos
                  </NavLink>
                  <NavLink to="/calendar" className={linkDesktopClass}>
                    Calendario
                  </NavLink>

                  <NavLink
                    to="/admin/teams"
                    className={linkMobileClass}
                    onClick={cerrarMenu}
                  >
                    Equipos
                  </NavLink>

                  <NavLink
                    to="/admin/players"
                    className={linkMobileClass}
                    onClick={cerrarMenu}
                  >
                    Jugadores
                  </NavLink>

                  <NavLink
                    to="/admin/disciplines"
                    className={linkMobileClass}
                    onClick={cerrarMenu}
                  >
                    Disciplinas
                  </NavLink>

                  <NavLink
                    to="/admin/users"
                    className={linkMobileClass}
                    onClick={cerrarMenu}
                  >
                    Usuarios
                  </NavLink>
                </>
              )}

              {esPublico && (
                <>
                  <NavLink
                    to="/"
                    end
                    className={linkMobileClass}
                    onClick={cerrarMenu}
                  >
                    Inicio
                  </NavLink>

                  <NavLink
                    to="/matches"
                    className={linkMobileClass}
                    onClick={cerrarMenu}
                  >
                    Partidos
                  </NavLink>

                  <NavLink
                    to="/stats"
                    className={linkMobileClass}
                    onClick={cerrarMenu}
                  >
                    Estadísticas
                  </NavLink>

                  <NavLink
                    to="/teams"
                    className={linkMobileClass}
                    onClick={cerrarMenu}
                  >
                    Equipos
                  </NavLink>

                  <NavLink to="/calendar" className={linkDesktopClass}>
                    Calendario
                  </NavLink>
                </>
              )}
            </nav>

            <div className="mt-auto">
              {token ? (
                <>
                  <div className="rounded-3xl border border-[#E6E7EA] bg-[#FAFAFA] p-4">
                    <p className="text-sm font-semibold text-[#2B2D31]">
                      {user?.nombre}
                    </p>

                    <p className="mt-1 break-all text-xs text-[#6B6F76]">
                      {user?.email}
                    </p>

                    <p className="mt-3 inline-block rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-semibold text-[#8C1D2C]">
                      {user?.rol}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={cerrarSesion}
                    className="mt-4 w-full rounded-2xl border border-[#8C1D2C] bg-white px-4 py-3 text-sm font-semibold !text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:!text-white"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={cerrarMenu}
                  className="block w-full rounded-2xl bg-[#8C1D2C] px-4 py-3 text-center text-sm font-semibold !text-white transition hover:bg-[#741826]"
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

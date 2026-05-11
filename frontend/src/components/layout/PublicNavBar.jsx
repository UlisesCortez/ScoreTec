import { Link, NavLink, useNavigate } from "react-router-dom";

function PublicNavbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("scoretec_token");
  const user = JSON.parse(localStorage.getItem("scoretec_user"));

  const cerrarSesion = () => {
    localStorage.removeItem("scoretec_token");
    localStorage.removeItem("scoretec_user");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `rounded-xl px-4 py-2 text-sm font-medium transition ${
      isActive ? "bg-[#8C1D2C] text-white" : "text-[#2B2D31] hover:bg-[#F4F4F5]"
    }`;

  return (
    <header className="border-b border-[#E6E7EA] bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-bold text-[#2B2D31]">
          Score<span className="text-[#8C1D2C]">Tec</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={linkClass}>
            Inicio
          </NavLink>

          <NavLink to="/matches" className={linkClass}>
            Partidos
          </NavLink>

          <NavLink to="/stats" className={linkClass}>
            Estadísticas
          </NavLink>

          <NavLink to="/teams" className={linkClass}>
            Equipos
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {token ? (
            <>
              <span className="hidden text-sm text-[#6B6F76] sm:block">
                {user?.nombre}
              </span>

              {user?.rol === "ADMIN" && (
                <Link
                  to="/admin"
                  className="rounded-xl border border-[#8C1D2C] px-4 py-2 text-sm font-semibold text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white"
                >
                  Admin
                </Link>
              )}

              {user?.rol === "ARBITRO" && (
                <Link
                  to="/referee"
                  className="rounded-xl border border-[#8C1D2C] px-4 py-2 text-sm font-semibold text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white"
                >
                  Árbitro
                </Link>
              )}

              <button
                onClick={cerrarSesion}
                className="rounded-xl bg-[#8C1D2C] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-[#8C1D2C] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default PublicNavbar;

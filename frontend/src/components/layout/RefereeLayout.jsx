import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function RefereeLayout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("scoretec_user"));
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarSesion = () => {
    localStorage.removeItem("scoretec_token");
    localStorage.removeItem("scoretec_user");
    navigate("/login");
  };

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  const linkClass = ({ isActive }) =>
    `block rounded-xl px-4 py-3 text-sm font-semibold transition ${
      isActive
        ? "bg-[#8C1D2C] text-white"
        : "text-[#4B4F56] hover:bg-[#F4F4F5] hover:text-[#8C1D2C]"
    }`;

  const SidebarContent = ({ mostrarLogo = true }) => (
    <div className="flex h-full flex-col">
      {mostrarLogo && (
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-[#2B2D31]">
            Score<span className="text-[#8C1D2C]">Tec</span>
          </h1>
          <p className="mt-1 text-sm text-[#6B6F76]">Panel de árbitro</p>
        </div>
      )}

      <nav className="space-y-2">
        <NavLink to="/referee" end className={linkClass} onClick={cerrarMenu}>
          Mis partidos
        </NavLink>

        <NavLink to="/matches" className={linkClass} onClick={cerrarMenu}>
          Vista pública
        </NavLink>

        <NavLink to="/" className={linkClass} onClick={cerrarMenu}>
          Inicio
        </NavLink>
      </nav>

      <div className="mt-auto">
        <div className="rounded-2xl border border-[#E6E7EA] bg-[#FAFAFA] p-4">
          <p className="text-sm font-bold text-[#2B2D31]">
            {user?.nombre || "Árbitro"}
          </p>

          <p className="mt-1 break-all text-xs text-[#6B6F76]">
            {user?.email || "Sin correo"}
          </p>

          <p className="mt-3 inline-block rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-bold text-[#8C1D2C]">
            {user?.rol || "ARBITRO"}
          </p>
        </div>

        <button
          type="button"
          onClick={cerrarSesion}
          className="mt-4 w-full rounded-xl border border-[#8C1D2C] px-4 py-3 text-sm font-bold text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F7F7F8] text-[#2B2D31]">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 border-r border-[#E6E7EA] bg-white p-6 lg:block">
          <SidebarContent />
        </aside>

        {menuAbierto && (
          <div className="fixed inset-0 z-[9999] lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={cerrarMenu}
            />

            <aside className="absolute left-0 top-0 flex h-screen w-[290px] max-w-[85vw] flex-col bg-white p-5 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#2B2D31]">
                  Score<span className="text-[#8C1D2C]">Tec</span>
                </h2>

                <button
                  type="button"
                  onClick={cerrarMenu}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6E7EA] text-xl font-bold text-[#2B2D31]"
                  aria-label="Cerrar menú"
                >
                  ×
                </button>
              </div>

              <SidebarContent mostrarLogo={false} />
            </aside>
          </div>
        )}

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-[#E6E7EA] bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setMenuAbierto(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6E7EA] text-xl font-bold"
                aria-label="Abrir menú"
              >
                ☰
              </button>

              <div className="text-center">
                <h1 className="text-xl font-black leading-none">
                  Score<span className="text-[#8C1D2C]">Tec</span>
                </h1>
                <p className="mt-1 text-[11px] font-semibold text-[#6B6F76]">
                  Árbitro
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarSesion}
                className="rounded-xl bg-[#8C1D2C] px-3 py-2 text-xs font-bold text-white"
              >
                Salir
              </button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

export default RefereeLayout;

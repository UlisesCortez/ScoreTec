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
      isActive ? "bg-[#8C1D2C] text-white" : "text-[#2B2D31] hover:bg-[#F4F4F5]"
    }`;

  const SidebarContent = ({ mostrarLogo = true }) => (
    <>
      {mostrarLogo && (
        <div className="mb-10">
          <h1 className="text-3xl font-bold">
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

      <div className="mt-10 rounded-2xl border border-[#E6E7EA] bg-[#FAFAFA] p-4">
        <p className="text-sm font-semibold">{user?.nombre}</p>
        <p className="mt-1 break-all text-xs text-[#6B6F76]">{user?.email}</p>
        <p className="mt-2 inline-block rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-semibold text-[#8C1D2C]">
          {user?.rol}
        </p>
      </div>

      <button
        type="button"
        onClick={cerrarSesion}
        className="mt-6 w-full rounded-xl border border-[#8C1D2C] px-4 py-3 text-sm font-semibold text-[#8C1D2C] transition hover:bg-[#8C1D2C] hover:text-white"
      >
        Cerrar sesión
      </button>
    </>
  );

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#2B2D31]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-[#E6E7EA] bg-white p-6 lg:block">
          <SidebarContent />
        </aside>

        {menuAbierto && (
          <div className="fixed inset-0 z-[9999] lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={cerrarMenu}
            />

            <aside className="absolute left-0 top-0 flex h-screen w-[280px] flex-col bg-white p-5 shadow-2xl">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Score<span className="text-[#8C1D2C]">Tec</span>
                </h2>

                <button
                  type="button"
                  onClick={cerrarMenu}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E6E7EA] text-lg font-semibold"
                >
                  ×
                </button>
              </div>

              <SidebarContent mostrarLogo={false} />
            </aside>
          </div>
        )}

        <section className="flex-1">
          <header className="border-b border-[#E6E7EA] bg-white px-6 py-4 lg:hidden">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMenuAbierto(true)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E6E7EA] text-2xl font-bold"
              >
                ☰
              </button>

              <h1 className="text-2xl font-bold">
                Score<span className="text-[#8C1D2C]">Tec</span>
              </h1>

              <button
                type="button"
                onClick={cerrarSesion}
                className="rounded-xl bg-[#8C1D2C] px-4 py-2 text-sm font-semibold text-white"
              >
                Salir
              </button>
            </div>
          </header>

          <div className="p-6 lg:p-10">{children}</div>
        </section>
      </div>
    </main>
  );
}

export default RefereeLayout;

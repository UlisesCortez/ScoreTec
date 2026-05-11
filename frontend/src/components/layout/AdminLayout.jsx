import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("scoretec_user"));

  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarSesion = () => {
    localStorage.removeItem("scoretec_token");
    localStorage.removeItem("scoretec_user");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `block rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive ? "bg-[#8C1D2C] text-white" : "text-[#2B2D31] hover:bg-[#F4F4F5]"
    }`;

  const SidebarContent = () => (
    <>
      <div className="mb-10">
        <h1 className="text-3xl font-bold">
          Score<span className="text-[#8C1D2C]">Tec</span>
        </h1>
        <p className="mt-1 text-sm text-[#6B6F76]">Panel administrativo</p>
      </div>

      <nav className="space-y-2">
        <NavLink
          to="/admin"
          end
          className={linkClass}
          onClick={() => setMenuAbierto(false)}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/disciplines"
          className={linkClass}
          onClick={() => setMenuAbierto(false)}
        >
          Disciplinas
        </NavLink>

        <NavLink
          to="/admin/teams"
          className={linkClass}
          onClick={() => setMenuAbierto(false)}
        >
          Equipos
        </NavLink>

        <NavLink
          to="/admin/players"
          className={linkClass}
          onClick={() => setMenuAbierto(false)}
        >
          Jugadores
        </NavLink>

        <NavLink
          to="/admin/matches"
          className={linkClass}
          onClick={() => setMenuAbierto(false)}
        >
          Partidos
        </NavLink>

        <NavLink
          to="/admin/users"
          className={linkClass}
          onClick={() => setMenuAbierto(false)}
        >
          Usuarios
        </NavLink>
      </nav>

      <div className="mt-10 rounded-2xl border border-[#E6E7EA] bg-[#FAFAFA] p-4">
        <p className="text-sm font-semibold">{user?.nombre}</p>
        <p className="mt-1 text-xs text-[#6B6F76]">{user?.email}</p>
        <p className="mt-2 inline-block rounded-full bg-[#F8F2E2] px-3 py-1 text-xs font-semibold text-[#8C1D2C]">
          {user?.rol}
        </p>
      </div>

      <button
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
        {/* Sidebar escritorio */}
        <aside className="hidden w-72 border-r border-[#E6E7EA] bg-white p-6 lg:block">
          <SidebarContent />
        </aside>

        {/* Sidebar móvil */}
        {menuAbierto && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setMenuAbierto(false)}
            />

            <aside className="relative h-full w-72 bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  Score<span className="text-[#8C1D2C]">Tec</span>
                </h2>

                <button
                  onClick={() => setMenuAbierto(false)}
                  className="rounded-xl border border-[#E6E7EA] px-3 py-2 text-sm font-semibold"
                >
                  X
                </button>
              </div>

              <SidebarContent />
            </aside>
          </div>
        )}

        <section className="flex-1">
          {/* Header móvil */}
          <header className="border-b border-[#E6E7EA] bg-white px-6 py-4 lg:hidden">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMenuAbierto(true)}
                className="rounded-xl border border-[#E6E7EA] px-3 py-2 text-xl font-bold text-[#2B2D31]"
                aria-label="Abrir menú"
              >
                ☰
              </button>

              <h1 className="text-2xl font-bold">
                Score<span className="text-[#8C1D2C]">Tec</span>
              </h1>

              <button
                onClick={cerrarSesion}
                className="rounded-xl border border-[#8C1D2C] px-3 py-2 text-sm font-semibold text-[#8C1D2C]"
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

export default AdminLayout;

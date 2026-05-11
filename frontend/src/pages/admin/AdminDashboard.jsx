import AdminLayout from "../../components/layout/AdminLayout";

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("scoretec_user"));

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="mt-2 text-[#6B6F76]">
          Bienvenido, {user?.nombre}. Desde aquí podrás administrar el torneo.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#6B6F76]">Disciplinas</p>
          <h3 className="mt-3 text-3xl font-bold">—</h3>
        </div>

        <div className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#6B6F76]">Equipos</p>
          <h3 className="mt-3 text-3xl font-bold">—</h3>
        </div>

        <div className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#6B6F76]">Jugadores</p>
          <h3 className="mt-3 text-3xl font-bold">—</h3>
        </div>

        <div className="rounded-3xl border border-[#E6E7EA] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#6B6F76]">Partidos</p>
          <h3 className="mt-3 text-3xl font-bold">—</h3>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;

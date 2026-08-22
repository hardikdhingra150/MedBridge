import {
    LayoutDashboard,
    Users,
    Search,
    GitMerge,
    ScrollText,
    ArrowLeft,
    LogOut,
  } from "lucide-react";

  import { useLocation, useNavigate } from "react-router-dom";
  import { useAuth } from "../../context/auth";

  const items = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["DOCTOR", "EXPERT", "ADMIN"],
      path: "/platform",
    },
    {
      label: "Patients",
      icon: Users,
      roles: ["DOCTOR", "ADMIN"],
      path: "/clinical",
    },
    {
      label: "Terminology",
      icon: Search,
      roles: ["DOCTOR", "EXPERT", "ADMIN"],
      path: "/terminology",
      adminPath: "/admin/terminology",
    },
    {
      label: "Mapping Review",
      icon: GitMerge,
      roles: ["EXPERT", "ADMIN"],
      path: "/review",
    },
    {
      label: "Audit Trail",
      icon: ScrollText,
      roles: ["DOCTOR", "EXPERT", "ADMIN"],
      path: "/audit",
    },
  ];

  function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const visibleItems = items.filter((item) =>
      item.roles.includes(user.role)
    );

    async function handleLogout() {
      await logout();
      navigate("/login", { replace: true });
    }

    return (
      <aside className="platform-sidebar">
        <div className="sidebar-brand">
          <div>M</div>

          <section>
            <strong>MEDBRIDGE</strong>
            <span>Clinical Gateway</span>
          </section>
        </div>

        <div className="sidebar-label">
          WORKSPACE
        </div>

        <nav>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const destination =
              user.role === "ADMIN" && item.adminPath
                ? item.adminPath
                : item.path;

            return (
              <button
                key={item.label}
                onClick={() => navigate(destination)}
                className={
                  location.pathname === destination
                    ? "sidebar-active"
                    : ""
                }
              >
                <Icon size={18} />

                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button onClick={handleLogout}>
            <LogOut size={18} />
            Sign out
          </button>

          <button onClick={() => navigate("/")}>
            <ArrowLeft size={18} />
            Back to site
          </button>
        </div>
      </aside>
    );
  }

  export default Sidebar;

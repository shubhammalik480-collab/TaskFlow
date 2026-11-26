import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CreateBoardModal from "../components/CreateBoardModal";
import API from "../api/axios";

import {
  FolderKanban,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  LogOut,
} from "lucide-react";

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Projects state
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch Boards from MongoDB
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/boards");

        const formattedBoards = response.data.boards.map((board) => ({
          id: board._id,
          name: board.title,
          description: board.description,
          progress: 0,
          members: (board.members || []).map((member) =>
            member.name
              ? member.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "U"
          ),
          status: "In Progress",
        }));

        setProjects(formattedBoards);
      } catch (err) {
        console.error("Fetch Boards Error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to fetch boards. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  // Statistics
  const stats = [
    {
      title: "Total Projects",
      value: projects.length,
      icon: FolderKanban,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Team Members",
      value: "24",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Completed Tasks",
      value: "48",
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Pending Tasks",
      value: "16",
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  // Create new board
  const handleCreateBoard = (board) => {
    const formattedBoard = {
      id: board._id,
      name: board.title,
      description: board.description,
      progress: 0,
      members: ["SM"],
      status: "In Progress",
    };

    setProjects((previousProjects) => [
      formattedBoard,
      ...previousProjects,
    ]);
  };

  // Open Board using URL navigation
  const handleOpenBoard = (board) => {
    navigate(`/board/${board.id}`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onCreateClick={() => setIsModalOpen(true)}
        />
      </div>

      {/* Main Content */}
      <main className="min-w-0 flex-1">

        {/* Navbar */}
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="p-5 sm:p-8">

          {/* Welcome Section */}
          <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                Welcome back, {user?.name || "User"}! 👋
              </h1>

              <p className="mt-2 text-slate-500">
                Here's what's happening with your projects today.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">

              {/* Create Project */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700"
              >
                <Plus size={20} />
                Create Project
              </button>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-5 py-3 font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>

            </div>
          </section>

          {/* Statistics Cards */}
          <section className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">
                        {stat.title}
                      </p>

                      <h2 className="mt-2 text-3xl font-bold text-slate-800">
                        {stat.value}
                      </h2>
                    </div>

                    <div className={`rounded-xl p-3 ${stat.color}`}>
                      <Icon size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Projects Section */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  My Projects
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage and track your ongoing projects.
                </p>
              </div>

              <button className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                View All
                <ArrowUpRight size={17} />
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <p className="py-8 text-center text-slate-500">
                Loading your boards...
              </p>
            )}

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Project Cards */}
            {!loading && !error && (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleOpenBoard(project)}
                    className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >

                    {/* Card Header */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className="rounded-lg bg-blue-50 p-3">
                        <FolderKanban
                          className="text-blue-600"
                          size={23}
                        />
                      </div>

                      <button
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`More options for ${project.name}`}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <MoreHorizontal size={22} />
                      </button>
                    </div>

                    {/* Project Details */}
                    <h3 className="text-lg font-semibold text-slate-800">
                      {project.name}
                    </h3>

                    <p className="mt-2 min-h-10 text-sm leading-6 text-slate-500">
                      {project.description || "No description provided."}
                    </p>

                    {/* Progress */}
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Progress
                      </span>

                      <span className="text-sm font-semibold text-slate-800">
                        {project.progress}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${project.progress || 0}%`,
                        }}
                      />
                    </div>

                    {/* Card Footer */}
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="flex -space-x-2">
                        {(project.members || []).map((member, index) => (
                          <div
                            key={`${member}-${index}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-semibold text-slate-700"
                          >
                            {member}
                          </div>
                        ))}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          project.status === "Completed"
                            ? "bg-green-50 text-green-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {project.status || "In Progress"}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && projects.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <FolderKanban
                  size={40}
                  className="mx-auto text-slate-400"
                />

                <h3 className="mt-4 font-semibold text-slate-700">
                  No projects yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Create your first board to get started.
                </p>
              </div>
            )}

          </section>
        </div>
      </main>

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateBoard}
      />

    </div>
  );
}

export default Dashboard;
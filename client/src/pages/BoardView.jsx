import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  DndContext,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {
  ArrowLeft,
  Plus,
  MoreHorizontal,
  CalendarDays,
  Pencil,
  Trash2,
  GripVertical,
} from "lucide-react";

import API from "../api/axios";
import socket from "../socket";
import AddTaskModal from "../components/AddTaskModal";
import EditTaskModal from "../components/EditTaskModal";

// Column colors
const getColumnStyle = (title) => {
  switch (title.toLowerCase()) {
    case "to do":
      return {
        color: "bg-slate-400",
        badge: "bg-slate-100 text-slate-600",
      };

    case "in progress":
      return {
        color: "bg-blue-500",
        badge: "bg-blue-100 text-blue-600",
      };

    case "done":
      return {
        color: "bg-green-500",
        badge: "bg-green-100 text-green-600",
      };

    default:
      return {
        color: "bg-purple-500",
        badge: "bg-purple-100 text-purple-600",
      };
  }
};

// Individual Task Card
function TaskCard({ task, onEdit, onDelete, getPriorityColor }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="break-words font-semibold text-slate-800">
          {task.title}
        </h3>

        <button
          {...attributes}
          {...listeners}
          type="button"
          aria-label={`Drag ${task.title}`}
          className="shrink-0 cursor-grab touch-none rounded-md p-1 text-slate-400 hover:bg-slate-100 active:cursor-grabbing"
        >
          <GripVertical size={19} />
        </button>
      </div>

      <p className="mb-4 break-words text-sm leading-5 text-slate-500">
        {task.description || "No description provided."}
      </p>

      <div className="mb-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPriorityColor(
            task.priority
          )}`}
        >
          {task.priority} Priority
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <CalendarDays size={14} />
          Task
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label="Edit task"
            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(task._id)}
            aria-label="Delete task"
            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Kanban Column
function KanbanColumn({
  column,
  columnTasks,
  onEdit,
  onDelete,
  onEditColumn,
  onDeleteColumn,
  isMenuOpen,
  onToggleMenu,
  getPriorityColor,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
  });

  const styles = getColumnStyle(column.title);

  return (
    <div
      ref={setNodeRef}
      className={`min-h-96 rounded-xl p-4 transition-colors ${
        isOver ? "bg-blue-100 ring-2 ring-blue-300" : "bg-slate-100"
      }`}
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${styles.color}`} />

          <h2 className="font-bold text-slate-700">
            {column.title}
          </h2>

          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${styles.badge}`}
          >
            {columnTasks.length}
          </span>
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label={`More options for ${column.title}`}
            aria-expanded={isMenuOpen}
            onClick={() => onToggleMenu(column._id)}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <MoreHorizontal size={20} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => onEditColumn(column)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <Pencil size={15} />
                Rename column
              </button>

              <button
                type="button"
                onClick={() => onDeleteColumn(column)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={15} />
                Delete column
              </button>
            </div>
          )}
        </div>
      </div>

      <SortableContext
        items={columnTasks.map((task) => task._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-64 space-y-3">
          {columnTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              getPriorityColor={getPriorityColor}
            />
          ))}

          {columnTasks.length === 0 && (
            <div className="flex min-h-48 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-sm text-slate-400">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// Main Board Component
function BoardView() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeColumnMenu, setActiveColumnMenu] = useState(null);

  // Drag Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch Board, Columns and Tasks
  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [boardResponse, columnResponse, taskResponse] =
          await Promise.all([
            API.get(`/boards/${boardId}`),
            API.get(`/columns/${boardId}`),
            API.get(`/tasks/${boardId}`),
          ]);

        setBoard(boardResponse.data.board);
        setColumns(columnResponse.data.columns || []);
        setTasks(taskResponse.data.tasks || []);
      } catch (err) {
        console.error("Board Fetch Error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load board. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (boardId) {
      fetchBoardData();
    } else {
      setError("Invalid Board ID.");
      setLoading(false);
    }
  }, [boardId]);

  // Socket.io Connection, Board Room and Real-Time Task Events
  useEffect(() => {
    if (!boardId) return;

    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join-board", boardId);
    };

    const handleTaskCreated = (newTask) => {
      console.log("Real-time Task Created:", newTask);
      setTasks((previousTasks) => {
        const alreadyExists = previousTasks.some(
          (task) => task._id === newTask._id
        );
        return alreadyExists ? previousTasks : [...previousTasks, newTask];
      });
    };

    const handleTaskMoved = (updatedTask) => {
      console.log("Real-time Task Moved:", updatedTask);
      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    };

    const handleTaskUpdated = (updatedTask) => {
      console.log("Real-time Task Updated:", updatedTask);
      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    };

    const handleTaskDeleted = (data) => {
      console.log("Real-time Task Deleted:", data.taskId);
      setTasks((previousTasks) =>
        previousTasks.filter((task) => task._id !== data.taskId)
      );
    };

    const handleUserJoined = (data) => {
      console.log("A user joined this board:", data.userId);
    };

    const handleSocketError = (data) => {
      console.error("Socket error:", data.message);
    };

    const handleConnectError = (err) => {
      console.error("Socket connection failed:", err.message);
    };

    socket.on("connect", handleConnect);
    socket.on("task:created", handleTaskCreated);
    socket.on("task:moved", handleTaskMoved);
    socket.on("task:updated", handleTaskUpdated);
    socket.on("task:deleted", handleTaskDeleted);
    socket.on("user:joined", handleUserJoined);
    socket.on("socket:error", handleSocketError);
    socket.on("connect_error", handleConnectError);

    socket.connect();

    return () => {
      socket.emit("leave-board", boardId);
      socket.off("connect", handleConnect);
      socket.off("task:created", handleTaskCreated);
      socket.off("task:moved", handleTaskMoved);
      socket.off("task:updated", handleTaskUpdated);
      socket.off("task:deleted", handleTaskDeleted);
      socket.off("user:joined", handleUserJoined);
      socket.off("socket:error", handleSocketError);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, [boardId]);

  // Create Column
  const handleCreateColumn = async () => {
    const title = window.prompt("Enter new column name:");

    if (!title || !title.trim()) return;

    try {
      const response = await API.post(`/columns/${boardId}`, {
        title: title.trim(),
      });

      setColumns((previousColumns) => [
        ...previousColumns,
        response.data.column,
      ]);

      setActiveColumnMenu(null);
    } catch (err) {
      console.error("Create Column Error:", err);
      alert(err.response?.data?.message || "Unable to create column.");
    }
  };

  // Rename Column
  const handleEditColumn = async (column) => {
    setActiveColumnMenu(null);

    const title = window.prompt("Enter new column name:", column.title);

    if (!title || !title.trim() || title.trim() === column.title) return;

    try {
      const response = await API.put(`/columns/${boardId}/${column._id}`, {
        title: title.trim(),
      });

      setColumns((previousColumns) =>
        previousColumns.map((item) =>
          item._id === column._id
            ? {
                ...item,
                ...(response.data.column || {}),
                title: title.trim(),
              }
            : item
        )
      );
    } catch (err) {
      console.error("Update Column Error:", err);
      alert(err.response?.data?.message || "Unable to update column.");
    }
  };

  // Delete Column
  const handleDeleteColumn = async (column) => {
    setActiveColumnMenu(null);

    if (
      tasks.some(
        (task) =>
          (task.column?._id || task.column) === column._id
      )
    ) {
      alert(
        "This column is not empty. Move or delete its tasks before deleting it."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${column.title}"?`
    );

    if (!confirmed) return;

    try {
      await API.delete(`/columns/${boardId}/${column._id}`);

      setColumns((previousColumns) =>
        previousColumns.filter((item) => item._id !== column._id)
      );
    } catch (err) {
      console.error("Delete Column Error:", err);
      alert(err.response?.data?.message || "Unable to delete column.");
    }
  };

  // Create Task
  const handleCreateTask = async (taskData) => {
    try {
      if (columns.length === 0) {
        throw new Error("No column available in this board.");
      }

      const defaultColumn = columns[0];

      const response = await API.post(`/tasks/${boardId}`, {
        ...taskData,
        column: defaultColumn._id,
      });

      setTasks((previousTasks) => {
  const alreadyExists = previousTasks.some(
    (task) => task._id === response.data.task._id
  );

  if (alreadyExists) {
    return previousTasks;
  }

  return [...previousTasks, response.data.task];
});
    } catch (err) {
      console.error("Create Task Error:", err);

      throw new Error(
        err.response?.data?.message || "Unable to create task."
      );
    }
  };

  // Edit Task Click
  const handleEditClick = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  // Update Task
  const handleUpdateTask = async (updatedTask) => {
    try {
      const response = await API.put(
        `/tasks/${boardId}/${updatedTask._id}`,
        {
          title: updatedTask.title,
          description: updatedTask.description,
          priority: updatedTask.priority,
        }
      );

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task._id === updatedTask._id
            ? { ...task, ...response.data.task }
            : task
        )
      );
    } catch (err) {
      console.error("Update Task Error:", err);

      throw new Error(
        err.response?.data?.message || "Unable to update task."
      );
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/tasks/${boardId}/${taskId}`);

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task._id !== taskId)
      );
    } catch (err) {
      console.error("Delete Task Error:", err);

      alert(
        err.response?.data?.message || "Unable to delete task."
      );
    }
  };

  // Drag and Drop
  const handleDragEnd = async ({ active, over }) => {
    if (!over) return;

    const activeTask = tasks.find(
      (task) => task._id === active.id
    );

    if (!activeTask) return;

    const overTask = tasks.find(
      (task) => task._id === over.id
    );

    const targetColumn =
      columns.find((column) => column._id === over.id) ||
      columns.find(
        (column) =>
          column._id === (overTask?.column?._id || overTask?.column)
      );

    if (!targetColumn) return;

    const sourceColumnId =
      activeTask.column?._id || activeTask.column;

    // Same column: reorder tasks
    if (sourceColumnId === targetColumn._id) {
      if (!overTask || active.id === over.id) return;

      const columnTasks = tasks
        .filter(
          (task) =>
            (task.column?._id || task.column) === sourceColumnId
        )
        .sort((a, b) => a.order - b.order);

      const oldIndex = columnTasks.findIndex(
        (task) => task._id === active.id
      );

      const newIndex = columnTasks.findIndex(
        (task) => task._id === over.id
      );

      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedTasks = arrayMove(
        columnTasks,
        oldIndex,
        newIndex
      );

      const otherTasks = tasks.filter(
        (task) =>
          (task.column?._id || task.column) !== sourceColumnId
      );

      const newTasks = [
        ...otherTasks,
        ...reorderedTasks.map((task, index) => ({
          ...task,
          order: index,
        })),
      ];

      setTasks(newTasks);

      try {
        await Promise.all(
          reorderedTasks.map((task, index) =>
            API.put(`/tasks/${boardId}/${task._id}`, {
              order: index,
            })
          )
        );
      } catch (err) {
        console.error("Task Reorder Error:", err);
        alert("Unable to save task order. Reloading board.");

        const response = await API.get(`/tasks/${boardId}`);
        setTasks(response.data.tasks || []);
      }

      return;
    }

    // Different column: move task
    const destinationTasks = tasks.filter(
      (task) =>
        (task.column?._id || task.column) === targetColumn._id
    );

    const newOrder = destinationTasks.length;

    const previousTasks = [...tasks];

    const newTasks = tasks.map((task) =>
      task._id === active.id
        ? {
            ...task,
            column: targetColumn._id,
            order: newOrder,
          }
        : task
    );

    setTasks(newTasks);

    try {
      await API.put(`/tasks/${boardId}/${activeTask._id}`, {
        column: targetColumn._id,
        order: newOrder,
      });
    } catch (err) {
      console.error("Task Move Error:", err);
      alert("Unable to move task. Reloading board.");

      try {
        const response = await API.get(`/tasks/${boardId}`);
        setTasks(response.data.tasks || previousTasks);
      } catch {
        setTasks(previousTasks);
      }
    }
  };

  // Priority Colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-600";

      case "medium":
        return "bg-yellow-100 text-yellow-700";

      case "low":
        return "bg-green-100 text-green-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-semibold text-slate-600">
          Loading board...
        </p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-5">
        <p className="text-center text-red-600">{error}</p>

        <button
          onClick={() => navigate("/")}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {board?.title || board?.name || "Untitled Board"}
            </h1>

            <p className="mt-2 text-slate-500">
              {board?.description || "No description provided."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCreateColumn}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 hover:bg-slate-100"
            >
              <Plus size={19} />
              Add Column
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
            >
              <Plus size={19} />
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {columns.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-slate-500">
          No columns found in this board.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {columns.map((column) => {
              const columnTasks = tasks
                .filter(
                  (task) =>
                    (task.column?._id || task.column) === column._id
                )
                .sort((a, b) => a.order - b.order);

              return (
                <KanbanColumn
                  key={column._id}
                  column={column}
                  columnTasks={columnTasks}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteTask}
                  onEditColumn={handleEditColumn}
                  onDeleteColumn={handleDeleteColumn}
                  isMenuOpen={activeColumnMenu === column._id}
                  onToggleMenu={(columnId) =>
                    setActiveColumnMenu((current) =>
                      current === columnId ? null : columnId
                    )
                  }
                  getPriorityColor={getPriorityColor}
                />
              );
            })}
          </div>
        </DndContext>
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateTask}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onUpdate={handleUpdateTask}
      />
    </div>
  );
}

export default BoardView;
import { useState } from "react";

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
  Flag,
  Pencil,
  Trash2,
  GripVertical,
} from "lucide-react";

import AddTaskModal from "../components/AddTaskModal";
import EditTaskModal from "../components/EditTaskModal";

// Kanban Columns
const columns = [
  {
    title: "To Do",
    color: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600",
  },
  {
    title: "In Progress",
    color: "bg-blue-500",
    badge: "bg-blue-100 text-blue-600",
  },
  {
    title: "Done",
    color: "bg-green-500",
    badge: "bg-green-100 text-green-600",
  },
];

// Individual Task Card
function TaskCard({
  task,
  onEdit,
  onDelete,
  getPriorityColor,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
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
      {/* Task Title */}
      <div className="mb-3 flex items-start justify-between gap-2">

        <h3 className="font-semibold text-slate-800 break-words">
          {task.title}
        </h3>

        {/* Drag Handle */}
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

      {/* Description */}
      <p className="mb-4 break-words text-sm leading-5 text-slate-500">
        {task.description || "No description provided."}
      </p>

      {/* Priority */}
      <div className="mb-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPriorityColor(
            task.priority
          )}`}
        >
          {task.priority} Priority
        </span>
      </div>

      {/* Task Footer */}
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
            onClick={() => onDelete(task.id)}
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
  getPriorityColor,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.title,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-96 rounded-xl p-4 transition-colors ${
        isOver ? "bg-blue-100 ring-2 ring-blue-300" : "bg-slate-100"
      }`}
    >
      {/* Column Header */}
      <div className="mb-5 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span
            className={`h-3 w-3 rounded-full ${column.color}`}
          />

          <h2 className="font-bold text-slate-700">
            {column.title}
          </h2>

          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${column.badge}`}>
            {columnTasks.length}
          </span>

        </div>

        <button
          type="button"
          aria-label={`More options for ${column.title}`}
          className="text-slate-400 hover:text-slate-700"
        >
          <MoreHorizontal size={20} />
        </button>

      </div>

      {/* Sortable Tasks */}
      <SortableContext
        items={columnTasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-64 space-y-3">

          {columnTasks.map((task) => (
            <TaskCard
              key={task.id}
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
function BoardView({ board, onBack }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);

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

  // Create Task
  const handleCreateTask = (newTask) => {
    setTasks((previousTasks) => [
      ...previousTasks,
      newTask,
    ]);
  };

  // Edit Task Modal
  const handleEditClick = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  // Update Task
  const handleUpdateTask = (updatedTask) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  // Delete Task
  const handleDeleteTask = (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== taskId)
    );
  };

  // Drag and Drop
  const handleDragEnd = ({ active, over }) => {
    if (!over) return;

    setTasks((previousTasks) => {
      const activeTask = previousTasks.find(
        (task) => task.id === active.id
      );

      if (!activeTask) return previousTasks;

      const overTask = previousTasks.find(
        (task) => task.id === over.id
      );

      // Find destination column
      const targetColumn = columns.find(
        (column) => column.title === over.id
      ) || columns.find(
        (column) => column.title === overTask?.status
      );

      if (!targetColumn) return previousTasks;

      // Same column: reorder tasks
      if (activeTask.status === targetColumn.title) {
        if (!overTask || active.id === over.id) {
          return previousTasks;
        }

        const columnTasks = previousTasks.filter(
          (task) => task.status === activeTask.status
        );

        const oldIndex = columnTasks.findIndex(
          (task) => task.id === active.id
        );

        const newIndex = columnTasks.findIndex(
          (task) => task.id === over.id
        );

        if (oldIndex === -1 || newIndex === -1) {
          return previousTasks;
        }

        const reorderedTasks = arrayMove(
          columnTasks,
          oldIndex,
          newIndex
        );

        const otherTasks = previousTasks.filter(
          (task) => task.status !== activeTask.status
        );

        return [...otherTasks, ...reorderedTasks];
      }

      // Different column: change status
      return previousTasks.map((task) =>
        task.id === active.id
          ? {
              ...task,
              status: targetColumn.title,
            }
          : task
      );
    });
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

  return (
    <div className="min-h-screen bg-slate-50 p-5 sm:p-8">

      {/* Header */}
      <div className="mb-8">

        <button
          type="button"
          onClick={onBack}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {board.name}
            </h1>

            <p className="mt-2 text-slate-500">
              {board.description}
            </p>
          </div>

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

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.title
            );

            return (
              <KanbanColumn
                key={column.title}
                column={column}
                columnTasks={columnTasks}
                onEdit={handleEditClick}
                onDelete={handleDeleteTask}
                getPriorityColor={getPriorityColor}
              />
            );
          })}

        </div>
      </DndContext>

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
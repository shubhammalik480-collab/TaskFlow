import { useState } from "react";
import { X, ClipboardPlus } from "lucide-react";

function AddTaskModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    const newTask = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      priority,
      status: "To Do",
    };

    onCreate(newTask);

    setTitle("");
    setDescription("");
    setPriority("medium");

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <ClipboardPlus size={23} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Create New Task
              </h2>
              <p className="text-sm text-slate-500">
                Add a task to your board.
              </p>
            </div>
          </div>

          <button onClick={onClose} aria-label="Close modal">
            <X size={21} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Task Title *
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            required
            maxLength={100}
            className="mb-5 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your task..."
            rows="3"
            maxLength={500}
            className="mb-5 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Priority
          </label>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="mb-6 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Add Task
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default AddTaskModal;
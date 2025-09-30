import { useState } from 'react';

export default function AddTaskForm({ onTaskAdded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (response.ok) {
        setTitle('');
        setDescription('');
        onTaskAdded();
      } else {
        console.error('Failed to add task');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-row justify-center px-10 py-10">
      <div className="w-full max-w-3xl">
        <h1 className="mb-4 text-2xl font-bold text-center">Add New Task</h1>
        <div className="flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="flex flex-wrap justify-center gap-4">
            <div>
              <input
                type="text"
                placeholder="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="flex-grow input input-bordered input-accent"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Task Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="flex-grow input input-bordered input-accent"
              />
            </div>
            <div>
              <button type="submit" className="btn btn-primary">
                Add Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
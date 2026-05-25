import { useState } from 'react';

const initialForm = { title: '', description: '', dueDate: '' };

export default function TaskForm({ onAdd }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Task title is required.');
      return;
    }

    setLoading(true);
    try {
      await onAdd(form);
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {error && <div className="alert">{error}</div>}
      <input name="title" placeholder="Task title" value={form.title} onChange={handleChange} />
      <textarea name="description" placeholder="Write a note..." value={form.description} onChange={handleChange} rows="3" />
      <label className="field-label">
        Deadline
        <input name="dueDate" type="datetime-local" value={form.dueDate} onChange={handleChange} />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add task'}
      </button>
    </form>
  );
}

import { useState } from 'react';

const toDateTimeInputValue = (date) => {
  if (!date) {
    return '';
  }

  const parsedDate = new Date(date);
  const timezoneOffset = parsedDate.getTimezoneOffset() * 60000;
  return new Date(parsedDate.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const formatDeadline = (date) => {
  if (!date) {
    return 'No deadline';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));
};

export default function TaskItem({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    completed: task.completed,
    dueDate: toDateTimeInputValue(task.dueDate)
  });

  const handleChange = (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm({ ...form, [event.target.name]: value });
  };

  const saveTask = async () => {
    await onUpdate(task._id, form);
    setEditing(false);
  };

  const toggleComplete = async () => {
    await onUpdate(task._id, { ...task, completed: !task.completed });
  };

  const editTask = () => {
    setForm({
      title: task.title,
      description: task.description || '',
      completed: task.completed,
      dueDate: toDateTimeInputValue(task.dueDate)
    });
    setEditing(true);
  };

  return (
    <tr className={task.completed ? 'completed' : ''}>
      {editing ? (
        <>
          <td data-label="Status">
            <label className="checkbox-row">
              <input name="completed" type="checkbox" checked={form.completed} onChange={handleChange} />
              Done
            </label>
          </td>
          <td data-label="Task details">
            <div className="edit-form">
              <input name="title" value={form.title} onChange={handleChange} />
              <textarea name="description" value={form.description} onChange={handleChange} rows="2" />
            </div>
          </td>
          <td data-label="Deadline">
            <input name="dueDate" type="datetime-local" value={form.dueDate} onChange={handleChange} />
          </td>
          <td data-label="Actions">
            <div className="task-actions">
              <button type="button" onClick={saveTask}>Save</button>
              <button type="button" className="secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </td>
        </>
      ) : (
        <>
          <td data-label="Status">
            <label className="check">
              <input type="checkbox" checked={task.completed} onChange={toggleComplete} />
              <span>{task.completed ? 'Done' : 'To do'}</span>
            </label>
          </td>
          <td className="task-content" data-label="Task details">
            <h2>{task.title}</h2>
            {task.description && <p>{task.description}</p>}
          </td>
          <td className="deadline" data-label="Deadline">
            <span>{formatDeadline(task.dueDate)}</span>
          </td>
          <td data-label="Actions">
            <div className="task-actions">
              <button type="button" className="secondary" onClick={editTask}>Edit</button>
              {task.completed && (
                <button type="button" className="danger" onClick={() => onDelete(task._id)}>
                  Delete
                </button>
              )}
            </div>
          </td>
        </>
      )}
    </tr>
  );
}

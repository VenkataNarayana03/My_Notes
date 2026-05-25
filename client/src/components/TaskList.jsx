import TaskItem from './TaskItem.jsx';

export default function TaskList({ tasks, onUpdate, onDelete }) {
  if (!tasks.length) {
    return <p className="empty">No tasks yet. Add your first task on the left.</p>;
  }

  return (
    <div className="task-table-wrap">
      <table className="task-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Task details</th>
            <th>Deadline</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <TaskItem key={task._id} task={task} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

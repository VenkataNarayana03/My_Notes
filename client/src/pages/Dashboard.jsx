import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import TaskForm from '../components/TaskForm.jsx';
import TaskList from '../components/TaskList.jsx';
import api from '../services/api.js';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (task) => {
    const { data } = await api.post('/tasks', task);
    setTasks((currentTasks) => [data, ...currentTasks]);
  };

  const updateTask = async (id, task) => {
    const { data } = await api.put(`/tasks/${id}`, task);
    setTasks((currentTasks) => currentTasks.map((item) => (item._id === id ? data : item)));
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks((currentTasks) => currentTasks.filter((task) => task._id !== id));
  };

  const activeTaskCount = tasks.filter((task) => !task.completed).length;

  return (
    <main className="app-page">
      <Navbar />
      <section className="dashboard">
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Your task notes</h1>
          </div>
          <span className="task-count">{activeTaskCount} active</span>
        </div>

        <div className="dashboard-grid">
          <aside className="task-entry-panel">
            <p className="eyebrow">Add Task</p>
            <h2>New task details</h2>
            <TaskForm onAdd={addTask} />
          </aside>

          <section className="task-table-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">To Do</p>
                <h2>Tasks table</h2>
              </div>
              <span className="muted">{tasks.length} total</span>
            </div>
            {error && <div className="alert">{error}</div>}
            {loading ? <p className="muted">Loading tasks...</p> : <TaskList tasks={tasks} onUpdate={updateTask} onDelete={deleteTask} />}
          </section>
        </div>
      </section>
    </main>
  );
}

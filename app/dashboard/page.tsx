'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';

interface Task {
	id: string;
	title: string;
	completed: boolean;
}

interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
}

export default function DashboardPage() {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [taskTitle, setTaskTitle] = useState('');
	const [tasks, setTasks] = useState<Task[]>([]);

	useEffect(() => {
		const auth = localStorage.getItem('auth_user');
		if (!auth) {
			router.push('/');
		} else {
			setUser(JSON.parse(auth));
		}

		const storedTasks = localStorage.getItem('tasks');
		if (storedTasks) {
			setTasks(JSON.parse(storedTasks));
		}
	}, []);

	const saveTasks = (updated: Task[]) => {
		setTasks(updated);
		localStorage.setItem('tasks', JSON.stringify(updated));
	};

	const handleAddTask = () => {
		if (!taskTitle.trim()) return;

		const newTask: Task = {
			id: Date.now().toString(),
			title: taskTitle.trim(),
			completed: false,
		};

		const updated = [newTask, ...tasks];
		saveTasks(updated);
		setTaskTitle('');
	};

	const toggleComplete = (id: string) => {
		const updated = tasks.map(t =>
			t.id === id ? { ...t, completed: !t.completed } : t
		);
		saveTasks(updated);
	};

	const deleteTask = (id: string) => {
		const updated = tasks.filter(t => t.id !== id);
		saveTasks(updated);
	};

	const logout = () => {
		localStorage.removeItem('auth_user');
		router.push('/');
	};

	if (!user) return null;

	return (
		<Wrapper>
			<Header>
				<h1>Hello, {user.firstName} 👋</h1>
				<LogoutButton onClick={logout}>Logout</LogoutButton>
			</Header>

			<AddTaskWrapper>
				<TaskInput
					placeholder="Enter new task..."
					value={taskTitle}
					onChange={e => setTaskTitle(e.target.value)}
				/>
				<AddButton onClick={handleAddTask}>Add</AddButton>
			</AddTaskWrapper>

			<TaskList>
				{tasks.length === 0 ? (
					<Empty>No tasks yet. Add one above!</Empty>
				) : (
					tasks.map(task => (
						<TaskItem key={task.id}>
							<Checkbox
								type="checkbox"
								checked={task.completed}
								onChange={() => toggleComplete(task.id)}
							/>
							<TaskText completed={task.completed}>{task.title}</TaskText>
							<Delete onClick={() => deleteTask(task.id)}>🗑</Delete>
						</TaskItem>
					))
				)}
			</TaskList>
		</Wrapper>
	);
}

// Styled Components

const Wrapper = styled.div`
  padding: 40px;
  max-width: 600px;
  margin: auto;
  font-family: Arial, sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const LogoutButton = styled.button`
  padding: 6px 14px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: #c53030;
  }
`;

const AddTaskWrapper = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
`;

const TaskInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
`;

const AddButton = styled.button`
  padding: 12px 18px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: #4338ca;
  }
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TaskItem = styled.div`
  background: #f9f9f9;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
`;

const TaskText = styled.span<{ completed: boolean }>`
  flex: 1;
  font-size: 15px;
  text-decoration: ${({ completed }) => (completed ? 'line-through' : 'none')};
  color: ${({ completed }) => (completed ? '#aaa' : '#333')};
`;

const Checkbox = styled.input`
  cursor: pointer;
  width: 18px;
  height: 18px;
`;

const Delete = styled.span`
  cursor: pointer;
  font-size: 18px;
  color: #e53e3e;
`;

const Empty = styled.p`
  text-align: center;
  color: #888;
  font-size: 15px;
`;


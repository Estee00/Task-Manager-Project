'use client';

import { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { SlOptionsVertical } from 'react-icons/sl';
import { FaInfoCircle } from 'react-icons/fa';

interface Task {
	id: string;
	title: string;
	completed: boolean;
	priority: 'normal' | 'high';
	createdAt: string;
	completedAt?: string;
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
	const [taskPriority, setTaskPriority] = useState<'normal' | 'high'>('normal');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editedTitle, setEditedTitle] = useState('');
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
	const [infoTaskId, setInfoTaskId] = useState<string | null>(null);
	const [filterType, setFilterType] = useState<'none' | 'priority' | 'date' | 'status'>('none');
	const [filterPriority, setFilterPriority] = useState<'all' | 'normal' | 'high'>('all');
	const [filterDate, setFilterDate] = useState<'all' | 'today' | 'tomorrow'>('all');
	const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'uncompleted'>('all');
	const [showFilterOptions, setShowFilterOptions] = useState(false);

	const wrapperRef = useRef<HTMLDivElement>(null);

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

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
				setSelectedTaskId(null);
				setEditingId(null);
				setShowFilterOptions(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
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
			priority: taskPriority,
			createdAt: new Date().toISOString(),
		};
		const updated = [newTask, ...tasks];
		saveTasks(updated);
		setTaskTitle('');
	};

	const toggleComplete = (id: string) => {
		const updated = tasks.map(t =>
			t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined } : t
		);
		saveTasks(updated);
		setSelectedTaskId(null);
		setEditingId(null);
	};

	const deleteTask = (id: string) => {
		const updated = tasks.filter(t => t.id !== id);
		saveTasks(updated);
	};

	const handleEditTask = (id: string, currentTitle: string) => {
		setEditingId(id);
		setEditedTitle(currentTitle);
	};

	const saveEditedTask = (id: string) => {
		const updated = tasks.map(t => t.id === id ? { ...t, title: editedTitle } : t);
		saveTasks(updated);
		setEditingId(null);
		setEditedTitle('');
	};

	const logout = () => {
		localStorage.removeItem('auth_user');
		router.push('/');
	};

	if (!user) return null;

	// Group tasks by date for section headers
	const groupTasksByDate = () => {
		let filtered = tasks;
		if (filterType === 'priority') {
			filtered = filtered.filter(task => filterPriority === 'all' || task.priority === filterPriority);
		}
		if (filterType === 'date') {
			filtered = filtered.filter(task => {
				const taskDate = new Date(task.createdAt);
				const today = new Date();
				const isToday = taskDate.toDateString() === today.toDateString();
				const isTomorrow = taskDate.toDateString() === new Date(today.setDate(today.getDate() + 1)).toDateString();
				return filterDate === 'all' || (filterDate === 'today' && isToday) || (filterDate === 'tomorrow' && isTomorrow);
			});
		}
		if (filterType === 'status') {
			filtered = filtered.filter(task => {
				if (filterStatus === 'completed') return task.completed;
				if (filterStatus === 'uncompleted') return !task.completed;
				return true;
			});
		}
		const groups: { [key: string]: Task[] } = {};
		filtered.forEach(task => {
			const date = new Date(task.createdAt);
			const key = date.toLocaleDateString('en-GB', {
				weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
			});
			if (!groups[key]) groups[key] = [];
			groups[key].push(task);
		});
		return groups;
	};

	const groupedTasks = groupTasksByDate();

	return (
		<Wrapper ref={wrapperRef}>
			<TopRight><LogoutButton onClick={logout}>Logout</LogoutButton></TopRight>
			<Header>
				<HeaderLeft>
					<h1>Welcome, {user.firstName} 👋</h1>
					<p style={{ color: '#666', fontSize: '14px' }}>Manage your day efficiently</p>
				</HeaderLeft>

				<HeaderRight>
					{/* Fixed filter absolute positioning */}
					<FilterWrapper>
						<FilterButton onClick={() => setShowFilterOptions(!showFilterOptions)}>
							<SlOptionsVertical />
						</FilterButton>
						{showFilterOptions && (
							<FilterDropdown>
								{/* Priority Filter */}
								<button onClick={() => setFilterType('priority')}>Filter by Priority</button>
								{filterType === 'priority' && (
									<select value={filterPriority} onChange={e => setFilterPriority(e.target.value as 'all' | 'normal' | 'high')}>
										<option value="all">All</option>
										<option value="normal">Normal</option>
										<option value="high">High</option>
									</select>
								)}

								{/* Date Filter */}
								<button onClick={() => setFilterType('date')}>Filter by Date</button>
								{filterType === 'date' && (
									<select value={filterDate} onChange={e => setFilterDate(e.target.value as 'all' | 'today' | 'tomorrow')}>
										<option value="all">All Dates</option>
										<option value="today">Today</option>
										<option value="tomorrow">Tomorrow</option>
									</select>
								)}

								{/* Status Filter */}
								<button onClick={() => setFilterType('status')}>Filter by Status</button>
								{filterType === 'status' && (
									<select value={filterStatus} onChange={e => setFilterStatus(e.target.value as 'all' | 'completed' | 'uncompleted')}>
										<option value="all">All</option>
										<option value="completed">Completed</option>
										<option value="uncompleted">Uncompleted</option>
									</select>
								)}
							</FilterDropdown>
						)}
					</FilterWrapper>
				</HeaderRight>
			</Header>

			{/* Task Input Section */}
			<AddTaskWrapper>
				<TaskInput placeholder="Enter new task..." value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
				<select value={taskPriority} onChange={e => setTaskPriority(e.target.value as 'normal' | 'high')}>
					<option value="normal">Normal</option>
					<option value="high">High Priority</option>
				</select>
				<AddButton onClick={handleAddTask}>Add</AddButton>
			</AddTaskWrapper>

			{/* Grouped Tasks Display */}
			{Object.entries(groupedTasks).map(([date, tasks]) => (
				<div key={date}>
					<h3>{date}</h3>
					{tasks.map((task, index) => (
						<TaskItem key={task.id} style={{ borderLeft: task.priority === 'high' ? '5px solid red' : '5px solid transparent' }}>
							<Row onClick={() => !task.completed && setSelectedTaskId(task.id)}>
								<Checkbox type="checkbox" checked={task.completed} onChange={() => toggleComplete(task.id)} />
								<span style={{ marginRight: '8px' }}>{index + 1}.</span>

								{editingId === task.id ? (
									<>
										<TaskInput value={editedTitle} onChange={e => setEditedTitle(e.target.value)} style={{ flex: 1 }} />
										<AddButton onClick={() => saveEditedTask(task.id)}>✅</AddButton>
									</>
								) : (
									<>
										<TaskText completed={task.completed}>{task.title}</TaskText>
										<Delete onClick={() => deleteTask(task.id)}>🗑</Delete>
										{selectedTaskId === task.id && !task.completed && (
											<Delete onClick={() => handleEditTask(task.id, task.title)}>✏️</Delete>
										)}
										<InfoIcon onClick={() => setInfoTaskId(task.id === infoTaskId ? null : task.id)}>
											<FaInfoCircle />
										</InfoIcon>
									</>
								)}
							</Row>

							{/* Info Dropdown for Dates */}
							{infoTaskId === task.id && (
								<InfoText>
									Created: {new Date(task.createdAt).toLocaleString()}<br />
									{task.completed && task.completedAt && (
										<span>Completed: {new Date(task.completedAt).toLocaleString()}</span>
									)}
								</InfoText>
							)}
						</TaskItem>
					))}
				</div>
			))}
		</Wrapper>
	);
}

/* Styled Components Below */

const Wrapper = styled.div`
  padding: 40px;
  max-width: 900px;
  margin: auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(to right, #f0f4ff, #fafcff);
  border-radius: 12px;
  position: relative;
`;

const TopRight = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
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

const FilterWrapper = styled.div`
  position: relative;
`;

const FilterButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #333;
`;

const FilterDropdown = styled.div`
  position: absolute;
  top: 30px;
  right: 0;
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 150px;
  z-index: 50;
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

const TaskItem = styled.div`
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 10px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TaskText = styled(({ completed, ...rest }) => <span {...rest} />)<{ completed: boolean }>`
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

const InfoIcon = styled.span`
  cursor: pointer;
  font-size: 16px;
  color: #555;
`;

const InfoText = styled.p`
  font-size: 12px;
  color: #666;
  margin-left: 30px;
`;
